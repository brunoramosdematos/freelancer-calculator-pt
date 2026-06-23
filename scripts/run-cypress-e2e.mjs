import { spawn } from "node:child_process";
import { createServer } from "vite";

const port = Number(process.env.CYPRESS_PORT ?? 8261);
const baseUrl = `http://localhost:${port}`;
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const runCypress = () =>
  new Promise((resolve, reject) => {
    const child = spawn(
      npxCommand,
      ["cypress", "run", "--e2e", "--config", `baseUrl=${baseUrl}`],
      {
        stdio: "inherit",
        shell: process.platform === "win32",
      },
    );

    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });

const server = await createServer({
  server: {
    host: true,
    port,
    strictPort: true,
  },
});

await server.listen();
server.printUrls();

try {
  const exitCode = await runCypress();
  await server.close();
  process.exit(exitCode);
} catch (error) {
  await server.close();
  console.error(error);
  process.exit(1);
}
