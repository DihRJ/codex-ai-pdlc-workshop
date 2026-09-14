import { createInterface } from "node:readline/promises";
import { JsonStore } from "../src/server/json-store";

async function main() {
  const yes = process.argv.includes("--yes");
  if (!yes) {
    if (!process.stdin.isTTY)
      throw new Error(
        "Para restaurar sem interação, use npm run data:reset -- --yes.",
      );
    const prompt = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      const answer = await prompt.question(
        "Pare o servidor antes de continuar. Restaurar os dados de demonstração? [s/N] ",
      );
      if (answer.trim().toLowerCase() !== "s") {
        console.log("Nenhum dado alterado.");
        return;
      }
    } finally {
      prompt.close();
    }
  }
  const backup = await new JsonStore().reset();
  console.log("Dados de demonstração restaurados.");
  if (backup) console.log(`Cópia anterior preservada em: ${backup}`);
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
