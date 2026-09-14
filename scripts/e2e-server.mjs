import { spawn } from "node:child_process";

// data:reset is confined to the file supplied by playwright.config.ts.
const reset = spawn(
  process.execPath,
  ["--import", "tsx", "scripts/reset-data.ts", "--yes"],
  { stdio: "inherit" },
);
reset.on("exit", (code) => {
  if (code !== 0) process.exit(code ?? 1);
  const server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3100",
    ],
    { stdio: "inherit" },
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => server.kill(signal));
  server.on("exit", (code) => process.exit(code ?? 0));
});
