# Contexto do projeto

Leia ao entender uma solicitação, escrever textos da interface ou discutir regras de negócio.

O Nexo é um portal fictício de demandas internas. O starter oferece quadro por situação, criação e edição, busca, filtros, valores, histórico e seleção de perfis de demonstração, com temas claro e escuro.

- Use o [glossário](../CONTEXT.md): demanda, solicitante, gestor, valor solicitado, aprovação, rejeição, execução e histórico da demanda.
- No starter, as situações são `Nova`, `Em andamento` e `Concluída`.
- Qualquer perfil consulta demandas; somente o solicitante edita ou movimenta as próprias. Demandas concluídas são apenas consultadas.
- Os perfis são fictícios. O papel `gestor` não significa que o fluxo de aprovação já esteja implementado.
- Valores são representados em centavos no domínio e exibidos em reais.

Para apresentação e uso do portal, consulte o [README](../README.md). Confirme regras implementadas no [modelo](../src/domain/model.ts) e nos [comandos do domínio](../src/domain/demands.ts).

Para a nova política de orçamento, leia [evolução](evolucao.md). Separe o comportamento atual dos requisitos ainda a implementar.
