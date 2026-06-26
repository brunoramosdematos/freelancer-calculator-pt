import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import { join } from "node:path";
import process from "node:process";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const host = "127.0.0.1";
const port = 4173;
const baseUrl = `http://${host}:${port}`;
const urls = ["/#/", "/#/?income=60000", "/#/about"];
const thresholds = {
  performance: 0.4,
  accessibility: 0.9,
  "best-practices": 0.9,
  seo: 0.9,
};

let previewProcess;
let chrome;
let stopping = false;

const fail = (message) => {
  throw new Error(message);
};

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const assertPortAvailable = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      reject(
        new Error(
          `Port ${port} on ${host} is not available for Lighthouse preview: ${error.message}`,
        ),
      );
    });
    server.once("listening", () => {
      server.close(resolve);
    });
    server.listen(port, host);
  });

const waitForPreview = async () => {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const ready = await new Promise((resolve) => {
      const request = http.get(baseUrl, (response) => {
        response.resume();
        resolve(response.statusCode && response.statusCode < 500);
      });

      request.on("error", () => resolve(false));
      request.setTimeout(1_000, () => {
        request.destroy();
        resolve(false);
      });
    });

    if (ready) {
      return;
    }

    await wait(250);
  }

  fail(`Timed out waiting for Vite preview at ${baseUrl}.`);
};

const startPreview = async () => {
  if (!existsSync(join("dist", "index.html"))) {
    fail("dist/index.html is missing. Run npm run build before Lighthouse.");
  }

  await assertPortAvailable();

  previewProcess = spawn(
    process.execPath,
    [
      join("node_modules", "vite", "bin", "vite.js"),
      "preview",
      "--host",
      host,
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        CI: "true",
      },
    },
  );

  previewProcess.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  previewProcess.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  previewProcess.once("exit", (code) => {
    if (!stopping && code !== 0) {
      console.error(`Vite preview exited unexpectedly with code ${code}.`);
    }
  });

  await waitForPreview();
};

const stopChildProcess = async (child, label) => {
  if (!child || child.killed) {
    return;
  }

  await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    child.once("exit", finish);

    try {
      child.kill();
    } catch (error) {
      console.warn(`${label} cleanup warning: ${error.message}`);
      finish();
      return;
    }

    setTimeout(() => {
      if (settled) {
        return;
      }

      try {
        child.kill("SIGKILL");
      } catch (error) {
        console.warn(`${label} force cleanup warning: ${error.message}`);
      }
    }, 2_000);

    setTimeout(() => {
      if (!settled) {
        console.warn(`${label} cleanup timed out; releasing process handles.`);
        child.stdout?.destroy();
        child.stderr?.destroy();
        child.stdin?.destroy();
        child.unref();
      }

      finish();
    }, 5_000);
  });
};

const stopPreview = async () => {
  if (!previewProcess || previewProcess.killed) {
    return;
  }

  stopping = true;
  const child = previewProcess;
  previewProcess = undefined;
  await stopChildProcess(child, "Vite preview");
};

const closeChrome = async () => {
  if (!chrome) {
    return;
  }

  const activeChrome = chrome;
  chrome = undefined;

  await stopChildProcess(activeChrome.process, "Chrome");
};

const cleanup = async () => {
  await closeChrome();
  await stopPreview();
};

const installSignalHandlers = () => {
  const stop = async (exitCode) => {
    try {
      await cleanup();
    } finally {
      process.exit(exitCode);
    }
  };

  process.once("SIGINT", () => {
    void stop(130);
  });
  process.once("SIGTERM", () => {
    void stop(143);
  });
};

const runLighthouse = async (url) => {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: Object.keys(thresholds),
    formFactor: "desktop",
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  });

  if (!result?.lhr) {
    fail(`Lighthouse did not return a report for ${url}.`);
  }

  return result.lhr;
};

try {
  installSignalHandlers();
  await startPreview();
  chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new", "--disable-gpu", "--no-sandbox"],
  });

  const failures = [];

  for (const path of urls) {
    const url = `${baseUrl}${path}`;
    const lhr = await runLighthouse(url);
    const scoreSummary = [];

    for (const [category, minimum] of Object.entries(thresholds)) {
      const score = lhr.categories[category]?.score;

      if (typeof score !== "number") {
        failures.push(`${url}: missing ${category} score.`);
        continue;
      }

      scoreSummary.push(`${category}=${score.toFixed(2)}`);

      if (score < minimum) {
        failures.push(
          `${url}: ${category} score ${score.toFixed(2)} is below ${minimum.toFixed(
            2,
          )}.`,
        );
      }
    }

    console.log(`Lighthouse ${url}: ${scoreSummary.join(", ")}`);
  }

  if (failures.length > 0) {
    console.error("Lighthouse thresholds failed:");
    failures.forEach((message) => console.error(`- ${message}`));
    process.exitCode = 1;
  } else {
    console.log("Lighthouse thresholds verified.");
  }
} catch (error) {
  console.error("Lighthouse smoke check failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await cleanup();
}
