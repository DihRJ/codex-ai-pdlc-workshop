# Dados e persistência

Leia antes de alterar armazenamento, esquema, concorrência, inicialização, reset ou testes que gravem dados.

- `data/seed.json` contém exemplos versionados. Não a altere para recuperar uma execução local.
- O arquivo de trabalho padrão é `.local/demands.json`; `DEMANDS_DATA_FILE` permite definir outro caminho.
- Preserve dados do participante. Não use o arquivo de trabalho em testes nem versione dados locais.
- Leituras e ciclos de leitura–alteração–gravação usam a trava do armazenamento, inclusive inicialização e reset. Mutações passam pela transação existente.
- Preserve a validação antes da gravação e a escrita em arquivo temporário no mesmo diretório, seguida da substituição do arquivo de trabalho.
- O armazenamento atende ao exercício local; não o trate como banco distribuído.

O starter usa `schemaVersion: 1`. Ao introduzir campos, defina na especificação como ler os dados existentes, preservar o histórico e tratar demandas já iniciadas. Consulte [evolução](evolucao.md).

Para uma restauração solicitada, siga [recuperação de dados e trava](../docs/preparation.md#recuperação-de-dados-e-trava): pare o servidor e use `npm run data:reset`, que pede confirmação e preserva backup. Não execute reset como parte de uma validação comum nem remova a trava de um processo ativo.

Testes de regras, API e armazenamento usam diretórios temporários. O Playwright usa `.local/e2e/`, definido em [playwright.config.ts](../playwright.config.ts).

Para detalhes, consulte [json-store.ts](../src/server/json-store.ts) e a seção de persistência da [arquitetura](../docs/architecture.md).
