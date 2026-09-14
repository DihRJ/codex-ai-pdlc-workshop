import { spawnSync } from "node:child_process";

const steps = [
  ["TypeScript", "node_modules/typescript/bin/tsc", "--noEmit"],
  ["ESLint", "node_modules/eslint/bin/eslint.js", "."],
  ["Testes de regras e persistência", "scripts/test.mjs"],
  ["Build Next.js", "node_modules/next/dist/bin/next", "build"],
];
for (const [label, ...args] of steps) {
  console.log(`\n→ ${label}`);
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(
  "\nValidação concluída. Para verificar a interface: npm run test:e2e.",
);
