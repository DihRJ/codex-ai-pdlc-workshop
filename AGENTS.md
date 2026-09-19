# Nexo — instruções para agentes

Portal local de demandas internas para um workshop. A branch `main` é o produto existente; a aprovação de orçamento será adicionada durante o exercício.

## Regras essenciais

- Preserve as regras existentes e os dados do participante. Mutações passam pela transação do armazenamento.
- Valide regras no backend. Controles visuais não substituem validação.
- Não acrescente banco de dados, Docker, autenticação real ou serviços externos ao exercício.
- Leia referências conforme a tarefa exigir. Ao implementar a nova história, confirme o PRD e a especificação presentes na branch de trabalho.
- Mantenha a comunicação e a interface em português. Use os nomes do glossário.
- Use Node.js 24 e as dependências do lockfile. Preserve alterações do participante e informe as verificações executadas e as pendências.

## Leia conforme a tarefa (Progressive Disclosure)

Comece por este arquivo. Abra apenas os guias relacionados à tarefa e siga suas referências quando precisar de detalhes. Não carregue toda a documentação por padrão. Combine guias quando a mudança envolver mais de uma área.

| Quando precisar de… | Leia |
| --- | --- |
| Entender produto, escopo e vocabulário | [Contexto](docs-agents/contexto.md) |
| Localizar código ou alterar domínio, API e interface | [Arquitetura](docs-agents/arquitetura.md) |
| Alterar persistência, concorrência, esquema ou recuperar dados | [Dados](docs-agents/dados.md) |
| Preparar o ambiente, executar ou validar mudanças | [Execução e validação](docs-agents/validacao.md) |
| Trabalhar na aprovação de orçamento ou retomar o workshop | [Evolução](docs-agents/evolucao.md) |

Ao atualizar as instruções, mantenha na raiz apenas regras transversais e este índice. Coloque detalhes no guia correspondente e referencie a documentação existente em vez de duplicá-la.

Este arquivo orienta o trabalho; não substitui as permissões configuradas no agente.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
