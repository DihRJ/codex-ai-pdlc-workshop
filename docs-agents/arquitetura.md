# Arquitetura e implementação

Leia antes de alterar domínio, API ou interface. Para armazenamento, consulte também [dados](dados.md).

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/` | Entrada Next.js, layout, estilos globais e rotas HTTP |
| `src/components/` | Quadro, formulários, detalhes e componentes compartilhados |
| `src/domain/model.ts` | Esquemas Zod, tipos e comandos aceitos |
| `src/domain/demands.ts` | Regras, transições e histórico, sem acesso a arquivos |
| `src/domain/currency.ts` | Conversão de valores e apresentação monetária |
| `src/server/http.ts` | Contrato HTTP e tradução de erros |
| `src/server/json-store.ts` | Persistência, transações, trava e restauração |

Mantenha regras no domínio e validação no backend. A interface envia comandos; o backend identifica o perfil, valida, aplica regras e persiste. A tela consulta novamente o estado salvo.

O starter oferece `GET /api/demands` e `POST /api/demands`, com comandos `create`, `update` e `advance`. O cabeçalho `x-demo-user` identifica um usuário da seed; nome e papel são obtidos no servidor. Não é autenticação real.

Preserve a rejeição de campos inesperados e o controle de versão para edição e movimentação: versão desatualizada resulta em conflito HTTP 409. Reutilize os componentes e as convenções existentes, mantendo mensagens em português.

Antes de escrever código, consulte o guia pertinente da versão instalada em `node_modules/next/dist/docs/`, conforme o bloco Next.js do `AGENTS.md`.

Para detalhes dos contratos, consulte a [arquitetura do starter](../docs/architecture.md). Para conferir mudanças, siga [validação](validacao.md).
