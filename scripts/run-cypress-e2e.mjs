import { spawn } from "node:child_process";
import http from "node:http";
import { join } from "node:path";

const DEFAULT_PORT = 8261;
const HOST = "127.0.0.1";

const parseMode = (rawMode) => {
  const mode = rawMode ?? "run";

  if (mode === "run" || mode === "open" || mode === "a11y") {
    return mode;
  }

  throw new Error(
    `Unsupported Cypress mode "${mode}". Use "run", "open" or "a11y".`,
  );
};

const parsePort = (rawPort) => {
  if (rawPort === undefined || rawPort === "") {
    return DEFAULT_PORT;
  }

  if (!/^\d+$/.test(rawPort)) {
    throw new Error("CYPRESS_PORT must be an integer between 1 and 65535.");
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("CYPRESS_PORT must be an integer between 1 and 65535.");
  }

  return port;
};

const getRunExitCode = (result) => {
  if (typeof result?.failures === "number" && result.failures > 0) {
    if (result.message) {
      console.error(result.message);
    }

    return 1;
  }

  if (typeof result?.totalFailed === "number") {
    console.info(
      `Cypress completed: ${result.totalPassed ?? 0}/${result.totalTests ?? 0} tests passed.`,
    );

    return result.totalFailed === 0 ? 0 : 1;
  }

  console.error("Cypress returned an unexpected result object.");
  return 1;
};

let serverProcess;
let stopping = false;

const closeServer = async () => {
  if (!serverProcess || serverProcess.killed) {
    return;
  }

  stopping = true;
  const child = serverProcess;
  serverProcess = undefined;
  await stopChildProcess(child, "Vite dev server");
};

const installSignalHandlers = () => {
  const stop = async (exitCode) => {
    try {
      await closeServer();
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

const startServer = async (port) => {
  serverProcess = spawn(
    process.execPath,
    [
      join("node_modules", "vite", "bin", "vite.js"),
      "--host",
      HOST,
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

  serverProcess.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  serverProcess.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  serverProcess.once("exit", (code) => {
    if (!stopping && code !== 0) {
      console.error(`Vite dev server exited unexpectedly with code ${code}.`);
    }
  });
};

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const waitForServer = async (baseUrl) => {
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

  throw new Error(`Timed out waiting for Cypress server at ${baseUrl}.`);
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

let cypressModule;

const getCypress = async () => {
  if (!cypressModule) {
    const imported = await import("cypress");

    cypressModule = imported.default;
  }

  return cypressModule;
};

const runCypress = async (
  baseUrl,
  { label = "E2E", spec, specPattern } = {},
) => {
  const cypress = await getCypress();
  console.info(`Starting Cypress ${label} run against ${baseUrl}.`);
  const config = [`baseUrl=${baseUrl}`];

  if (specPattern) {
    config.push(`specPattern=${specPattern}`);
  }

  const runOptions = await cypress.cli.parseRunArguments([
    "cypress",
    "run",
    "--e2e",
    "--project",
    process.cwd(),
    "--config",
    config.join(","),
    ...(spec ? ["--spec", spec] : []),
    "--posix-exit-codes",
  ]);
  const result = await cypress.run(runOptions);
  console.info(`Cypress ${label} run finished.`);

  return getRunExitCode(result);
};

const openCypress = async (baseUrl) => {
  const cypress = await getCypress();

  await cypress.open({
    testingType: "e2e",
    project: process.cwd(),
    config: {
      baseUrl,
    },
  });

  return 0;
};

try {
  const mode = parseMode(process.argv[2]);
  const port = parsePort(process.env.CYPRESS_PORT);
  const baseUrl = `http://${HOST}:${port}`;

  installSignalHandlers();
  await startServer(port);
  await waitForServer(baseUrl);
  await wait(5_000);

  try {
    process.exitCode =
      mode === "open"
        ? await openCypress(baseUrl)
        : mode === "a11y"
          ? await runCypress(baseUrl, {
              label: "accessibility",
              spec: "cypress/a11y/test_accessibility.cy.ts",
              specPattern: "cypress/a11y/**/*.cy.ts",
            })
          : await runCypress(baseUrl);
  } catch (error) {
    console.error("Cypress failed before completing the requested mode.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await closeServer();
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
