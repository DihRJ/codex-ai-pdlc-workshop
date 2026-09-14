import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const major = Number(process.versions.node.split(".")[0]);
const git = spawnSync("git", ["--version"], { encoding: "utf8" });
const checks = [
  [major === 24, `Node.js 24 (encontrado: ${process.version})`],
  [git.status === 0, "Git disponível"],
  [
    existsSync("node_modules/next/package.json"),
    "Dependências instaladas com npm ci",
  ],
  [existsSync("data/seed.json"), "Dados fictícios disponíveis"],
];
for (const [ok, label] of checks)
  console.log(`${ok ? "OK" : "PENDENTE"} · ${label}`);
console.log(
  "Acesso ao Codex deve ser conferido no App ou CLI antes do evento.",
);
if (checks.some(([ok]) => !ok)) process.exitCode = 1;
