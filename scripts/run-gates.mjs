import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const FOUR_MINUTES = 4 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

const CHECK_STEPS = [
  {
    name: "audit:prod",
    args: ["audit", "--omit=dev", "--audit-level=moderate"],
  },
  { name: "audit:critical", args: ["audit", "--audit-level=critical"] },
  { name: "format:check", args: ["run", "format:check"] },
  { name: "lint", args: ["run", "lint"] },
  { name: "typecheck", args: ["run", "typecheck"] },
  { name: "vitest", args: ["run", "vitest", "--", "--run"] },
  { name: "build", args: ["run", "build"] },
  {
    name: "verify:production-build",
    args: ["run", "verify:production-build"],
  },
];

const RELEASE_EXTRA_STEPS = [
  { name: "verify:bundle-budget", args: ["run", "verify:bundle-budget"] },
  {
    name: "lighthouse:ci",
    args: ["run", "lighthouse:ci"],
    retryOnWindowsFailure: true,
  },
  {
    name: "cy:e2e:run",
    args: ["run", "cy:e2e:run"],
    retryOnWindowsFailure: true,
    timeoutMs: TEN_MINUTES,
  },
  {
    name: "cy:a11y",
    args: ["run", "cy:a11y"],
    retryOnWindowsFailure: true,
    timeoutMs: FOUR_MINUTES,
  },
  {
    name: "verify:release-readiness",
    args: ["run", "verify:release-readiness"],
  },
];

const MODES = new Map([
  ["check", CHECK_STEPS],
  ["release", [...CHECK_STEPS, ...RELEASE_EXTRA_STEPS]],
]);

const COMPONENTS = new Map(
  [...CHECK_STEPS, ...RELEASE_EXTRA_STEPS].map((step) => [step.name, [step]]),
);

const formatDuration = (startedAt) =>
  `${((performance.now() - startedAt) / 1000).toFixed(2)}s`;

const WINDOWS_ACCESS_VIOLATION_CODES = new Set([3221225477, -1073741819]);
const MAX_RETRY_ATTEMPTS = 2;

const isWindowsAccessViolation = (code, signal) =>
  process.platform === "win32" &&
  signal === null &&
  WINDOWS_ACCESS_VIOLATION_CODES.has(code);

const isRetryableWindowsStepFailure = (step, result) =>
  process.platform === "win32" &&
  step.retryOnWindowsFailure === true &&
  (result.timedOut === true || (result.signal === null && result.code !== 0));

const getRetryReason = (step, result) => {
  if (isWindowsAccessViolation(result.code, result.signal)) {
    return `Windows native process crash (${result.code})`;
  }

  if (isRetryableWindowsStepFailure(step, result)) {
    return result.timedOut === true
      ? "Windows Cypress/browser runner timeout"
      : "Windows Cypress/browser runner failure";
  }

  return null;
};

const firstPathEntries = () =>
  (process.env.PATH ?? "")
    .split(process.platform === "win32" ? ";" : ":")
    .filter(Boolean)
    .slice(0, 6);

const terminateProcessTree = (child) => {
  if (!child.pid) {
    return;
  }

  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "inherit",
      windowsHide: true,
    });

    killer.on("error", (error) => {
      console.error(`Failed to run taskkill for process ${child.pid}.`);
      console.error(error);
      child.kill();
    });
    return;
  }

  child.kill("SIGTERM");
};

const resolveNpmInvocation = () => {
  if (process.env.npm_execpath && existsSync(process.env.npm_execpath)) {
    return {
      command: process.execPath,
      prefixArgs: [process.env.npm_execpath],
      source: "npm_execpath",
    };
  }

  const nodeDirectory = dirname(process.execPath);
  const bundledNpmCli = [
    join(nodeDirectory, "node_modules", "npm", "bin", "npm-cli.js"),
    join(
      nodeDirectory,
      "..",
      "lib",
      "node_modules",
      "npm",
      "bin",
      "npm-cli.js",
    ),
  ].find((candidate) => existsSync(candidate));

  if (bundledNpmCli) {
    return {
      command: process.execPath,
      prefixArgs: [bundledNpmCli],
      source: "bundled npm-cli.js",
    };
  }

  const command = process.platform === "win32" ? "npm.cmd" : "npm";

  return {
    command,
    prefixArgs: [],
    source: "PATH fallback",
    warning:
      "npm_execpath and bundled npm-cli.js were not found; falling back to npm from PATH.",
  };
};

const printRuntime = (npmInvocation) => {
  console.log("Gate runner runtime");
  console.log(`- node: ${process.execPath}`);
  console.log(`- version: ${process.version}`);
  console.log(`- v8: ${process.versions.v8}`);
  console.log(`- platform: ${process.platform} ${process.arch}`);
  console.log(`- npm_execpath: ${process.env.npm_execpath ?? "(not set)"}`);
  console.log(`- npm invocation source: ${npmInvocation.source}`);
  console.log(
    `- npm command: ${[npmInvocation.command, ...npmInvocation.prefixArgs].join(
      " ",
    )}`,
  );
  console.log("- PATH first entries:");
  firstPathEntries().forEach((entry) => console.log(`  - ${entry}`));

  if (npmInvocation.warning) {
    console.warn(`WARNING: ${npmInvocation.warning}`);
  }
};

const assertNode24 = () => {
  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);

  if (major !== 24) {
    console.error(
      `This gate runner requires Node 24.x. Current runtime is ${process.version}.`,
    );
    process.exit(1);
  }
};

const runStepAttempt = (step, index, total, npmInvocation, attempt) =>
  new Promise((resolve) => {
    const command = npmInvocation.command;
    const args = [...npmInvocation.prefixArgs, ...step.args];
    const startedAt = performance.now();
    const env = { ...process.env };
    let timedOut = false;
    let timeoutId;

    console.log("");
    console.log(`=== [${index + 1}/${total}] ${step.name} ===`);
    if (attempt > 1) {
      console.log(`attempt: ${attempt}/${MAX_RETRY_ATTEMPTS}`);
    }
    console.log(`command: ${[command, ...args].join(" ")}`);

    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      shell: false,
      stdio: "inherit",
      windowsHide: true,
    });

    if (step.timeoutMs) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        console.error(
          `Step ${step.name} exceeded ${Math.round(step.timeoutMs / 1000)}s; terminating process tree.`,
        );
        terminateProcessTree(child);
      }, step.timeoutMs);
    }

    child.on("error", (error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.error(`Step ${step.name} failed to start.`);
      console.error(error);
      resolve({
        ok: false,
        code: 1,
        signal: null,
        command,
        args,
        duration: formatDuration(startedAt),
        timedOut,
      });
    });

    child.on("close", (code, signal) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const ok = code === 0 && signal === null && !timedOut;
      const duration = formatDuration(startedAt);

      console.log(
        `=== ${ok ? "PASS" : "FAIL"} ${step.name} duration=${duration} exit=${code ?? "(none)"} signal=${signal ?? "(none)"} timeout=${timedOut ? "yes" : "no"} ===`,
      );

      resolve({ ok, code, signal, command, args, duration, timedOut });
    });
  });

const runStep = async (step, index, total, npmInvocation) => {
  let lastResult;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    lastResult = await runStepAttempt(
      step,
      index,
      total,
      npmInvocation,
      attempt,
    );

    const retryReason = getRetryReason(step, lastResult);

    if (!lastResult.ok && attempt < MAX_RETRY_ATTEMPTS && retryReason) {
      console.warn(`Retrying ${step.name} after ${retryReason}.`);
      continue;
    }

    return lastResult;
  }

  return lastResult;
};

const selectSteps = () => {
  const [mode, componentName] = process.argv.slice(2);

  if (mode === "component") {
    const steps = COMPONENTS.get(componentName);

    if (!steps) {
      console.error(
        `Unknown component "${componentName}". Available components: ${[
          ...COMPONENTS.keys(),
        ].join(", ")}`,
      );
      process.exit(1);
    }

    return { mode, steps };
  }

  const steps = MODES.get(mode);

  if (!steps) {
    console.error(
      "Usage: node scripts/run-gates.mjs <check|release|component <name>>",
    );
    process.exit(1);
  }

  return { mode, steps };
};

assertNode24();

const { mode, steps } = selectSteps();
const npmInvocation = resolveNpmInvocation();

printRuntime(npmInvocation);

for (const [index, step] of steps.entries()) {
  const result = await runStep(step, index, steps.length, npmInvocation);

  if (!result.ok) {
    console.error("");
    console.error("Gate runner stopped on failure.");
    console.error(`- step: ${step.name}`);
    console.error(`- command: ${[result.command, ...result.args].join(" ")}`);
    console.error(`- exit: ${result.code ?? "(none)"}`);
    console.error(`- signal: ${result.signal ?? "(none)"}`);
    console.error(`- timeout: ${result.timedOut === true ? "yes" : "no"}`);
    console.error(`- duration: ${result.duration}`);
    process.exit(result.code && result.code !== 0 ? result.code : 1);
  }
}

console.log("");
console.log(`All ${steps.length} ${mode} gate step(s) passed.`);
