---
title: "Especificação técnica — Aprovação de orçamento"
version: "1.0"
date_created: "2026-09-19"
last_updated: "2026-09-19"
owner: "Engenharia Nexo"
status: "Pronta para implementação"
tags: [architecture, process, design, typescript, nextjs, approval]
---

# Introdução

Esta especificação define a evolução técnica do Nexo para exigir aprovação do valor solicitado antes do início de novas demandas. A solução preserva a arquitetura local existente — Next.js 16, TypeScript, Zod e armazenamento JSON transacional — e acrescenta um fluxo auditável de envio, decisão, invalidação, reenvio e execução.

O documento deriva de `PRD-v1.md`, localizado na raiz da branch de trabalho. O caminho originalmente indicado, `doc-specs/PRD-v1.md`, não existe nesta revisão. Também foram reconciliados `doc-specs/constitution.md`, `docs/workshop-brief.md`, os guias em `docs-agents/`, o código atual e os contratos documentados do starter.

## 1. Propósito e escopo

### 1.1 Propósito

Definir requisitos, modelo de domínio, persistência, migração, comandos, contratos HTTP, comportamento da interface, segurança, concorrência e estratégia de testes necessários para implementar a aprovação de orçamento com rastreabilidade e sem perda de dados existentes.

### 1.2 Escopo funcional

A versão 1 inclui:

- envio e reenvio de demanda pelo solicitante;
- aprovação ou rejeição por gestor elegível;
- bloqueio de autoaprovação;
- justificativa obrigatória para rejeição;
- invalidação automática por mudança efetiva do valor antes da execução;
- vínculo inequívoco entre decisão, ciclo de avaliação e valor submetido;
- bloqueio do valor durante a execução e após a conclusão;
- preservação dos ciclos anteriores;
- conclusão de demandas que já estavam em andamento antes da migração;
- migração automática de dados do esquema 1 para o esquema 2;
- feedback e ações contextuais em português.

### 1.3 Fora do escopo

- autenticação real ou autorização baseada em sessão;
- banco de dados, Docker, filas ou serviços externos;
- alçadas por valor, múltiplas aprovações ou comitê;
- cancelamento manual de envio pendente;
- comentários opcionais em aprovações;
- edição ou exclusão de decisões;
- notificações, anexos, saldo orçamentário ou pagamentos;
- reabertura de demanda concluída;
- métricas externas ou telemetria persistente.

### 1.4 Restrições arquiteturais

- **CON-001:** usar Node.js `>=24 <25` e as versões do `package-lock.json`.
- **CON-002:** manter Next.js App Router e o Route Handler existente em `/api/demands`.
- **CON-003:** manter o armazenamento JSON local e sua transação protegida por trava.
- **CON-004:** não adicionar dependências, banco, autenticação real ou serviços externos.
- **CON-005:** todas as regras devem ser aplicadas no domínio/backend; a interface não é fronteira de segurança.
- **CON-006:** preservar dados do participante, a seed versionada e alterações não relacionadas.
- **CON-007:** manter textos, situações e mensagens em português e conforme o glossário do Nexo.

## 2. Definições

| Termo                  | Definição técnica                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Demanda                | Agregado que concentra dados, situação, versão, ciclos de avaliação e histórico.                                               |
| Ciclo de avaliação     | Registro imutável de um envio, seu valor e seu desfecho opcional.                                                              |
| Avaliação pendente     | Ciclo sem decisão e sem invalidação. Existe no máximo um por demanda.                                                          |
| Aprovação válida       | Último ciclo aprovado, não invalidado, cujo valor submetido é igual ao valor atual.                                            |
| Invalidação            | Encerramento sem decisão de um ciclo pendente ou revogação da validade operacional de uma aprovação devido à mudança do valor. |
| Demanda legada         | Demanda migrada do esquema 1 que já estava `Em andamento`; pode ser concluída sem aprovação retroativa.                        |
| Versão                 | Inteiro otimista incrementado uma vez por comando bem-sucedido.                                                                |
| Evento                 | Registro append-only, legível por pessoas, de uma mudança efetivada no agregado.                                               |
| Ator                   | Perfil fictício identificado pelo cabeçalho `x-demo-user` e resolvido no servidor.                                             |
| Conteúdo significativo | Texto cujo resultado após `trim()` tem pelo menos 3 caracteres.                                                                |

## 3. Arquitetura da solução

### 3.1 Fluxo de uma mutação

1. O cliente envia um comando JSON e a versão conhecida da demanda.
2. O Route Handler limita origem, mídia e tamanho do corpo.
3. Zod rejeita dados ausentes, inválidos ou campos inesperados.
4. O servidor resolve o ator a partir dos usuários persistidos.
5. `JsonStore.update` obtém a trava exclusiva e carrega/migra o estado.
6. O domínio verifica versão, papel, titularidade, situação e invariantes.
7. O domínio altera o agregado e acrescenta todos os registros de auditoria em memória.
8. O armazenamento valida o banco completo e substitui o arquivo de forma atômica.
9. A API devolve a demanda persistida; o cliente recarrega o estado canônico.

Nenhuma etapa intermediária pode ser persistida. Falha de validação ou gravação mantém o arquivo anterior.

### 3.2 Responsabilidades

| Componente                         | Mudança esperada                                               |
| ---------------------------------- | -------------------------------------------------------------- |
| `src/domain/model.ts`              | Esquema v2, situações, ciclos, eventos e comandos estritos.    |
| `src/domain/demands.ts`            | Máquina de estados, autorização, invariantes e auditoria.      |
| `src/server/json-store.ts`         | Leitura v1/v2 e migração v1 → v2 dentro da trava.              |
| `src/server/http.ts`               | Parse dos novos comandos e tradução consistente de erros.      |
| `src/components/portal.tsx`        | Envio de comandos, recarga e feedback específico.              |
| `src/components/demand-detail.tsx` | Ações por capacidade, decisão, valor aprovado e histórico.     |
| `src/components/demand-form.tsx`   | Edição com bloqueio contextual do valor.                       |
| `src/components/shared.tsx`        | Identidade visual das novas situações.                         |
| `tests/`                           | Cobertura de domínio, API, migração, concorrência e navegador. |

### 3.3 Decisões de desenho

- **ADR-001 — Agregado único:** demanda, ciclos e histórico são gravados juntos. Isso preserva atomicidade com o armazenamento disponível.
- **ADR-002 — Ciclos estruturados:** decisões não serão inferidas de `history.message`. `approvalCycles` é o registro canônico para invariantes; `history` é a trilha cronológica apresentada.
- **ADR-003 — Comandos explícitos:** substituir o significado ambíguo de `advance` por `submitForApproval`, `decideApproval`, `start` e `complete`.
- **ADR-004 — Concorrência em duas camadas:** `version` detecta cliente obsoleto; a trava serializa processos locais. A primeira mutação válida vence.
- **ADR-005 — Migração materializada:** dados v1 são convertidos e persistidos como v2 na primeira leitura protegida por trava.
- **ADR-006 — Exceção legada explícita:** `legacyExecution: true` somente para demandas v1 migradas de `Em andamento`. Novas demandas nunca recebem essa marca.
- **ADR-007 — Escalabilidade proporcional:** arrays locais são adequados ao workshop. Paginação, índice e banco distribuído não serão simulados; a separação domínio/armazenamento permite evolução futura.

## 4. Modelo de domínio e contratos de dados

### 4.1 Situações

```ts
type DemandStatus =
  | "Nova"
  | "Aguardando aprovação"
  | "Aprovada"
  | "Rejeitada"
  | "Em andamento"
  | "Concluída";
```

### 4.2 Ciclo de avaliação

```ts
type ApprovalDecision = {
  result: "approved" | "rejected";
  decidedBy: string;
  decidedByName: string;
  decidedAt: string; // ISO 8601 UTC
  justification?: string; // obrigatório somente em rejected
};

type ApprovalInvalidation = {
  invalidatedBy: string;
  invalidatedByName: string;
  invalidatedAt: string; // ISO 8601 UTC
  reason: "amount_changed";
  replacementAmountCents: number;
};

type ApprovalCycle = {
  id: string; // UUID
  submittedAmountCents: number;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string; // ISO 8601 UTC
  decision?: ApprovalDecision;
  invalidation?: ApprovalInvalidation;
};
```

Regras estruturais:

- `submittedAmountCents` é inteiro positivo, no máximo `100_000_000`.
- `decision` e `invalidation` podem coexistir somente quando a decisão foi `approved`; isso representa aprovação histórica posteriormente invalidada.
- Uma rejeição é terminal para o ciclo e nunca é invalidada por edição posterior.
- Um ciclo pendente invalidado não recebe decisão.
- Campos de ator incluem ID estável e nome capturado no momento do evento, preservando legibilidade histórica.
- `justification` deve estar ausente na aprovação e presente na rejeição.

### 4.3 Demanda v2

```ts
type Demand = DemandInput & {
  id: string;
  requesterId: string;
  status: DemandStatus;
  version: number;
  legacyExecution: boolean;
  createdAt: string;
  updatedAt: string;
  approvalCycles: ApprovalCycle[];
  history: HistoryEvent[];
};

type DatabaseV2 = {
  schemaVersion: 2;
  nextId: number;
  users: User[];
  demands: Demand[];
};
```

`legacyExecution` é obrigatório para evitar inferência futura por data, ID ou ausência de aprovação. Para registros criados em v2, seu valor é sempre `false`.

### 4.4 Eventos do histórico

```ts
type HistoryKind =
  | "created"
  | "updated"
  | "approval_submitted"
  | "approval_approved"
  | "approval_rejected"
  | "approval_invalidated"
  | "started"
  | "completed";

type HistoryEvent = {
  id: string;
  actorId: string;
  actorName: string;
  at: string;
  kind: HistoryKind;
  message: string;
  approvalCycleId?: string;
  amountCents?: number;
  justification?: string;
};
```

Os campos estruturados evitam parsing de mensagens e permitem validar rastreabilidade. As mensagens permanecem apropriadas para apresentação, por exemplo:

- `Enviou R$ 1.200,00 para aprovação.`
- `Aprovou o valor de R$ 1.200,00.`
- `Rejeitou o valor de R$ 1.200,00.`
- `Alterou o valor solicitado de R$ 1.200,00 para R$ 1.500,00.`
- `Invalidou a aprovação anterior após alteração do valor solicitado.`

Quando um comando gera mais de um evento, todos recebem o mesmo `at`, IDs distintos e ordem determinística no array.

### 4.5 Invariantes do agregado

- **INV-001:** existe no máximo um ciclo pendente por demanda.
- **INV-002:** `Aguardando aprovação` implica exatamente um ciclo pendente para o valor atual.
- **INV-003:** `Aprovada` implica aprovação não invalidada para o valor atual.
- **INV-004:** `Nova` não possui ciclo pendente nem aprovação válida.
- **INV-005:** `Rejeitada` tem como último ciclo uma rejeição e nenhum ciclo pendente.
- **INV-006:** `Em andamento` não legada deve possuir aprovação para o valor atual; sua posterior validade não é recalculada porque o valor fica imutável.
- **INV-007:** `legacyExecution` só pode ser `true` em demanda migrada que esteja `Em andamento` ou, depois, `Concluída`.
- **INV-008:** decisões e invalidações existentes nunca são sobrescritas ou removidas.
- **INV-009:** cada mutação bem-sucedida incrementa `version` exatamente uma vez.
- **INV-010:** `updatedAt` é igual ao instante do último comando bem-sucedido.
- **INV-011:** histórico e ciclo alterados por um comando referenciam o mesmo `approvalCycleId`.
- **INV-012:** o valor é imutável em `Em andamento` e `Concluída`.

## 5. Comandos e regras de negócio

### 5.1 Contrato dos comandos

```ts
type Command =
  | { type: "create"; input: DemandInput }
  | { type: "update"; id: string; version: number; input: DemandInput }
  | { type: "submitForApproval"; id: string; version: number }
  | {
      type: "decideApproval";
      id: string;
      version: number;
      cycleId: string;
      decision: "approve" | "reject";
      justification?: string;
    }
  | { type: "start"; id: string; version: number }
  | { type: "complete"; id: string; version: number };
```

Todos os objetos Zod devem usar `.strict()`. `id`, `cycleId` e `version` são obrigatórios onde indicados. O cliente deve enviar `cycleId` ao decidir para impedir que uma tela antiga decida acidentalmente um reenvio mais recente, mesmo que futuramente a política de versão seja alterada.

### 5.2 Matriz de autorização e transição

| Comando                  | Origem permitida                                        | Ator                   | Destino                | Efeito principal                 |
| ------------------------ | ------------------------------------------------------- | ---------------------- | ---------------------- | -------------------------------- |
| `create`                 | —                                                       | qualquer perfil        | `Nova`                 | cria demanda própria, não legada |
| `update` sem mudar valor | `Nova`, `Aguardando aprovação`, `Aprovada`, `Rejeitada` | solicitante            | mantém                 | atualiza conteúdo permitido      |
| `update` mudando valor   | `Nova`                                                  | solicitante            | `Nova`                 | apenas atualiza                  |
| `update` mudando valor   | `Aguardando aprovação`                                  | solicitante            | `Nova`                 | invalida ciclo pendente          |
| `update` mudando valor   | `Aprovada`                                              | solicitante            | `Nova`                 | invalida aprovação               |
| `update` mudando valor   | `Rejeitada`                                             | solicitante            | `Rejeitada`            | preserva rejeição                |
| `submitForApproval`      | `Nova`, `Rejeitada`                                     | solicitante            | `Aguardando aprovação` | acrescenta ciclo pendente        |
| `decideApproval/approve` | `Aguardando aprovação`                                  | gestor não solicitante | `Aprovada`             | encerra ciclo com aprovação      |
| `decideApproval/reject`  | `Aguardando aprovação`                                  | gestor não solicitante | `Rejeitada`            | encerra ciclo com justificativa  |
| `start`                  | `Aprovada`                                              | solicitante            | `Em andamento`         | consome autorização operacional  |
| `complete`               | `Em andamento`                                          | solicitante            | `Concluída`            | conclui, inclusive legado        |

### 5.3 Requisitos funcionais

- **REQ-001:** `submitForApproval` deve capturar o valor vigente e rejeitar envio duplicado.
- **REQ-002:** envio e reenvio são permitidos apenas ao solicitante.
- **REQ-003:** decisão exige `actor.role === "gestor"` e `actor.id !== requesterId`.
- **REQ-004:** decisão exige situação pendente, ciclo correspondente, valor submetido igual ao atual e ausência de decisão/invalidação.
- **REQ-005:** rejeição deve normalizar a justificativa com `trim()`, exigir 3–500 caracteres e armazenar o texto normalizado.
- **REQ-006:** aprovação deve rejeitar justificativa presente com conteúdo, mantendo contrato inequívoco.
- **REQ-007:** atualização que não muda `amountCents` preserva avaliação ou aprovação.
- **REQ-008:** mudança efetiva do valor pendente invalida o ciclo, registra atualização e invalidação e retorna a `Nova`.
- **REQ-009:** mudança efetiva do valor aprovado invalida a aprovação, registra ambos os fatos e retorna a `Nova`.
- **REQ-010:** edição em `Rejeitada` não altera o ciclo encerrado; reenvio cria novo ciclo.
- **REQ-011:** `start` exige aprovação válida e correspondência exata do valor.
- **REQ-012:** `complete` não exige aprovação para `legacyExecution === true`.
- **REQ-013:** dados e histórico só mudam depois de todas as pré-condições do comando passarem.
- **REQ-014:** toda recusa deve retornar mensagem em português, específica e sem mutação.
- **REQ-015:** situações não listadas na matriz devem ser recusadas com HTTP 409.

### 5.4 Resoluções das questões abertas do PRD

- **Valor zero:** continua proibido. O domínio atual exige inteiro positivo; a política se aplica a qualquer valor válido, a partir de R$ 0,01.
- **Justificativa:** após `trim()`, mínimo de 3 e máximo de 500 caracteres. Esse limite é inferior ao corpo máximo da API e suficiente para orientação objetiva.
- **Cancelamento:** não existe nesta versão. Alterar efetivamente o valor é a única forma prevista de invalidar um envio pendente.
- **Reenvio sem edição:** permitido, conforme PRD.
- **Vigência:** materializada pela migração. Apenas registros v1 em `Em andamento` recebem `legacyExecution: true`.

## 6. Persistência e migração

### 6.1 Estratégia de compatibilidade

O armazenamento deve aceitar na leitura `DatabaseV1 | DatabaseV2`, mas sempre devolver e gravar `DatabaseV2`. Não tornar campos v2 opcionais no modelo canônico, pois isso espalharia compatibilidade legada pelo domínio.

Algoritmo de migração, executado dentro da trava:

1. Ler e interpretar JSON bruto.
2. Se `schemaVersion === 2`, validar integralmente e devolver.
3. Se `schemaVersion === 1`, validar integralmente com um esquema v1 dedicado.
4. Mapear cada demanda sem remover ou reescrever eventos existentes.
5. Definir `approvalCycles: []`.
6. Definir `legacyExecution: status === "Em andamento"`.
7. Manter situação, versão, datas, IDs, usuários, `nextId` e histórico exatamente como estavam.
8. Validar o resultado com `databaseV2Schema`.
9. Persistir v2 pelo mecanismo temporário + `rename` existente.

Demandas v1 `Nova` passam a exigir aprovação. Demandas v1 `Concluída` permanecem somente leitura e recebem `legacyExecution: false`, pois não precisam de exceção para transição futura. Demandas v1 `Em andamento` recebem a exceção explícita.

### 6.2 Propriedades obrigatórias da migração

- **MIG-001:** idempotente; ler v2 não cria novos eventos nem altera versões.
- **MIG-002:** não cria aprovações retroativas.
- **MIG-003:** não altera `data/seed.json` durante execução; a seed versionada deve ser atualizada deliberadamente para v2 na implementação.
- **MIG-004:** falha de parse ou validação preserva o arquivo original e retorna `StoreError`.
- **MIG-005:** falha ao gravar a migração preserva o arquivo anterior.
- **MIG-006:** duas instâncias concorrentes observam a mesma migração serializada pela trava.
- **MIG-007:** o reset continua criando backup antes de substituir os dados.

### 6.3 Atomicidade e concorrência

Toda decisão, mudança de situação, ciclo e histórico acontece no mesmo callback síncrono de `store.update`. O callback não deve realizar I/O nem retornar Promise. A trava existente serializa o ciclo leitura–alteração–gravação entre instâncias locais.

Casos concorrentes:

- duas decisões com a mesma versão: a primeira grava; a segunda recarrega v2 e recebe 409 por versão desatualizada;
- decisão versus mudança de valor: uma vence; a outra recebe 409. Nunca há aprovação válida para o novo valor sem novo ciclo;
- dois envios: o primeiro cria o ciclo; o segundo recebe 409;
- repetição por duplo clique: o cliente desabilita ações, mas o backend recusa a versão/ciclo encerrado.

Não há promessa de coordenação distribuída entre máquinas ou filesystems sem semântica de criação/rename atômicos. Isso é deliberadamente fora do escopo.

## 7. Contrato HTTP e erros

### 7.1 Endpoints

- `GET /api/demands`: mantém resposta `DatabaseV2`, `Cache-Control: no-store`.
- `POST /api/demands`: mantém envelope de comando, resposta `{ demand }` e `201` apenas para `create`; demais sucessos retornam `200`.

O runtime permanece Node.js. Permanecem: proteção de origem, exigência de `application/json`, limite de 20.000 caracteres, parse seguro e resolução de perfil no servidor.

### 7.2 Semântica de status

| HTTP | Uso                                                                           |
| ---- | ----------------------------------------------------------------------------- |
| 400  | JSON/esquema inválido ou justificativa inválida.                              |
| 403  | perfil inexistente, papel insuficiente, ator não titular ou autoaprovação.    |
| 404  | demanda ou ciclo inexistente.                                                 |
| 409  | versão obsoleta, transição incompatível, ciclo encerrado ou valor divergente. |
| 413  | corpo excede o limite.                                                        |
| 415  | mídia diferente de JSON.                                                      |
| 500  | falha inesperada, sem detalhe interno no cliente.                             |
| 503  | indisponibilidade/trava/arquivo inválido no armazenamento.                    |

### 7.3 Mensagens mínimas

- `Somente o solicitante pode enviar esta demanda para aprovação.`
- `Somente um gestor pode decidir esta avaliação.`
- `Você não pode decidir a própria demanda.`
- `Informe uma justificativa entre 3 e 500 caracteres para rejeitar.`
- `Esta avaliação já foi encerrada. Atualize os detalhes da demanda.`
- `O valor solicitado mudou. Envie a demanda para uma nova aprovação.`
- `A demanda precisa de uma aprovação válida para iniciar a execução.`
- `O valor solicitado não pode ser alterado após o início da execução.`

## 8. Experiência e interface

### 8.1 Quadro e situação

O quadro deve suportar as seis situações e manter leitura clara em temas claro e escuro. A situação exibida é sempre o campo canônico da demanda; a interface não a deriva do histórico.

O resumo de “Demandas abertas” continua incluindo todas exceto `Concluída`. O valor em aberto segue a mesma regra. Busca, área, prioridade e “Só minhas” permanecem inalterados.

### 8.2 Detalhes e ações

A tela de detalhes deve exibir:

- solicitante e valor atual antes das ações de gestor;
- valor aprovado quando a situação for `Aprovada`;
- aviso de necessidade de reenvio em `Rejeitada`;
- justificativa integral de rejeição no histórico;
- ações permitidas pelo ator e pela situação;
- motivo textual quando o perfil não pode agir.

Matriz de ações visíveis:

| Situação               | Solicitante                               | Gestor elegível   | Demais pessoas |
| ---------------------- | ----------------------------------------- | ----------------- | -------------- |
| `Nova`                 | Editar; Enviar para aprovação             | Consultar         | Consultar      |
| `Aguardando aprovação` | Editar                                    | Aprovar; Rejeitar | Consultar      |
| `Aprovada`             | Editar; Iniciar execução                  | Consultar         | Consultar      |
| `Rejeitada`            | Editar; Reenviar                          | Consultar         | Consultar      |
| `Em andamento`         | Editar apenas campos permitidos; Concluir | Consultar         | Consultar      |
| `Concluída`            | Consultar                                 | Consultar         | Consultar      |

Durante `Em andamento`, o formulário pode continuar permitindo título, descrição, área e prioridade, mas deve desabilitar o valor. O backend deve comparar o valor recebido e recusá-lo se diferente. Em `Concluída`, não há edição.

### 8.3 Decisão

- “Aprovar” pede confirmação simples e não apresenta justificativa.
- “Rejeitar” abre formulário com textarea obrigatório, contador e limites 3–500.
- O foco inicial vai ao título do diálogo ou à justificativa; erros usam `role="alert"`.
- Escape/Cancelar fecha sem mutação; durante envio, controles ficam desabilitados.
- Após sucesso, o cliente recarrega dados e mostra feedback específico: `Demanda aprovada.`, `Demanda rejeitada.`, `Demanda enviada para aprovação.` etc.
- Em 409, a tela recarrega o estado e mantém mensagem que oriente a revisão.

### 8.4 Histórico

Mostrar eventos do mais recente para o mais antigo, preservando no dado a ordem de inserção. Cada item apresenta ator, ação, data/hora em `America/Sao_Paulo`, valor quando aplicável e justificativa quando aplicável. A relação por `approvalCycleId` deve permitir distinguir múltiplos ciclos sem depender da proximidade visual.

### 8.5 Acessibilidade

- ações devem ter rótulos textuais e estado `disabled` durante mutação;
- situação não pode ser comunicada apenas por cor;
- diálogos devem manter foco, fechar de forma previsível e ter nome acessível;
- campos devem associar erro/ajuda via `aria-describedby`;
- feedback assíncrono deve ser percebido por tecnologia assistiva;
- ordem de tabulação deve acompanhar a ordem visual.

## 9. Segurança, robustez e desempenho

- **SEC-001:** tratar `x-demo-user` apenas como identidade de demonstração, nunca como autenticação real.
- **SEC-002:** obter nome e papel exclusivamente dos dados do servidor; ignorar qualquer alegação do cliente.
- **SEC-003:** validar todos os comandos com esquemas estritos e limites de texto/número.
- **SEC-004:** escapar conteúdo pela renderização padrão do React; não usar HTML bruto.
- **SEC-005:** manter verificação de origem e limite do corpo.
- **SEC-006:** não retornar stack trace, caminho de arquivo ou JSON corrompido ao cliente.
- **RES-001:** validar o banco completo antes de gravar.
- **RES-002:** gravar temporário no mesmo diretório, sincronizar e substituir atomicamente.
- **RES-003:** não capturar erro de domínio depois de mutar parcialmente e prosseguir com a gravação.
- **PER-001:** manter uma única leitura GET após mutação; não introduzir polling.
- **PER-002:** evitar recomputações complexas; localizar demanda/ciclo linearmente é aceitável para o volume local.
- **SCL-001:** funções de domínio permanecem puras quanto a I/O, permitindo futura troca do repositório sem reescrever regras.

## 10. Critérios de aceite técnicos

- **AC-001:** Dada demanda `Nova`, quando o solicitante envia, então surge um único ciclo pendente para o valor atual e a situação vira `Aguardando aprovação`.
- **AC-002:** Dado solicitante também gestor, quando tenta decidir a própria demanda, então recebe 403 e nenhum dado muda.
- **AC-003:** Dada pessoa sem papel gestor, quando tenta decidir, então recebe 403 e nenhum dado muda.
- **AC-004:** Dada rejeição com texto vazio, espaços, menos de 3 ou mais de 500 caracteres, quando enviada, então recebe 400 e o ciclo permanece pendente.
- **AC-005:** Dada aprovação válida, quando o solicitante inicia com a versão atual, então a situação vira `Em andamento` e o valor fica imutável.
- **AC-006:** Dada mudança de valor em ciclo pendente, quando o update é persistido, então ciclo, invalidação, valor, situação e histórico mudam juntos.
- **AC-007:** Dada mudança de valor após aprovação, quando persistida, então a aprovação permanece histórica, fica invalidada e não autoriza execução.
- **AC-008:** Dada edição sem mudança efetiva do valor, então a aprovação/avaliação mantém validade.
- **AC-009:** Dadas duas decisões concorrentes, então apenas uma é persistida e a outra recebe 409.
- **AC-010:** Dada demanda rejeitada, quando reenviada, então um novo ciclo é acrescentado e o anterior permanece intacto.
- **AC-011:** Dado arquivo v1 com demanda em andamento, quando lido, então migra para v2 com `legacyExecution: true` e pode ser concluído.
- **AC-012:** Dado arquivo v1 com demanda nova, quando migrado, então não pode iniciar sem aprovação.
- **AC-013:** Dado arquivo inválido ou falha de escrita, então os bytes do arquivo anterior são preservados.
- **AC-014:** Dada demanda concluída, então nenhuma mutação é aceita.
- **AC-015:** Dada qualquer pessoa com acesso à demanda, então seu histórico completo de aprovação é consultável.

## 11. Estratégia de automação de testes

### 11.1 Domínio — `tests/demands.test.ts`

Cobrir cada transição válida e cada recusa da matriz, incluindo:

- papel, titularidade e autoaprovação;
- ciclos duplicados, decisão duplicada e `cycleId` obsoleto;
- justificativa nos limites 2, 3, 500 e 501, incluindo whitespace;
- valor alterado e valor idêntico;
- reenvio sem edição e com edição;
- preservação de versões, datas, atores e IDs;
- invariantes após sequências completas e falhas.

Usar relógio injetado pelo parâmetro `now` e afirmar timestamps determinísticos. Para concorrência lógica, aplicar comandos sobre versões conhecidas e verificar a segunda recusa.

### 11.2 API — `tests/http.test.ts`

Cobrir os novos comandos ponta a ponta pelo handler:

- resposta/status de sucesso e erro;
- campos inesperados;
- identidade inexistente;
- origem, mídia e corpo máximo;
- 403, 404, 409 e mensagens em português;
- resposta sem dados internos e demanda retornada na versão atualizada.

### 11.3 Armazenamento — `tests/store.test.ts`

- migrar fixture v1 sem perda de bytes lógicos;
- não remigrar v2;
- preservar demandas em andamento como legadas;
- serializar migração em duas instâncias;
- preservar arquivo em migração inválida ou gravação inválida;
- executar decisões concorrentes e persistir somente uma;
- confirmar backup no reset.

Todos os testes usam diretórios temporários; nunca `.local/demands.json` do participante.

### 11.4 Interface — `tests/e2e/`

Fluxos mínimos no Chromium:

1. criar → enviar → trocar para gestor → aprovar → trocar para solicitante → iniciar → concluir;
2. rejeitar sem justificativa e depois com justificativa → editar → reenviar → aprovar;
3. impedir autoaprovação de Bruno em demanda de Bruno;
4. alterar valor pendente/aprovado e observar invalidação/histórico;
5. concluir demanda legada em andamento;
6. conflito por duas páginas/perfis com recarga e mensagem adequada;
7. navegação por teclado e nomes acessíveis das novas ações.

### 11.5 Verificação de entrega

Executar com Node.js 24:

```sh
npm run doctor
npm run validate
npm run test:e2e
```

`npm run validate` deve cobrir typecheck, lint, testes e build. A implementação só está pronta quando essas verificações passam ou quando impedimentos são documentados com precisão.

## 12. Sequência recomendada de implementação

1. Introduzir modelos v1/v2, migração e testes do armazenamento.
2. Introduzir tipos v2, ciclos, invariantes e comandos no domínio.
3. Atualizar handler e testes HTTP.
4. Atualizar seed deliberadamente para v2.
5. Adaptar quadro, badges e detalhes às novas situações.
6. Implementar envio, decisão, reenvio, invalidação e feedback.
7. Acrescentar testes E2E e executar a validação completa.

Cada etapa deve manter o TypeScript compilável e não deve usar o arquivo de trabalho real em testes.

## 13. Rastreabilidade PRD → especificação

| PRD           | Cobertura técnica                                        |
| ------------- | -------------------------------------------------------- |
| RN-001–RN-005 | REQ-001–REQ-002, ciclos e comandos de envio              |
| RN-006–RN-013 | REQ-003–REQ-006, autorização, decisão imutável e eventos |
| RN-014–RN-019 | REQ-007–REQ-010, invalidação atômica e bloqueio          |
| RN-020–RN-023 | REQ-011–REQ-012, `start`, `complete`, legado             |
| RN-024–RN-028 | eventos estruturados, migração e histórico consultável   |
| CA-001–CA-010 | AC-001–AC-015 e estratégia de testes                     |

## 14. Riscos e mitigação

| Risco                                   | Mitigação                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| Estado e auditoria divergirem           | Validação de invariantes no esquema/domínio e gravação única.                              |
| Aprovar reenvio a partir de tela antiga | Exigir simultaneamente `version` e `cycleId`.                                              |
| Perder dados v1                         | Esquema v1 dedicado, migração sob trava e escrita atômica.                                 |
| Bloquear demanda antiga                 | Marca `legacyExecution` definida somente na migração.                                      |
| Duplicar decisões por concorrência      | Trava + controle otimista + ciclo terminal.                                                |
| Interface permitir ação indevida        | Capacidades visuais e validação independente no backend.                                   |
| Crescimento excessivo do arquivo        | Aceito no workshop; histórico append-only é requisito. Monitorar apenas se o escopo mudar. |
| Mensagens virarem fonte de regra        | Campos estruturados em ciclos e eventos; mensagem apenas para exibição.                    |

## 15. Dependências e integrações

### Plataforma

- **PLT-001:** Node.js 24.
- **PLT-002:** Next.js 16.3.5 com App Router e runtime Node.js.
- **PLT-003:** TypeScript 5.9.3 em modo configurado pelo projeto.
- **PLT-004:** React 19.3.0.
- **PLT-005:** Zod 4.6.5 para validação de fronteira e persistência.

### Infraestrutura

- **INF-001:** filesystem local com suporte às operações de trava e substituição usadas por `JsonStore`.
- **INF-002:** diretório gravável para `.local/` ou caminho explícito em `DEMANDS_DATA_FILE`.

### Integrações externas

Não há integrações externas nesta versão.

## 16. Validação de conformidade

A solução implementada estará conforme esta especificação quando:

- esquemas rejeitarem estados que violem as invariantes documentadas;
- todos os comandos forem validados no backend;
- migração v1 → v2 for idempotente e testada;
- toda decisão e invalidação for atômica e rastreável;
- nenhuma demanda não legada iniciar sem aprovação válida;
- o valor não puder mudar após o início;
- nenhuma decisão histórica puder ser sobrescrita;
- a interface apresentar as ações e mensagens em português;
- `npm run validate` e `npm run test:e2e` passarem em ambiente compatível.

## 17. Referências

- `PRD-v1.md`
- `doc-specs/constitution.md`
- `docs/workshop-brief.md`
- `docs/architecture.md`
- `docs-agents/contexto.md`
- `docs-agents/arquitetura.md`
- `docs-agents/dados.md`
- `docs-agents/validacao.md`
- `docs-agents/evolucao.md`
- `src/domain/model.ts`
- `src/domain/demands.ts`
- `src/server/http.ts`
- `src/server/json-store.ts`
