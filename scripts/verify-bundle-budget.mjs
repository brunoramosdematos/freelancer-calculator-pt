import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";

const distDir = "dist";
const budgets = {
  initialJsRaw: 420_000,
  initialJsGzip: 140_000,
  totalJsRaw: 570_000,
  totalJsGzip: 190_000,
  largestJsRaw: 550_000,
  largestJsGzip: 185_000,
  totalCssRaw: 45_000,
  totalCssGzip: 12_000,
  indexHtmlRaw: 9_000,
  maxJsChunks: 4,
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

const getAttribute = (tag, attributeName) => {
  const attributePattern = new RegExp(
    String.raw`\b${attributeName}\s*=\s*["']([^"']+)["']`,
    "i",
  );

  return attributePattern.exec(tag)?.[1];
};

const normalizeDistReference = (reference) => {
  if (!reference || /^[a-z][a-z\d+.-]*:/i.test(reference)) {
    return undefined;
  }

  const withoutQuery = reference.split(/[?#]/, 1)[0];
  const withoutLeadingSlash = withoutQuery
    .replace(/^\/+/, "")
    .replace(/^\.\//, "");

  if (withoutLeadingSlash.startsWith("assets/")) {
    return withoutLeadingSlash;
  }

  const assetsIndex = withoutLeadingSlash.indexOf("/assets/");

  return assetsIndex >= 0
    ? withoutLeadingSlash.slice(assetsIndex + 1)
    : withoutLeadingSlash;
};

const collectInitialJsReferences = (indexHtml) => {
  const initialReferences = new Set();
  const tagPattern = /<(script|link)\b[^>]*>/gi;
  let match;

  while ((match = tagPattern.exec(indexHtml.text)) !== null) {
    const [, tagName] = match;
    const tag = match[0];

    if (tagName.toLowerCase() === "script") {
      const source = getAttribute(tag, "src");
      const normalized = normalizeDistReference(source);

      if (normalized?.endsWith(".js")) {
        initialReferences.add(normalized);
      }

      continue;
    }

    const rel = getAttribute(tag, "rel");
    const href = getAttribute(tag, "href");
    const normalized = normalizeDistReference(href);

    if (
      rel?.split(/\s+/).includes("modulepreload") &&
      normalized?.endsWith(".js")
    ) {
      initialReferences.add(normalized);
    }
  }

  return initialReferences;
};

const summarizeFiles = (label, files) => {
  console.log(`${label}:`);

  if (files.length === 0) {
    console.log("- (none)");
    return;
  }

  for (const file of files) {
    console.log(
      `- ${file.relativePath}: raw ${formatBytes(file.size)}, gzip ${formatBytes(
        file.gzipSize,
      )}, sha256 ${file.sha256}`,
    );
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
  const initialJsReferences = indexHtml
    ? collectInitialJsReferences(indexHtml)
    : new Set();
  const initialJsFiles = jsFiles.filter((file) =>
    initialJsReferences.has(file.relativePath),
  );
  const lazyJsFiles = jsFiles.filter(
    (file) => !initialJsReferences.has(file.relativePath),
  );
  const referencedMissingJs = [...initialJsReferences].filter(
    (reference) => !jsFiles.some((file) => file.relativePath === reference),
  );
  const initialJsRaw = initialJsFiles.reduce((sum, file) => sum + file.size, 0);
  const initialJsGzip = initialJsFiles.reduce(
    (sum, file) => sum + file.gzipSize,
    0,
  );

  assertBudget(
    "initial JavaScript raw size",
    initialJsRaw,
    budgets.initialJsRaw,
  );
  assertBudget(
    "initial JavaScript gzip size",
    initialJsGzip,
    budgets.initialJsGzip,
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

  if (initialJsFiles.length === 0) {
    fail("no initial JavaScript entry was found in index.html.");
  }

  if (referencedMissingJs.length > 0) {
    fail(
      `index.html references JavaScript files not found in dist: ${referencedMissingJs.join(
        ", ",
      )}`,
    );
  }

  if (jsFiles.length > budgets.maxJsChunks) {
    fail(
      `JavaScript chunk count is ${jsFiles.length}, above ${budgets.maxJsChunks}.`,
    );
  }

  if (sourceMaps.length > 0) {
    fail(
      `source maps are present: ${sourceMaps
        .map((file) => file.relativePath)
        .join(", ")}`,
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
  summarizeFiles("Initial JavaScript files", initialJsFiles);
  summarizeFiles("Lazy JavaScript files", lazyJsFiles);
  summarizeFiles("CSS files", cssFiles);
  summarizeFiles("HTML files", htmlFiles);
  console.log("Other files:");
  for (const file of files.filter(
    (file) =>
      !file.relativePath.endsWith(".js") &&
      !file.relativePath.endsWith(".css") &&
      !file.relativePath.endsWith(".html"),
  )) {
    console.log(
      `- ${file.relativePath}: raw ${formatBytes(file.size)}, gzip ${formatBytes(
        file.gzipSize,
      )}, sha256 ${file.sha256}`,
    );
  }
  console.log(
    `Totals: initial JS raw ${formatBytes(
      initialJsRaw,
    )}, initial JS gzip ${formatBytes(initialJsGzip)}, total JS raw ${formatBytes(
      totalJsRaw,
    )}, total JS gzip ${formatBytes(totalJsGzip)}, CSS raw ${formatBytes(
      totalCssRaw,
    )}, CSS gzip ${formatBytes(totalCssGzip)}, largest JS ${
      largestJs.relativePath
    }, JS chunks ${jsFiles.length}.`,
  );
}

if (failures.length > 0) {
  console.error("Bundle budget verification failed:");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("Bundle budget verified.");
