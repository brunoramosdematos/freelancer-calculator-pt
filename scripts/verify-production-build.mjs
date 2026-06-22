import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const indexPath = join(distDir, "index.html");
const productionUrl = "https://freelancerpt.brunomatos.dev/";
const forbiddenBasePath = "/freelancer-calculator-pt/";
const oldDomain = "freelancept.fmacedo.com";
const splitbeeHost = "cdn.splitbee.io";

const fail = (message) => {
  console.error(`Production build verification failed: ${message}`);
  process.exitCode = 1;
};

const readText = (path) => readFileSync(path, "utf8");

const collectFiles = (dir) => {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
};

if (!existsSync(indexPath)) {
  fail("dist/index.html does not exist.");
} else {
  const html = readText(indexPath);

  if (!html.includes(productionUrl)) {
    fail(
      `canonical production URL ${productionUrl} is absent from dist/index.html.`,
    );
  }

  if (html.includes(oldDomain)) {
    fail(`old live domain ${oldDomain} is present in dist/index.html.`);
  }

  if (html.includes(splitbeeHost)) {
    fail(`${splitbeeHost} remains in dist/index.html.`);
  }
}

if (!existsSync(join(distDir, "robots.txt"))) {
  fail("dist/robots.txt does not exist.");
}

if (!existsSync(join(distDir, "sitemap.xml"))) {
  fail("dist/sitemap.xml does not exist.");
}

if (existsSync(distDir)) {
  const builtAssetFiles = collectFiles(distDir).filter((path) =>
    /\.(?:html|js|css)$/.test(path),
  );
  const prefixedAssetFile = builtAssetFiles.find((path) =>
    readText(path).includes(forbiddenBasePath),
  );

  if (prefixedAssetFile) {
    fail(`${forbiddenBasePath} is present in ${prefixedAssetFile}.`);
  }
}

if (process.exitCode) {
  process.exit();
}

console.log(`Production build verified for ${productionUrl}`);
