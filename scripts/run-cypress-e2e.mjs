import { createServer } from "vite";

const DEFAULT_PORT = 8261;
const HOST = "127.0.0.1";

const parseMode = (rawMode) => {
  const mode = rawMode ?? "run";

  if (mode === "run" || mode === "open") {
    return mode;
  }

  throw new Error(`Unsupported Cypress mode "${mode}". Use "run" or "open".`);
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

let server;

const closeServer = async () => {
  if (!server) {
    return;
  }

  const activeServer = server;
  server = undefined;
  await activeServer.close();
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
  const originalCi = process.env.CI;

  // Vite registers a stdin-end exit handler outside CI; Cypress closes stdin while spawning.
  if (originalCi === undefined) {
    process.env.CI = "true";
  }

  try {
    server = await createServer({
      server: {
        host: HOST,
        port,
        strictPort: true,
      },
    });
  } finally {
    if (originalCi === undefined) {
      delete process.env.CI;
    } else {
      process.env.CI = originalCi;
    }
  }

  await server.listen();
  server.printUrls();
};

let cypressModule;

const getCypress = async () => {
  if (!cypressModule) {
    const imported = await import("cypress");

    cypressModule = imported.default;
  }

  return cypressModule;
};

const runCypress = async (baseUrl) => {
  const cypress = await getCypress();
  console.info(`Starting Cypress E2E run against ${baseUrl}.`);
  const runOptions = await cypress.cli.parseRunArguments([
    "cypress",
    "run",
    "--e2e",
    "--project",
    process.cwd(),
    "--config",
    `baseUrl=${baseUrl}`,
    "--posix-exit-codes",
  ]);
  const result = await cypress.run(runOptions);
  console.info("Cypress E2E run finished.");

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

  try {
    process.exitCode =
      mode === "open" ? await openCypress(baseUrl) : await runCypress(baseUrl);
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
