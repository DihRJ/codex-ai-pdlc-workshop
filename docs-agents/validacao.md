# Execução e validação

Leia para preparar o ambiente, executar o portal ou verificar alterações. Execute comandos na raiz do repositório.

Use Node.js 24 (`>=24 <25`, conforme `package.json`) e `npm ci` para instalar as versões do lockfile. O portal não exige banco de dados, Docker, `.env` ou chave de API.

| Comando | Uso |
| --- | --- |
| `npm run doctor` | Conferir pré-requisitos locais |
| `npm run dev` | Abrir o portal em `http://127.0.0.1:3000` |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run lint` | Executar ESLint |
| `npm test` | Testar domínio, API e persistência |
| `npm run build` | Gerar o build Next.js |
| `npm run validate` | Executar tipos, lint, testes e build, parando na primeira falha |
| `npm run test:e2e` | Testar fluxos no Chromium pelo Playwright |

Para mudanças de código, execute `npm run validate`. Após mudanças de interface ou fluxo, execute também `npm run test:e2e` quando Chromium estiver disponível. Para alterações somente em documentação, confira caminhos, links locais, comandos citados e coerência com o código; não é necessário executar o build por esse motivo.

Mantenha testes pertinentes ao comportamento alterado: domínio em `tests/demands.test.ts`, API em `tests/http.test.ts`, armazenamento em `tests/store.test.ts` e navegador em `tests/e2e/`.

Pare o servidor de desenvolvimento antes da validação completa e do E2E. O Playwright inicia seu próprio servidor na porta 3100 e usa dados isolados; não aponte testes para dados do participante.

Se necessário, instale Chromium com `npx playwright install chromium`. Para requisitos por sistema operacional e problemas de ambiente, consulte [preparação](../docs/preparation.md).

Na entrega, informe o que mudou, quais verificações realmente executou, os resultados e impedimentos. Não declare validação concluída se algum passo ficou pendente.
