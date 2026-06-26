import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";

const distDir = "dist";
const budgets = {
  totalJsRaw: 550_000,
  totalJsGzip: 185_000,
  largestJsRaw: 550_000,
  largestJsGzip: 185_000,
  totalCssRaw: 45_000,
  totalCssGzip: 12_000,
  indexHtmlRaw: 8_000,
  maxJsChunks: 1,
};

const forbiddenBuiltCodePatterns = [
  { name: "Cypress test runtime", pattern: /\bcypress\b|Cypress\./i },
  { name: "cypress-axe", pattern: /cypress-axe/ },
  { name: "axe-core test dependency", pattern: /axe-core/ },
  { name: "Vitest runtime", pattern: /\bvitest\b|@vitest/i },
  { name: "Node fs runtime", pattern: /node:fs|require\(["']fs["']\)/ },
  { name: "Node path runtime", pattern: /node:path|require\(["']path["']\)/ },
  { name: "Node process runtime", pattern: /process\.versions/ },
];

const failures = [];

const fail = (message) => {
  failures.push(message);
};

const collectFiles = (dir) => {
  const entries = readdirSync(dir);

  return entries.flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
};

const formatBytes = (value) => `${value.toLocaleString("en-US")} B`;

const getFileInfo = (path) => {
  const contents = readFileSync(path);
  const gzipSize = gzipSync(contents).length;

  return {
    path,
    relativePath: relative(distDir, path).split(sep).join("/"),
    size: contents.length,
    gzipSize,
    sha256: createHash("sha256").update(contents).digest("hex"),
    text: /\.(?:html|js|css)$/.test(path) ? contents.toString("utf8") : "",
  };
};

const assertBudget = (name, actual, limit) => {
  if (actual > limit) {
    fail(`${name} is ${formatBytes(actual)}, above ${formatBytes(limit)}.`);
  }
};

if (!existsSync(distDir)) {
  fail("dist does not exist. Run npm run build before verifying budgets.");
} else {
  const files = collectFiles(distDir).map(getFileInfo);
  const jsFiles = files.filter((file) => file.relativePath.endsWith(".js"));
  const cssFiles = files.filter((file) => file.relativePath.endsWith(".css"));
  const htmlFiles = files.filter((file) => file.relativePath.endsWith(".html"));
  const sourceMaps = files.filter((file) => file.relativePath.endsWith(".map"));
  const indexHtml = files.find((file) => file.relativePath === "index.html");
  const totalJsRaw = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const totalJsGzip = jsFiles.reduce((sum, file) => sum + file.gzipSize, 0);
  const totalCssRaw = cssFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCssGzip = cssFiles.reduce((sum, file) => sum + file.gzipSize, 0);
  const largestJs = jsFiles.reduce(
    (largest, file) => (file.size > largest.size ? file : largest),
    { size: 0, gzipSize: 0, relativePath: "(none)" },
  );

  assertBudget("total JavaScript raw size", totalJsRaw, budgets.totalJsRaw);
  assertBudget("total JavaScript gzip size", totalJsGzip, budgets.totalJsGzip);
  assertBudget(
    "largest JavaScript raw size",
    largestJs.size,
    budgets.largestJsRaw,
  );
  assertBudget(
    "largest JavaScript gzip size",
    largestJs.gzipSize,
    budgets.largestJsGzip,
  );
  assertBudget("total CSS raw size", totalCssRaw, budgets.totalCssRaw);
  assertBudget("total CSS gzip size", totalCssGzip, budgets.totalCssGzip);

  if (indexHtml) {
    assertBudget("index.html raw size", indexHtml.size, budgets.indexHtmlRaw);
  } else {
    fail("index.html is missing from dist.");
  }

  if (jsFiles.length > budgets.maxJsChunks) {
    fail(
      `JavaScript chunk count is ${jsFiles.length}, above ${budgets.maxJsChunks}.`,
    );
  }

  if (sourceMaps.length > 0) {
    fail(
      `source maps are present: ${sourceMaps.map((file) => file.relativePath).join(", ")}`,
    );
  }

  for (const file of [...jsFiles, ...cssFiles, ...htmlFiles]) {
    for (const { name, pattern } of forbiddenBuiltCodePatterns) {
      if (pattern.test(file.text)) {
        fail(`${name} appears in ${file.relativePath}.`);
      }
    }
  }

  console.log("Bundle budget summary:");
  for (const file of files) {
    console.log(
      `- ${file.relativePath}: raw ${formatBytes(file.size)}, gzip ${formatBytes(
        file.gzipSize,
      )}, sha256 ${file.sha256}`,
    );
  }
  console.log(
    `Totals: JS raw ${formatBytes(totalJsRaw)}, JS gzip ${formatBytes(
      totalJsGzip,
    )}, CSS raw ${formatBytes(totalCssRaw)}, CSS gzip ${formatBytes(
      totalCssGzip,
    )}, largest JS ${largestJs.relativePath}.`,
  );
}

if (failures.length > 0) {
  console.error("Bundle budget verification failed:");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("Bundle budget verified.");
