import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import http from "node:http";
import { join } from "node:path";

const DEFAULT_PORT = 8261;
const HOST = "127.0.0.1";
const STARTUP_SETTLE_DELAY_MS = 10_000;
const WINDOWS_SPEC_ATTEMPTS = 2;
const WINDOWS_SPEC_TIMEOUT_MS = 2 * 60 * 1000;

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

  if (typeof result?.totalTests === "number") {
    const runFailures = Array.isArray(result.runs)
      ? result.runs.reduce(
          (total, run) => total + (run.stats?.failures ?? 0),
          0,
        )
      : 0;
    const unresolvedTests =
      (result.totalTests ?? 0) -
      (result.totalPassed ?? 0) -
      (result.totalPending ?? 0) -
      (result.totalSkipped ?? 0);
    const totalFailed = Math.max(
      result.totalFailed ?? 0,
      runFailures,
      unresolvedTests,
    );

    console.info(
      `Cypress completed: ${result.totalPassed ?? 0}/${result.totalTests ?? 0} tests passed.`,
    );

    return totalFailed === 0 ? 0 : 1;
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

const terminateChildProcessTree = async (child, label) => {
  if (!child?.pid) {
    return;
  }

  if (process.platform !== "win32") {
    child.kill("SIGTERM");
    return;
  }

  await new Promise((resolve) => {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "inherit",
      windowsHide: true,
    });

    killer.once("error", (error) => {
      console.warn(`${label} process-tree cleanup warning: ${error.message}`);
      try {
        child.kill();
      } catch (killError) {
        console.warn(`${label} cleanup warning: ${killError.message}`);
      }
      resolve();
    });

    killer.once("close", () => resolve());
  });
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

const listE2ESpecs = async () => {
  const specsDirectory = join(process.cwd(), "cypress", "e2e");
  const entries = await readdir(specsDirectory, { withFileTypes: true });
  const specs = entries
    .filter((entry) => entry.isFile() && /\.cy\.[jt]sx?$/.test(entry.name))
    .map((entry) => join("cypress", "e2e", entry.name))
    .sort((left, right) => left.localeCompare(right));

  if (specs.length === 0) {
    throw new Error("No Cypress E2E specs found in cypress/e2e.");
  }

  return specs;
};
const getCypressRunConfig = (baseUrl, specPattern) => {
  const config = [
    `baseUrl=${baseUrl}`,
    "numTestsKeptInMemory=0",
    "experimentalMemoryManagement=true",
  ];

  if (specPattern) {
    config.push(`specPattern=${specPattern}`);
  }

  return config;
};

const runCypress = async (
  baseUrl,
  { label = "E2E", spec, specPattern } = {},
) => {
  const cypress = await getCypress();
  console.info(`Starting Cypress ${label} run against ${baseUrl}.`);
  const config = getCypressRunConfig(baseUrl, specPattern);

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

const runCypressCli = async (
  baseUrl,
  {
    label = "E2E",
    spec,
    specPattern,
    timeoutMs = WINDOWS_SPEC_TIMEOUT_MS,
  } = {},
) =>
  new Promise((resolve) => {
    const config = getCypressRunConfig(baseUrl, specPattern);
    const args = [
      join("node_modules", "cypress", "bin", "cypress"),
      "run",
      "--e2e",
      "--project",
      process.cwd(),
      "--config",
      config.join(","),
      ...(spec ? ["--spec", spec] : []),
      "--posix-exit-codes",
    ];
    let timedOut = false;

    console.info(`Starting Cypress ${label} run against ${baseUrl}.`);

    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        CI: "true",
      },
      shell: false,
      stdio: "inherit",
      windowsHide: true,
    });

    const timeoutId = setTimeout(() => {
      timedOut = true;
      console.error(
        `Cypress ${label} exceeded ${Math.round(timeoutMs / 1000)}s; terminating process tree.`,
      );
      void terminateChildProcessTree(child, `Cypress ${label}`);
    }, timeoutMs);

    child.once("error", (error) => {
      clearTimeout(timeoutId);
      console.error(`Cypress ${label} failed to start.`);
      console.error(error);
      resolve(1);
    });

    child.once("close", (code, signal) => {
      clearTimeout(timeoutId);
      console.info(`Cypress ${label} run finished.`);

      if (code === 0 && signal === null && !timedOut) {
        resolve(0);
        return;
      }

      resolve(1);
    });
  });
const runCypressPerSpec = async (baseUrl) => {
  const specs = await listE2ESpecs();
  let failedSpecs = 0;
  console.info(
    `Running Cypress E2E as ${specs.length} separate spec run(s) on Windows to reduce Electron renderer pressure.`,
  );

  for (const [index, spec] of specs.entries()) {
    let exitCode = 1;

    for (let attempt = 1; attempt <= WINDOWS_SPEC_ATTEMPTS; attempt += 1) {
      if (attempt > 1) {
        console.warn(
          `Retrying Cypress E2E spec ${index + 1}/${specs.length} after a failed Windows browser run.`,
        );
      }

      exitCode = await runCypressCli(baseUrl, {
        label:
          attempt === 1
            ? `E2E ${index + 1}/${specs.length}`
            : `E2E ${index + 1}/${specs.length} attempt ${attempt}/${WINDOWS_SPEC_ATTEMPTS}`,
        spec,
      });

      if (exitCode === 0) {
        break;
      }
    }

    if (exitCode !== 0) {
      failedSpecs += 1;
    }
  }

  if (failedSpecs > 0) {
    console.error(
      `Cypress E2E failed in ${failedSpecs}/${specs.length} separate spec run(s).`,
    );
    return 1;
  }

  return 0;
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

let requestedExitCode = 0;

try {
  const mode = parseMode(process.argv[2]);
  const port = parsePort(process.env.CYPRESS_PORT);
  const baseUrl = `http://${HOST}:${port}`;

  installSignalHandlers();
  await startServer(port);
  await waitForServer(baseUrl);
  await wait(STARTUP_SETTLE_DELAY_MS);

  try {
    requestedExitCode =
      mode === "open"
        ? await openCypress(baseUrl)
        : mode === "a11y"
          ? await runCypress(baseUrl, {
              label: "accessibility",
              spec: "cypress/a11y/test_accessibility.cy.ts",
              specPattern: "cypress/a11y/**/*.cy.ts",
            })
          : mode === "run" && process.platform === "win32"
            ? await runCypressPerSpec(baseUrl)
            : await runCypress(baseUrl);
  } catch (error) {
    console.error("Cypress failed before completing the requested mode.");
    console.error(error);
    requestedExitCode = 1;
  } finally {
    await closeServer();
  }
} catch (error) {
  console.error(error);
  requestedExitCode = 1;
}

process.exit(requestedExitCode);
