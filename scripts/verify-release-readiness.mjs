import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const passes = [];

const resolve = (...parts) => path.join(root, ...parts);
const readText = (filePath) => readFileSync(resolve(filePath), "utf8");

const pass = (message) => passes.push(message);
const fail = (message) => failures.push(message);

const expectFile = (filePath) => {
  if (existsSync(resolve(filePath))) {
    pass(`${filePath} exists`);
    return true;
  }

  fail(`${filePath} is missing`);
  return false;
};

const packageJson = JSON.parse(readText("package.json"));

if (packageJson.name === "freelancer-calculator-pt") {
  pass("package.json name is freelancer-calculator-pt");
} else {
  fail(`package.json name is ${JSON.stringify(packageJson.name)}`);
}

if (/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
  pass(`package.json version ${packageJson.version} is semver-like`);
} else {
  fail(
    `package.json version ${JSON.stringify(packageJson.version)} is invalid`,
  );
}

if (packageJson.private === true) {
  pass("package.json private remains true");
} else {
  fail("package.json private must remain true");
}

const requiredFiles = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "docs/RELEASE_PROCESS.md",
  "docs/VERSIONING.md",
  "docs/TAX_UPDATE_POLICY.md",
  "docs/BRANCH_PROTECTION.md",
  "docs/QUALITY_GATES.md",
  "docs/I18N.md",
  "docs/THEMING.md",
  "docs/ACCESSIBILITY.md",
  "docs/PERFORMANCE.md",
  ".github/CODEOWNERS",
];

for (const filePath of requiredFiles) {
  expectFile(filePath);
}

if (expectFile("CHANGELOG.md")) {
  const changelog = readText("CHANGELOG.md");
  if (/^## \[Unreleased\]/m.test(changelog)) {
    pass("CHANGELOG.md has an [Unreleased] section");
  } else {
    fail("CHANGELOG.md must include an [Unreleased] section");
  }

  const versionPattern = new RegExp(
    `^## \\[${packageJson.version.replaceAll(".", "\\.")}\\]`,
    "m",
  );
  if (versionPattern.test(changelog)) {
    pass(`CHANGELOG.md has an entry for ${packageJson.version}`);
  } else {
    fail(`CHANGELOG.md must include an entry for ${packageJson.version}`);
  }
}

const issueTemplateDir = resolve(".github", "ISSUE_TEMPLATE");
if (
  existsSync(issueTemplateDir) &&
  readdirSync(issueTemplateDir).some((entry) => /\.(md|ya?ml)$/i.test(entry))
) {
  pass("issue templates exist");
} else {
  fail("issue templates are missing");
}

expectFile(".github/PULL_REQUEST_TEMPLATE.md");

const workflowPath = ".github/workflows/workflow.yml";
if (expectFile(workflowPath)) {
  const workflow = readText(workflowPath);
  const requiredJobs = [
    "quality",
    "vitest",
    "cypress-run",
    "production-audit",
    "accessibility-performance",
    "deploy",
  ];

  for (const job of requiredJobs) {
    if (new RegExp(`^  ${job}:`, "m").test(workflow)) {
      pass(`workflow contains job ${job}`);
    } else {
      fail(`workflow must contain job ${job}`);
    }
  }
}

const requiredScripts = [
  "check",
  "check:release",
  "verify:release-readiness",
  "verify:bundle-budget",
  "lighthouse:ci",
  "cy:a11y",
];

for (const scriptName of requiredScripts) {
  if (packageJson.scripts?.[scriptName]) {
    pass(`package script ${scriptName} exists`);
  } else {
    fail(`package script ${scriptName} is missing`);
  }
}

const placeholderPatterns = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bTBD\b/i,
  /recorded in final report/i,
  /final SHA to be filled/i,
];

const collectTextFiles = (dir) => {
  if (!existsSync(resolve(dir))) {
    return [];
  }

  const base = resolve(dir);
  const stack = [base];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      const absolute = path.join(current, entry);
      const stats = statSync(absolute);
      if (stats.isDirectory()) {
        stack.push(absolute);
      } else if (/\.(md|ya?ml)$/i.test(entry)) {
        files.push(path.relative(root, absolute).replaceAll(path.sep, "/"));
      }
    }
  }

  return files;
};

const placeholderFiles = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  ...collectTextFiles("docs"),
  ...collectTextFiles(".github"),
];

for (const filePath of placeholderFiles) {
  const content = readText(filePath);
  for (const pattern of placeholderPatterns) {
    if (pattern.test(content)) {
      fail(`${filePath} contains unresolved placeholder ${pattern}`);
    }
  }
}

if (!failures.some((failure) => failure.includes("placeholder"))) {
  pass("documentation contains no unresolved placeholders");
}

console.log("Release readiness verification");
console.log("");
for (const message of passes) {
  console.log(`PASS ${message}`);
}

if (failures.length > 0) {
  console.log("");
  for (const message of failures) {
    console.error(`FAIL ${message}`);
  }
  process.exitCode = 1;
} else {
  console.log("");
  console.log("Release readiness verification passed.");
}
