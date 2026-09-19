---
title: "Implementation slices — Aprovação de orçamento"
version: "1.0"
date_created: "2026-09-19"
last_updated: "2026-09-19"
owner: "Engenharia Nexo"
sources:
  - "PRD-v1.md"
  - "doc-specs/spec-v1.md"
---

# Implementation slices — Aprovação de orçamento

## 1. Objetivo do plano

Este plano decompõe a aprovação de orçamento em slices verticais, pequenos, demonstráveis e ordenados por dependência. Cada slice deve entregar um comportamento observável de ponta a ponta, atravessando apenas as camadas necessárias de domínio, persistência, API, interface e testes.

Os slices não autorizam mudanças fora do escopo definido no PRD e na especificação. Banco de dados, autenticação real, serviços externos e dependências novas continuam fora do exercício.

## 2. Estratégia de contexto: Smart Zone vs Dumb Zone

Cada slice foi dimensionado para uma sessão nova e possui um Context Pack mínimo. Durante a implementação:

- carregar somente os Source IDs e as seções indicadas no slice atual;
- consultar o código diretamente relacionado ao comportamento daquele slice;
- não carregar todos os slices nem reler integralmente o PRD e a especificação;
- concluir implementação, testes, verificação e handoff antes de iniciar outro slice;
- não misturar correções ou critérios de slices futuros;
- interromper a implementação e preparar o handoff se houver repetição de leituras, confusão de escopo, refatoração ampla não planejada ou perda dos critérios ativos.

O handoff deve permitir que a próxima sessão retome sem depender da memória da sessão anterior. Os Source IDs formam o Context Graph: `PRD:` registra a intenção e o aceite de produto; `SPEC:` registra o contrato técnico correspondente.

## 3. Grafo e ordem de execução

| Ordem | Slice                                            | Bloqueado por | Resultado demonstrável                                                       |
| ----- | ------------------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| 01    | Migrar dados e preservar o legado                | Nenhum        | Dados v1 abrem como v2 e demandas legadas em andamento podem ser concluídas. |
| 02    | Enviar demanda para aprovação                    | 01            | Solicitante envia uma demanda nova e todos veem a situação pendente.         |
| 03    | Aprovar e iniciar a execução                     | 02            | Gestor elegível aprova e o solicitante inicia usando o valor autorizado.     |
| 04    | Rejeitar, corrigir e reenviar                    | 02            | Gestor rejeita com justificativa e o solicitante abre um novo ciclo.         |
| 05    | Invalidar avaliação após mudança de valor        | 03 e 04       | Alterar o valor invalida o ciclo aplicável e exige nova avaliação.           |
| 06    | Consolidar auditoria, concorrência e experiência | 05            | Múltiplos ciclos permanecem compreensíveis e ações concorrentes são seguras. |

As dependências representam bloqueios reais. Os slices 03 e 04 podem ser desenvolvidos em paralelo depois do slice 02, desde que alterações concorrentes nos mesmos módulos sejam coordenadas antes da integração.

---

## Slice 01 — Migrar dados e preservar o legado

### Resultado esperado

Ao iniciar o Nexo com dados no esquema 1, o sistema os converte de forma segura e idempotente para o esquema 2. Demandas que já estavam `Em andamento` continuam concluíveis sem aprovação retroativa; demandas `Nova` passam a obedecer à nova política. Dados e histórico anteriores permanecem consultáveis.

### Dependências

Nenhuma. Este slice cria a base compatível usada pelos demais.

### Source IDs

**PRD:** RN-022, RN-023, RN-028, CA-009, CA-010

**SPEC:** CON-003, CON-006, ADR-001, ADR-005, ADR-006, INV-007, INV-008, REQ-012, REQ-013, MIG-001, MIG-002, MIG-003, MIG-004, MIG-005, MIG-006, MIG-007, RES-001, RES-002, RES-003, AC-011, AC-012, AC-013, AC-014

### Context Pack mínimo

- `PRD-v1.md`: seções 10.4, 10.5 e os cenários de conclusão/preservação.
- `doc-specs/spec-v1.md`: seções 4, 6, 9 e critérios AC-011 a AC-014.
- Guias do projeto: `docs-agents/dados.md` e `docs-agents/validacao.md`.
- Código atual: modelo persistido, armazenamento JSON, seed e testes de armazenamento.

### Escopo

- Introduzir o modelo canônico v2 e um esquema de leitura v1 dedicado.
- Migrar v1 para v2 dentro da trava existente e persistir pelo fluxo atômico atual.
- Adicionar `approvalCycles` vazio e a marca explícita de execução legada.
- Preservar IDs, versões, datas, usuários, `nextId`, dados da demanda e eventos históricos.
- Atualizar deliberadamente a seed versionada para v2 sem tocar no arquivo de trabalho do participante.
- Permitir a conclusão, pelo solicitante, de demanda legada em andamento.
- Manter demandas concluídas somente para consulta.
- Não implementar envio ou decisão de aprovação neste slice.

### Acceptance Criteria

- [ ] Dado um arquivo válido no esquema 1, quando o armazenamento o lê, então produz e persiste um banco válido no esquema 2 sem perder demandas, usuários ou eventos.
- [ ] Dada uma demanda v1 `Em andamento`, quando migrada, então recebe exclusivamente a marca de execução legada e pode ser concluída pelo solicitante sem aprovação retroativa.
- [ ] Dada uma demanda v1 `Nova`, quando migrada, então não recebe a exceção legada e não pode usar a transição antiga diretamente para `Em andamento`.
- [ ] Dada uma demanda v1 `Concluída`, quando migrada, então permanece somente para consulta e não recebe uma aprovação artificial.
- [ ] Dado um arquivo já no esquema 2, quando lido repetidamente, então nenhuma versão, data, marca, ciclo ou evento é alterado.
- [ ] Dada falha de parse, validação ou gravação durante a migração, então o arquivo anterior permanece preservado e o erro de armazenamento é devolvido.
- [ ] Dadas duas instâncias lendo um arquivo v1 simultaneamente, então a trava serializa uma única migração consistente.
- [ ] Dado o reset de dados, quando executado, então o backup continua sendo criado antes da substituição.

### Testes e verificação

- Teste de armazenamento com fixture v1 cobrindo `Nova`, `Em andamento` e `Concluída`.
- Teste de idempotência da leitura v2.
- Teste com duas instâncias concorrentes durante a primeira leitura.
- Teste de preservação do arquivo em entrada corrompida e falha de validação.
- Teste de domínio/API para conclusão de demanda legada pelo solicitante e recusa por outra pessoa.
- Executar os testes direcionados de armazenamento, domínio e API; depois `npm run typecheck`, `npm run lint` e `npm run build`.

### Handoff

Registrar:

- formato final do esquema v2 e estratégia efetiva de migração;
- fixtures criadas e evidências de idempotência/atomicidade;
- como a marca legada é atribuída e validada;
- comandos executados e resultados;
- qualquer divergência entre o modelo implementado e os Source IDs;
- próximo passo exato: implementar o ciclo pendente do slice 02 sobre o modelo v2 já validado.

---

## Slice 02 — Enviar demanda para aprovação

### Resultado esperado

O solicitante envia uma demanda `Nova` para avaliação. O sistema cria exatamente um ciclo pendente para o valor vigente, registra o envio e apresenta `Aguardando aprovação` a todos os perfis. Nenhuma demanda abrangida inicia diretamente.

### Dependências

Bloqueado pelo slice 01.

### Source IDs

**PRD:** RN-001, RN-002, RN-003, RN-004, RN-014, RN-020, RN-021, RN-024, RN-027, CA-001

**SPEC:** ADR-001, ADR-002, ADR-003, INV-001, INV-002, INV-004, INV-009, INV-010, INV-011, REQ-001, REQ-002, REQ-013, REQ-014, REQ-015, SEC-001, SEC-002, SEC-003, PER-001, AC-001, AC-012, AC-015

### Context Pack mínimo

- Handoff do slice 01.
- `PRD-v1.md`: seções 9, 10.1, 10.4, 11 e cenário de envio.
- `doc-specs/spec-v1.md`: modelo de ciclo, comandos, matriz de transição e experiência para `Nova`/`Aguardando aprovação`.
- Código atual: comando de domínio, handler, detalhes da demanda, portal e testes próximos.

### Escopo

- Acrescentar a situação `Aguardando aprovação` e o comando estrito `submitForApproval`.
- Criar um ciclo com identificador próprio, ator, data/hora e valor submetido.
- Acrescentar evento de envio referenciado ao mesmo ciclo.
- Incrementar versão uma única vez e persistir ciclo, situação e histórico atomicamente.
- Recusar não solicitante, envio duplicado, versão obsoleta e situação incompatível.
- Remover da experiência o início direto de demanda `Nova`.
- Exibir ação “Enviar para aprovação” somente ao solicitante elegível.
- Exibir a nova situação no quadro e nos detalhes, preservando busca, filtros e resumos.
- Recarregar o estado canônico após a mutação e apresentar mensagem específica.

### Acceptance Criteria

- [ ] Dada uma demanda `Nova`, quando seu solicitante envia a versão atual, então a situação passa a `Aguardando aprovação` e surge exatamente um ciclo pendente para o valor vigente.
- [ ] Dado um envio válido, então ciclo e histórico registram o mesmo solicitante, instante, valor e identificador de ciclo.
- [ ] Dada uma avaliação pendente, quando o solicitante tenta enviar novamente, então recebe conflito e nenhum segundo ciclo ou evento é criado.
- [ ] Dada pessoa diferente do solicitante, quando tenta enviar, então recebe recusa de autorização e o agregado permanece inalterado.
- [ ] Dada versão obsoleta, quando o envio é solicitado, então recebe conflito, o cliente recarrega o estado e nenhuma informação é sobrescrita.
- [ ] Dada demanda `Nova`, `Aguardando aprovação` ou `Rejeitada`, quando alguém tenta iniciar sem aprovação válida, então a execução é recusada pelo backend.
- [ ] Dado o solicitante visualizando demanda `Nova`, então vê “Enviar para aprovação” no lugar da ação antiga de início direto.
- [ ] Dado qualquer perfil consultando a demanda enviada, então vê `Aguardando aprovação` e o evento de envio no histórico.

### Testes e verificação

- Testes de domínio para envio válido, duplicado, ator indevido, situação inválida e versão obsoleta.
- Testes de API para contrato estrito, status 403/409 e ausência de mutação em falha.
- Teste de armazenamento confirmando escrita conjunta de situação, ciclo e evento.
- E2E: solicitante envia demanda e outro perfil consulta a situação/histórico.
- E2E: ação de início direto deixa de existir e tentativa manual pela API é recusada.
- Executar testes direcionados e, ao fechar o slice, `npm run validate` e o cenário E2E correspondente.

### Handoff

Registrar:

- contrato final de `submitForApproval` e mensagens de erro;
- estrutura persistida de um ciclo pendente real de teste;
- ações e estados visuais introduzidos;
- testes vermelhos antes da mudança e evidências verdes depois;
- comandos executados e resultados;
- próximo passo exato: usar o `cycleId` pendente para decisão no slice 03 ou 04.

---

## Slice 03 — Aprovar e iniciar a execução

### Resultado esperado

Um gestor que não seja o solicitante aprova o ciclo pendente para o valor submetido. A demanda passa a `Aprovada`; o solicitante visualiza o valor autorizado e consegue iniciar a execução. Perfis inelegíveis, autoaprovação, ciclos obsoletos e valores divergentes são recusados.

### Dependências

Bloqueado pelo slice 02.

### Source IDs

**PRD:** RN-006, RN-007, RN-008, RN-009, RN-011, RN-012, RN-013, RN-020, RN-021, CA-001, CA-002, CA-006, CA-007

**SPEC:** ADR-003, ADR-004, INV-003, INV-006, INV-008, INV-009, INV-010, INV-011, INV-012, REQ-003, REQ-004, REQ-006, REQ-011, REQ-013, REQ-014, REQ-015, SEC-001, SEC-002, SEC-003, AC-002, AC-003, AC-005, AC-009

### Context Pack mínimo

- Handoff do slice 02.
- `PRD-v1.md`: requisitos de decisão e início; cenários de aprovação, elegibilidade, decisão única e início.
- `doc-specs/spec-v1.md`: contrato `decideApproval`, `start`, invariantes e semântica HTTP.
- Código atual: aplicação de comandos, transação, detalhes/modal, portal e testes de concorrência.

### Escopo

- Implementar `decideApproval` para o resultado de aprovação usando `version` e `cycleId`.
- Validar no backend papel gestor, segregação, situação, ciclo pendente e correspondência do valor.
- Persistir decisão e evento de aprovação de forma indivisível.
- Apresentar `Aprovada`, o valor aprovado e ação de início somente ao solicitante.
- Implementar o comando explícito `start` e remover a ambiguidade de `advance` para esse caminho.
- Validar aprovação vigente antes de iniciar; bloquear alteração do valor após o início.
- Manter ações visuais como conveniência, nunca como única validação.
- Cobrir duas aprovações concorrentes e repetição da mesma decisão.

### Acceptance Criteria

- [ ] Dada avaliação pendente de outra pessoa, quando gestor elegível aprova usando versão e ciclo atuais, então a situação passa a `Aprovada` e uma única decisão é registrada.
- [ ] Dada aprovação válida, então os detalhes mostram solicitante, valor atual e valor aprovado antes do início.
- [ ] Dado solicitante que também é gestor, quando tenta aprovar a própria demanda, então recebe 403 e o ciclo continua pendente sem decisão.
- [ ] Dada pessoa sem papel de gestor, quando tenta aprovar, então recebe 403 e não há mutação.
- [ ] Dado ciclo inexistente, encerrado ou diferente do pendente, quando uma aprovação é enviada, então recebe 404 ou 409 conforme o contrato e nenhuma decisão é criada.
- [ ] Dadas duas decisões simultâneas sobre a mesma versão e ciclo, então apenas a primeira mutação válida persiste e a segunda recebe 409.
- [ ] Dada demanda `Aprovada` com valor correspondente, quando o solicitante inicia, então passa a `Em andamento`, registra o evento e mantém o valor autorizado.
- [ ] Dada demanda sem aprovação válida ou ator diferente do solicitante, quando tenta iniciar, então a ação é recusada sem alterar a demanda.
- [ ] Dada demanda `Em andamento`, quando o solicitante tenta enviar valor diferente em uma atualização, então a alteração é recusada e valor/histórico permanecem intactos.

### Testes e verificação

- Testes de domínio para papel, autoaprovação, ciclo, valor, decisão única e início.
- Testes de API para 200, 403, 404 e 409, inclusive campos inesperados e justificativa indevida na aprovação.
- Teste de armazenamento com duas instâncias decidindo a mesma avaliação.
- E2E: solicitante envia, troca para gestor, aprova, retorna ao solicitante e inicia.
- E2E: autoaprovação não é oferecida e tentativa direta na API é recusada.
- Executar testes direcionados, `npm run validate` e o cenário E2E do caminho aprovado.

### Handoff

Registrar:

- regras efetivas de elegibilidade e validação de `cycleId`;
- comportamento observado na corrida entre duas decisões;
- contrato final de `start` e como o valor fica bloqueado;
- evidência do fluxo demonstrável completo até `Em andamento`;
- comandos executados e resultados;
- próximo passo exato: implementar o desfecho alternativo de rejeição sem alterar o caminho aprovado.

---

## Slice 04 — Rejeitar, corrigir e reenviar

### Resultado esperado

Um gestor elegível rejeita uma avaliação com justificativa significativa. O solicitante entende o motivo, edita a demanda e a reenvia, criando um novo ciclo sem apagar o anterior. O fluxo pode terminar em aprovação por outro gestor.

### Dependências

Bloqueado pelo slice 02. Pode ser desenvolvido em paralelo ao slice 03 com coordenação de integração.

### Source IDs

**PRD:** RN-005, RN-006, RN-007, RN-008, RN-010, RN-011, RN-012, RN-013, RN-017, RN-021, RN-025, RN-026, CA-002, CA-003, CA-006, CA-007, CA-008

**SPEC:** ADR-002, ADR-003, INV-005, INV-008, INV-009, INV-010, INV-011, REQ-003, REQ-004, REQ-005, REQ-010, REQ-013, REQ-014, REQ-015, SEC-003, SEC-004, AC-002, AC-003, AC-004, AC-010, AC-015

### Context Pack mínimo

- Handoff do slice 02 e, se já integrado, contrato compartilhado do slice 03.
- `PRD-v1.md`: rejeição, reenvio, histórico e respectivos cenários Gherkin.
- `doc-specs/spec-v1.md`: decisão rejeitada, limites da justificativa, matriz de ações e acessibilidade do diálogo.
- Código atual: comando de decisão, modal, detalhes, formulário e testes próximos.

### Escopo

- Completar `decideApproval` com o resultado de rejeição.
- Normalizar justificativa com `trim()` e exigir de 3 a 500 caracteres.
- Persistir decisão, justificativa e evento sem alterar ou remover ciclos anteriores.
- Apresentar diálogo de rejeição acessível, contador/limites e erros associados ao campo.
- Exibir situação `Rejeitada`, justificativa no histórico e orientação para reenvio.
- Permitir edição da demanda rejeitada sem modificar o ciclo encerrado.
- Permitir reenvio mesmo sem alteração, sempre criando novo ciclo pendente.
- Impedir início de demanda rejeitada.

### Acceptance Criteria

- [ ] Dada avaliação pendente de outra pessoa, quando gestor elegível rejeita com justificativa de 3 a 500 caracteres após normalização, então a demanda passa a `Rejeitada` e a decisão registra gestor, instante, valor e justificativa.
- [ ] Dada justificativa vazia, apenas whitespace, menor que 3 ou maior que 500 caracteres, quando a rejeição é enviada, então recebe 400 e o ciclo permanece pendente sem decisão/evento.
- [ ] Dada uma rejeição persistida, então a justificativa aparece integralmente no histórico para qualquer perfil que consulte a demanda.
- [ ] Dada demanda `Rejeitada`, quando o solicitante edita campos permitidos, então a decisão anterior permanece imutável.
- [ ] Dada demanda `Rejeitada`, quando o solicitante reenvia com ou sem edição, então um novo ciclo pendente é acrescentado e a situação volta a `Aguardando aprovação`.
- [ ] Dado um novo ciclo após rejeição, quando gestor elegível decide, então a decisão se aplica apenas ao novo `cycleId`.
- [ ] Dada demanda rejeitada, quando o solicitante tenta iniciar, então a execução é recusada e a interface orienta editar e reenviar.
- [ ] Dado o diálogo de rejeição, então possui nome acessível, foco previsível, campo associado à ajuda/erro e cancelamento sem mutação.

### Testes e verificação

- Testes de domínio para limites 2, 3, 500 e 501, whitespace e normalização.
- Testes de domínio para editar e reenviar preservando o ciclo rejeitado.
- Testes de API para contrato, status e ausência de mutação em justificativa inválida.
- E2E: rejeição inválida, rejeição válida, edição, reenvio e decisão do novo ciclo.
- Verificação de teclado, foco e anúncio de erro do diálogo.
- Executar testes direcionados, `npm run validate` e o cenário E2E do caminho rejeitado.

### Handoff

Registrar:

- contrato final da rejeição e normalização adotada;
- evidência de que ciclo anterior e justificativa sobrevivem ao reenvio;
- comportamento acessível do diálogo;
- possíveis conflitos de integração com o slice 03 e como foram resolvidos;
- comandos executados e resultados;
- próximo passo exato: implementar invalidação automática para mudanças efetivas de valor.

---

## Slice 05 — Invalidar avaliação após mudança de valor

### Resultado esperado

Quando o solicitante muda efetivamente o valor durante uma avaliação pendente ou após uma aprovação, o sistema invalida o ciclo aplicável, retorna a demanda a `Nova` e exige novo envio. Editar sem mudar o valor preserva a validade; após o início, o valor continua bloqueado.

### Dependências

Bloqueado pelos slices 03 e 04, pois precisa tratar ciclos aprovados, pendentes e rejeitados sem perder os respectivos comportamentos.

### Source IDs

**PRD:** RN-009, RN-014, RN-015, RN-016, RN-017, RN-018, RN-019, RN-025, RN-026, CA-004, CA-005, CA-006

**SPEC:** ADR-001, ADR-002, ADR-004, INV-003, INV-004, INV-008, INV-011, INV-012, REQ-007, REQ-008, REQ-009, REQ-010, REQ-011, REQ-013, REQ-014, AC-006, AC-007, AC-008, AC-013

### Context Pack mínimo

- Handoffs dos slices 03 e 04.
- `PRD-v1.md`: requisitos de alteração do valor e cenários de invalidação/concorrência.
- `doc-specs/spec-v1.md`: estrutura da invalidação, invariantes, update e atomicidade.
- Código atual: atualização de demanda, ciclo canônico, transação e formulário.

### Escopo

- Comparar `amountCents` anterior e novo no backend antes de mutar.
- Invalidar ciclo pendente ao mudar valor em `Aguardando aprovação`.
- Invalidar aprovação ao mudar valor em `Aprovada`.
- Registrar atualização e invalidação com ordem inequívoca, mesmo instante e referência ao ciclo.
- Retornar a `Nova` e remover a autorização operacional, sem apagar o ciclo.
- Preservar avaliação/aprovação quando o valor numérico é idêntico.
- Em `Rejeitada`, permitir mudança de valor sem “invalidar” uma decisão já terminal.
- Manter bloqueio de valor em `Em andamento` e `Concluída`.
- Apresentar aviso de perda de validade e próxima ação de reenvio.
- Cobrir corrida entre decisão e mudança de valor usando trava, versão e ciclo.

### Acceptance Criteria

- [ ] Dada demanda `Aguardando aprovação`, quando o solicitante muda efetivamente o valor, então o ciclo pendente é invalidado, a situação volta a `Nova` e novo envio é exigido.
- [ ] Dada demanda `Aprovada`, quando o solicitante muda efetivamente o valor antes do início, então a aprovação permanece histórica, recebe invalidação e deixa de autorizar execução.
- [ ] Dada invalidação, então o novo valor, a situação, a invalidação e todos os eventos são persistidos ou rejeitados como uma única unidade.
- [ ] Dada atualização com o mesmo `amountCents`, então nenhuma invalidação é criada e a avaliação/aprovação mantém validade.
- [ ] Dada edição de campo diferente do valor, então a validade do ciclo aplicável é preservada.
- [ ] Dada demanda `Rejeitada`, quando o valor muda, então a rejeição permanece imutável e não recebe invalidação artificial.
- [ ] Dada demanda `Em andamento` ou `Concluída`, quando uma atualização contém valor diferente, então a mutação é recusada e valor/histórico permanecem inalterados.
- [ ] Dadas decisão e mudança de valor concorrentes, então a ordem serializada resulta em conflito para a segunda ação e nunca produz aprovação válida para valor diferente do atual.
- [ ] Dada invalidação visível, então a interface informa que nova aprovação é necessária e oferece o reenvio apenas quando permitido.

### Testes e verificação

- Testes de domínio para mudança pendente, aprovada, rejeitada, em execução e concluída.
- Teste explícito de igualdade numérica do valor e edição de campo não monetário.
- Teste de armazenamento para falha durante a gravação conjunta sem estado parcial.
- Teste concorrente decisão versus atualização usando duas instâncias.
- E2E: invalidar avaliação pendente; invalidar aprovação; reenviar o novo valor.
- E2E: valor desabilitado em execução e recusa do backend por requisição direta.
- Executar testes direcionados, `npm run validate` e os cenários E2E de invalidação.

### Handoff

Registrar:

- regras aplicadas a cada situação durante `update`;
- ordem dos eventos gerados por invalidação;
- evidências de atomicidade e corrida decisão versus valor;
- mensagens e affordances mostradas após invalidação;
- comandos executados e resultados;
- próximo passo exato: consolidar histórico multi-ciclo, consulta, concorrência e acessibilidade do fluxo completo.

---

## Slice 06 — Consolidar auditoria, concorrência e experiência

### Resultado esperado

Qualquer perfil pode compreender e reconstruir todos os ciclos de uma demanda, inclusive envio, rejeição, reenvio, aprovação e invalidação. O fluxo completo resiste a concorrência e repetição, mantém mensagens claras em português e atende aos gates finais de acessibilidade e validação.

### Dependências

Bloqueado pelo slice 05.

### Source IDs

**PRD:** RN-011, RN-012, RN-013, RN-019, RN-024, RN-025, RN-026, RN-027, RN-028, CA-006, CA-007, CA-008, CA-010

**SPEC:** CON-005, CON-007, ADR-002, ADR-004, INV-001, INV-008, INV-009, INV-010, INV-011, REQ-013, REQ-014, SEC-001, SEC-002, SEC-003, SEC-004, SEC-005, SEC-006, RES-001, RES-002, RES-003, PER-001, PER-002, SCL-001, AC-009, AC-010, AC-013, AC-015

### Context Pack mínimo

- Handoff do slice 05 e decisões consolidadas dos slices anteriores.
- `PRD-v1.md`: histórico/consulta, riscos e critérios CA-006 a CA-010.
- `doc-specs/spec-v1.md`: histórico, experiência, segurança, robustez e estratégia de testes.
- Código atual: detalhes/timeline, feedback do portal, erros HTTP e suíte completa.

### Escopo

- Consolidar a apresentação cronológica dos eventos com valor, ator, resultado, justificativa e vínculo de ciclo quando aplicáveis.
- Garantir que mensagens sejam apenas apresentação e que regras usem dados estruturados.
- Tornar múltiplos ciclos distinguíveis e compreensíveis sem expor detalhes técnicos.
- Revisar capacidades visuais por ator/situação e as respectivas validações no backend.
- Padronizar feedback de sucesso, recusa e conflito em português.
- Garantir recarga única após mutação e ausência de polling.
- Completar cenários de concorrência, repetição e preservação de arquivo.
- Realizar revisão de acessibilidade do fluxo completo em temas claro e escuro.
- Executar a validação integral e documentar qualquer impedimento real.
- Não introduzir novos comportamentos de negócio, refatoração ampla ou dependências.

### Acceptance Criteria

- [ ] Dada demanda com rejeição, edição, reenvio, aprovação e invalidação, quando qualquer perfil consulta os detalhes, então consegue distinguir cada ciclo, valor, ator, instante, resultado e justificativa aplicável.
- [ ] Dado qualquer evento de decisão ou invalidação, então seus campos estruturados e o ciclo canônico concordam sem depender do texto da mensagem.
- [ ] Dado histórico com eventos no mesmo instante, então a ordem persistida e exibida permanece determinística e inequívoca.
- [ ] Dada decisão já encerrada, quando qualquer repetição ou tela obsoleta tenta alterá-la, então recebe conflito e nenhum evento duplicado é criado.
- [ ] Dado erro de autorização, validação, conflito ou armazenamento, então a interface apresenta mensagem clara em português sem revelar stack trace, caminho local ou dados internos.
- [ ] Dada uma ação indisponível na interface, quando a mesma requisição é construída diretamente, então o backend aplica a mesma regra e recusa a mutação.
- [ ] Dado o fluxo completo operado por teclado, então diálogos, campos, alertas, ações e situações possuem nome, foco e estado perceptíveis sem depender apenas de cor.
- [ ] Dado sucesso em qualquer mutação, então o cliente faz uma única recarga do estado canônico e apresenta feedback específico.
- [ ] Dado o arquivo de trabalho do participante, então nenhuma execução de teste ou validação o lê, substitui ou reseta.
- [ ] Dado o conjunto final de mudanças, então typecheck, lint, testes, build e E2E passam com Node.js 24 ou todo impedimento externo é registrado com o comando e a saída correspondente.

### Testes e verificação

- Teste de domínio reconstruindo pelo menos dois ciclos completos com rejeição, aprovação e invalidação.
- Testes de API para matriz final de 400, 403, 404, 409, 413, 415, 500 e 503 onde simulável.
- Testes de armazenamento para decisão concorrente, escrita inválida e preservação dos bytes anteriores.
- E2E dos caminhos aprovado, rejeitado/reaprovado, invalidado/reaprovado e legado.
- Verificação de teclado, foco, alertas, rótulos e contraste funcional nos dois temas.
- Executar `npm run doctor`, `npm run validate` e `npm run test:e2e`.

### Handoff

Registrar:

- matriz final de Source IDs cobertos e eventuais lacunas;
- arquivos alterados por slice e decisões que mudaram durante a implementação;
- comandos executados, resultados e evidências dos fluxos demonstráveis;
- riscos residuais e limitações aceitas do armazenamento local;
- confirmação de que dados do participante e mudanças não relacionadas foram preservados;
- próximo passo exato: revisão de código contra PRD/spec e preparação do handoff de entrega, sem ampliar o escopo.

## 4. Matriz de cobertura dos requisitos de negócio

| Source IDs do PRD | Slice principal |
| ----------------- | --------------- |
| RN-001–RN-004     | 02              |
| RN-005            | 04              |
| RN-006–RN-009     | 03              |
| RN-010            | 04              |
| RN-011–RN-013     | 03, 04 e 06     |
| RN-014            | 02 e 05         |
| RN-015–RN-016     | 05              |
| RN-017            | 04 e 05         |
| RN-018–RN-019     | 05              |
| RN-020–RN-021     | 02 e 03         |
| RN-022–RN-023     | 01              |
| RN-024            | 02 e 06         |
| RN-025–RN-027     | 04, 05 e 06     |
| RN-028            | 01 e 06         |
| CA-001            | 02 e 03         |
| CA-002            | 03 e 04         |
| CA-003            | 04              |
| CA-004–CA-005     | 05              |
| CA-006–CA-007     | 03, 04 e 06     |
| CA-008            | 04 e 06         |
| CA-009            | 01              |
| CA-010            | 01 e 06         |

## 5. Regra de conclusão de cada slice

Um slice está pronto para handoff somente quando:

- entrega o comportamento vertical descrito em “Resultado esperado”;
- satisfaz seus Acceptance Criteria sem depender de trabalho futuro;
- mantém verdes os testes existentes e os testes direcionados do slice;
- preserva regras fora do escopo e dados do participante;
- registra comandos e resultados reais, sem declarar verificações não executadas;
- deixa um handoff compacto para a sessão seguinte;
- não carrega pendências ocultas que invalidem o comportamento demonstrável.
