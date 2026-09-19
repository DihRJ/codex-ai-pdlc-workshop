# Evolução do produto

Leia ao trabalhar na aprovação de orçamento, nos seus artefatos ou na retomada do workshop.

## Antes de implementar

1. Consulte o [enunciado da nova necessidade](../docs/workshop-brief.md).
2. Localize e leia o PRD, a especificação e o plano presentes na branch de trabalho. O starter não inclui esses artefatos prontos; não presuma que existam nem invente caminhos.
3. Compare o pedido com o comportamento implementado e explicite lacunas que afetem a solução. O enunciado orienta os artefatos, mas não substitui suas decisões técnicas.
4. Implemente por etapas verificáveis, preservando regras fora do escopo e dados existentes.

## Escopo da história

O enunciado descreve avaliação de orçamento pelo gestor, impedimento de autoaprovação, justificativa de rejeição e registro das decisões no histórico. Também trata reenvio, invalidação por alteração do valor antes da execução, bloqueio do valor depois do início e conclusão de demandas antigas sem aprovação retroativa.

Use o [enunciado](../docs/workshop-brief.md) como referência completa dos requisitos. Esses comportamentos são a evolução pretendida, não funcionalidades já disponíveis no starter.

Ao mudar o esquema ou adicionar decisões ao histórico, consulte [dados](dados.md). Antes de entregar, siga [validação](validacao.md).

## Retomada e entrega

Para recuperar uma etapa, siga [checkpoints](../docs/checkpoints.md), usando outra pasta para preservar o trabalho atual. Não copie dados da solução de volta para o starter.

A entrega deve explicar a mudança, os critérios atendidos, as evidências de validação e pendências. Confira o destino do fork antes de publicar um PR; trabalho local não implica pedido de publicação.
