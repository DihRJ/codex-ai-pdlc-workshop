---
title: "PRD — Aprovação de orçamento"
version: "1.0"
date_created: "2026-09-19"
last_updated: "2026-09-19"
status: "Proposta para validação"
owner: "Produto Nexo"
---

# PRD — Aprovação de orçamento

## 1. Resumo executivo

O Nexo passará a exigir avaliação do **valor solicitado** antes do início da execução de novas demandas. O solicitante envia a demanda para avaliação; um gestor elegível aprova ou rejeita o orçamento; somente uma aprovação válida libera o início da execução.

A mudança reduz o risco de trabalho iniciado sem autorização orçamentária, preserva a segregação entre quem solicita e quem decide e cria rastreabilidade das decisões. Demandas já em andamento na entrada da política continuam seu fluxo sem aprovação retroativa.

## 2. Contexto e problema

Hoje, uma demanda pode sair de `Nova` diretamente para `Em andamento`, sem avaliação prévia do orçamento. Isso cria quatro riscos de negócio:

- execução sem autorização do valor solicitado;
- autoaprovação pelo próprio solicitante;
- rejeições sem justificativa suficiente para correção;
- perda de rastreabilidade quando o valor ou a decisão muda.

O fluxo precisa controlar esses riscos sem interromper demandas legadas nem apagar o histórico de avaliações anteriores.

## 3. Objetivos

### 3.1 Objetivos de negócio

- Garantir que toda nova demanda tenha aprovação válida antes de iniciar sua execução.
- Impedir que uma pessoa aprove a própria demanda.
- Assegurar que rejeições tenham justificativa e orientem o reenvio.
- Invalidar avaliações quando o valor solicitado mudar antes da execução.
- Preservar uma trilha histórica íntegra de envios, decisões e invalidações.
- Manter a continuidade das demandas que já estavam em andamento quando a política entrou em vigor.

### 3.2 Resultados esperados

- 100% das novas demandas iniciadas após a vigência com aprovação válida.
- 0 autoaprovações aceitas.
- 100% das rejeições com justificativa não vazia.
- 100% das decisões com gestor, data/hora, resultado e valor avaliado identificáveis.
- 0 demandas legadas em andamento bloqueadas por exigência retroativa.

## 4. Não objetivos

Esta versão não contempla:

- autenticação real, cadastro ou gestão de usuários;
- múltiplos níveis ou alçadas de aprovação por valor;
- aprovação por comitê, votação ou aprovação parcial;
- delegação, substituição temporária ou escalonamento de gestores;
- notificações por e-mail, mensageria ou serviços externos;
- anexos, centro de custo, saldo orçamentário, pagamento ou prestação de contas;
- prazo máximo de decisão, lembretes ou aprovação automática;
- reabertura de demanda concluída;
- aprovação retroativa de demandas legadas em execução.

## 5. Pessoas e responsabilidades

| Pessoa | Necessidade | Responsabilidade no fluxo |
| --- | --- | --- |
| Solicitante | Obter autorização e acompanhar a demanda | Criar, editar quando permitido, enviar para avaliação e iniciar a execução após aprovação válida |
| Gestor | Decidir com contexto e segurança | Aprovar ou rejeitar demandas de terceiros que aguardam avaliação |
| Pessoa consultora | Acompanhar a situação e o histórico | Consultar demandas sem alterar o fluxo quando não for solicitante nem gestor elegível |

Um perfil pode possuir papel de gestor e também ser solicitante. O papel de gestor não elimina a proibição de decidir sobre a própria demanda.

## 6. Glossário

| Termo | Definição neste PRD |
| --- | --- |
| Demanda | Necessidade interna acompanhada até sua conclusão |
| Solicitante | Pessoa que registra a demanda |
| Gestor | Pessoa habilitada a decidir sobre o orçamento |
| Valor solicitado | Quantia submetida à avaliação, exibida em reais |
| Avaliação pendente | Envio vigente que ainda não recebeu decisão |
| Aprovação válida | Aprovação referente ao valor solicitado atual e ainda não invalidada |
| Rejeição | Decisão desfavorável acompanhada de justificativa |
| Invalidação | Perda de validade de uma avaliação pendente ou aprovação após alteração do valor |
| Execução | Realização do trabalho, representada pela situação `Em andamento` |
| Demanda legada | Demanda que já estava `Em andamento` na entrada em vigor da política |
| Histórico da demanda | Registro cronológico de alterações e decisões, com pessoa e data/hora |

## 7. Premissas e decisões de produto

- A política se aplica a qualquer valor solicitado, sem valor mínimo ou máximo.
- A política passa a valer para demandas que ainda não estavam em execução na data de entrada em vigor.
- Uma demanda possui no máximo uma avaliação pendente por vez.
- Qualquer gestor, exceto o próprio solicitante, pode decidir uma avaliação pendente.
- A aprovação recai sobre o valor solicitado no momento do envio, não apenas sobre a demanda em abstrato.
- Editar conteúdo sem alterar o valor não invalida a avaliação. A governança de outros campos permanece como já existe no produto.
- Alterar o valor antes da execução invalida tanto uma avaliação pendente quanto uma aprovação vigente.
- Uma rejeição encerra o envio atual, mas não encerra a demanda; o solicitante pode corrigi-la e reenviá-la.
- Uma decisão já tomada é imutável: correções acontecem por novo envio, nunca pela sobrescrita do histórico.
- A justificativa é obrigatória somente na rejeição. Não haverá comentário obrigatório na aprovação nesta versão.
- A alteração de valor e a decisão devem considerar o estado mais recente da demanda; ações concorrentes não podem produzir aprovação válida para um valor diferente do atual.
- O início da execução consome a aprovação vigente como autorização do valor. A partir daí, o valor solicitado fica bloqueado.

### 7.1 Premissa documental

O arquivo solicitado `doc-specs/constitution.md` não estava presente na branch de trabalho na criação desta versão. Este PRD usa como fontes de negócio `docs/workshop-brief.md`, `docs-agents/contexto.md`, `docs-agents/evolucao.md` e `CONTEXT.md`. O documento deverá ser reconciliado com a constituição antes da aprovação final caso ela seja disponibilizada.

## 8. Jornada principal

1. O solicitante cria ou ajusta uma demanda em `Nova`.
2. O solicitante envia a demanda para avaliação.
3. A demanda passa a `Aguardando aprovação` e fica disponível para decisão de gestores elegíveis.
4. Um gestor que não seja o solicitante analisa o valor vigente.
5. Se aprovar, a demanda passa a `Aprovada` e pode ser iniciada pelo solicitante.
6. Se rejeitar, informa uma justificativa e a demanda passa a `Rejeitada`.
7. Em caso de rejeição, o solicitante corrige a demanda e realiza novo envio.
8. Ao iniciar, a demanda passa a `Em andamento`, e o valor fica bloqueado.
9. Ao finalizar, a demanda passa a `Concluída` e permanece somente para consulta.

## 9. Modelo de situações e transições

| Situação de origem | Ação | Condição principal | Situação de destino |
| --- | --- | --- | --- |
| `Nova` | Enviar para avaliação | Ator é o solicitante | `Aguardando aprovação` |
| `Aguardando aprovação` | Aprovar | Ator é gestor e não é o solicitante | `Aprovada` |
| `Aguardando aprovação` | Rejeitar | Ator é gestor, não é o solicitante e informou justificativa | `Rejeitada` |
| `Rejeitada` | Editar | Ator é o solicitante | `Rejeitada` |
| `Rejeitada` | Reenviar | Ator é o solicitante | `Aguardando aprovação` |
| `Aguardando aprovação` | Alterar valor | Ator é o solicitante; avaliação pendente é invalidada | `Nova` |
| `Aprovada` | Alterar valor | Ator é o solicitante; aprovação é invalidada | `Nova` |
| `Aprovada` | Iniciar execução | Aprovação corresponde ao valor atual | `Em andamento` |
| `Em andamento` | Concluir | Ator é o solicitante | `Concluída` |
| `Em andamento` legada | Concluir | Demanda já estava em execução na vigência | `Concluída` |

Não são permitidas transições diretas de `Nova`, `Aguardando aprovação` ou `Rejeitada` para `Em andamento`.

## 10. Requisitos de negócio

### 10.1 Envio para avaliação

- **RN-001 — Aplicação universal:** toda demanda abrangida pela nova política exige aprovação, independentemente do valor.
- **RN-002 — Titularidade do envio:** somente o solicitante pode enviar ou reenviar sua demanda.
- **RN-003 — Envio único vigente:** uma demanda com avaliação pendente não pode receber outro envio simultâneo.
- **RN-004 — Registro do envio:** cada envio deve registrar solicitante, data/hora e valor submetido no histórico.
- **RN-005 — Reenvio:** demanda rejeitada pode ser editada e reenviada sem apagar decisões anteriores.

### 10.2 Decisão do gestor

- **RN-006 — Elegibilidade:** somente perfil com papel de gestor pode aprovar ou rejeitar.
- **RN-007 — Segregação:** o solicitante nunca pode decidir a própria demanda, ainda que também seja gestor.
- **RN-008 — Estado válido:** somente avaliação pendente pode receber decisão.
- **RN-009 — Aprovação:** aprovação não exige justificativa e libera o início somente enquanto o valor permanecer igual ao avaliado.
- **RN-010 — Rejeição justificada:** rejeição exige justificativa com conteúdo significativo; espaços em branco não são aceitos.
- **RN-011 — Decisão única:** a primeira decisão válida encerra a avaliação; tentativas posteriores sobre o mesmo envio são recusadas.
- **RN-012 — Rastreabilidade:** toda decisão registra gestor, data/hora, resultado, valor avaliado e, na rejeição, justificativa.
- **RN-013 — Imutabilidade:** decisões registradas não podem ser editadas nem excluídas.

### 10.3 Alteração do valor

- **RN-014 — Antes do envio:** o solicitante pode alterar o valor enquanto a demanda estiver `Nova`.
- **RN-015 — Durante a avaliação:** alterar o valor invalida a avaliação pendente, retorna a demanda para `Nova` e exige novo envio.
- **RN-016 — Após aprovação:** alterar o valor antes da execução invalida a aprovação, retorna a demanda para `Nova` e exige novo envio.
- **RN-017 — Após rejeição:** o solicitante pode alterar o valor e reenviar, preservando a rejeição anterior.
- **RN-018 — Após início:** o valor solicitado não pode ser alterado quando a demanda estiver `Em andamento` ou `Concluída`.
- **RN-019 — Registro da invalidação:** o histórico deve indicar a alteração de valor e qual avaliação ou aprovação perdeu validade.

### 10.4 Início e conclusão da execução

- **RN-020 — Autorização para iniciar:** somente o solicitante pode iniciar uma demanda abrangida pela política e apenas com aprovação válida para o valor atual.
- **RN-021 — Bloqueio sem aprovação:** demanda nova, pendente ou rejeitada não pode iniciar.
- **RN-022 — Legado:** demanda já `Em andamento` na entrada da política pode ser concluída sem aprovação retroativa.
- **RN-023 — Conclusão:** demandas concluídas permanecem somente para consulta.

### 10.5 Histórico e consulta

- **RN-024 — Ordem temporal:** eventos aparecem em ordem cronológica inequívoca.
- **RN-025 — Permanência:** reenvio, invalidação e nova decisão acrescentam eventos; nunca substituem eventos anteriores.
- **RN-026 — Compreensão:** o histórico permite reconstruir cada ciclo de envio e decisão, incluindo valor, atores, resultado e justificativa aplicável.
- **RN-027 — Visibilidade:** qualquer perfil que possa consultar a demanda também pode consultar seu histórico de aprovação.
- **RN-028 — Dados existentes:** demandas e históricos anteriores à política permanecem disponíveis.

## 11. Requisitos de experiência

- A situação atual e a próxima ação possível devem ser compreensíveis sem interpretar o histórico.
- A pessoa deve receber motivo claro quando uma ação for impedida.
- O gestor deve visualizar solicitante e valor atual antes de decidir.
- A rejeição deve deixar explícito que a justificativa é obrigatória.
- A demanda aprovada deve indicar qual valor foi aprovado.
- Após alteração do valor, a interface deve informar que a avaliação anterior perdeu validade e que é necessário reenviar.
- Ações indisponíveis podem ser ocultadas ou desabilitadas, mas toda regra também deve ser aplicada independentemente do controle visual.
- Os textos devem usar exclusivamente o glossário do Nexo e permanecer em português.

## 12. Critérios de aceite

- **CA-001:** nenhuma demanda abrangida pela política inicia sem aprovação válida para seu valor atual.
- **CA-002:** nenhum solicitante decide a própria demanda.
- **CA-003:** nenhuma rejeição é concluída sem justificativa significativa.
- **CA-004:** mudar o valor antes da execução invalida envio pendente ou aprovação e exige reenvio.
- **CA-005:** o valor não muda depois do início da execução.
- **CA-006:** cada decisão permanece no histórico com ator, data/hora, resultado e valor; rejeições incluem justificativa.
- **CA-007:** múltiplas tentativas de decisão sobre o mesmo envio resultam em uma única decisão válida.
- **CA-008:** uma demanda rejeitada pode percorrer um novo ciclo completo de avaliação.
- **CA-009:** demandas legadas em andamento podem ser concluídas sem aprovação retroativa.
- **CA-010:** dados e histórico existentes permanecem consultáveis.

## 13. Cenários de aceite em Gherkin

### Funcionalidade: envio para avaliação

```gherkin
Funcionalidade: Enviar demanda para avaliação de orçamento

  Cenário: Solicitante envia uma demanda nova
    Dado que uma demanda está na situação "Nova"
    E que Ana é a solicitante
    Quando Ana enviar a demanda para avaliação
    Então a situação deve ser "Aguardando aprovação"
    E o histórico deve registrar Ana, a data e hora e o valor submetido

  Esquema do Cenário: A política se aplica a qualquer valor
    Dado que uma demanda nova possui valor solicitado de <valor>
    Quando o solicitante tentar iniciar a execução sem aprovação
    Então o início deve ser impedido
    E deve ser informado que uma aprovação válida é necessária

    Exemplos:
      | valor        |
      | R$ 0,00      |
      | R$ 0,01      |
      | R$ 1.200,00  |
      | R$ 999.999,99|

  Cenário: Pessoa que não é solicitante tenta enviar
    Dado que Ana é a solicitante de uma demanda nova
    Quando Bruno tentar enviá-la para avaliação
    Então o envio deve ser recusado
    E a situação e o histórico devem permanecer inalterados

  Cenário: Solicitante tenta duplicar um envio pendente
    Dado que a demanda já está "Aguardando aprovação"
    Quando o solicitante tentar enviá-la novamente
    Então o novo envio deve ser recusado
    E deve existir somente uma avaliação pendente
```

### Funcionalidade: decisão do gestor

```gherkin
Funcionalidade: Decidir sobre o valor solicitado

  Cenário: Gestor aprova demanda de outra pessoa
    Dado que Ana solicitou R$ 1.200,00
    E a demanda está "Aguardando aprovação"
    E Bruno é gestor e não é o solicitante
    Quando Bruno aprovar a demanda
    Então a situação deve ser "Aprovada"
    E o histórico deve registrar Bruno, a data e hora, o resultado "Aprovada" e R$ 1.200,00
    E Ana deve poder iniciar a execução

  Cenário: Gestor rejeita com justificativa
    Dado que uma demanda de outra pessoa aguarda aprovação
    Quando o gestor rejeitar com a justificativa "Valor acima do orçamento disponível"
    Então a situação deve ser "Rejeitada"
    E a justificativa deve constar integralmente no histórico

  Esquema do Cenário: Rejeição sem justificativa significativa
    Dado que uma demanda de outra pessoa aguarda aprovação
    Quando o gestor tentar rejeitar usando <justificativa>
    Então a rejeição deve ser recusada
    E a avaliação deve continuar pendente
    E nenhuma decisão deve ser acrescentada ao histórico

    Exemplos:
      | justificativa |
      | vazia         |
      | espaços       |
      | quebras de linha |

  Cenário: Solicitante com papel de gestor tenta se autoaprovar
    Dado que Ana é solicitante e também possui papel de gestor
    E a própria demanda de Ana aguarda aprovação
    Quando Ana tentar aprová-la
    Então a decisão deve ser recusada
    E a avaliação deve continuar pendente
    E nenhuma aprovação deve ser registrada

  Cenário: Pessoa sem papel de gestor tenta decidir
    Dado que uma demanda aguarda aprovação
    E Carlos não possui papel de gestor
    Quando Carlos tentar aprovar ou rejeitar
    Então a decisão deve ser recusada
    E a demanda deve permanecer inalterada

  Cenário: Gestor tenta decidir demanda sem avaliação pendente
    Dado que uma demanda está "Nova"
    Quando um gestor tentar aprová-la
    Então a decisão deve ser recusada
    E nenhuma decisão deve ser registrada

  Cenário: Dois gestores decidem simultaneamente
    Dado que uma demanda possui uma única avaliação pendente
    Quando dois gestores elegíveis enviarem decisões concorrentes
    Então somente a primeira decisão válida deve ser registrada
    E a segunda decisão deve ser recusada como avaliação já encerrada
    E a situação final deve corresponder à única decisão registrada

  Cenário: Repetição da mesma decisão
    Dado que um gestor já aprovou uma avaliação
    Quando a mesma decisão for enviada novamente
    Então não deve ser criada uma segunda aprovação
    E o histórico deve conter uma única decisão para o envio
```

### Funcionalidade: alteração do valor

```gherkin
Funcionalidade: Manter a aprovação vinculada ao valor avaliado

  Cenário: Alteração de valor durante avaliação pendente
    Dado que uma demanda de R$ 1.200,00 está "Aguardando aprovação"
    Quando o solicitante alterar o valor para R$ 1.500,00
    Então a avaliação pendente deve ser invalidada
    E a demanda deve voltar para "Nova"
    E o histórico deve registrar a alteração e a invalidação
    E um novo envio deve ser necessário

  Cenário: Alteração de valor depois da aprovação e antes da execução
    Dado que R$ 1.200,00 foram aprovados
    E a demanda ainda não está em execução
    Quando o solicitante alterar o valor para R$ 1.500,00
    Então a aprovação anterior deve ser invalidada
    E a demanda deve voltar para "Nova"
    E a execução deve permanecer bloqueada até uma nova aprovação
    E a aprovação anterior deve continuar visível no histórico

  Cenário: Alteração sem mudança efetiva do valor
    Dado que R$ 1.200,00 foram aprovados
    Quando o solicitante salvar novamente o valor de R$ 1.200,00
    Então a aprovação deve permanecer válida
    E não deve ser registrada invalidação

  Cenário: Alteração de outro campo após aprovação
    Dado que o valor atual possui aprovação válida
    Quando o solicitante alterar um campo permitido sem mudar o valor
    Então a aprovação deve permanecer válida

  Cenário: Alteração concorrente com uma decisão
    Dado que R$ 1.200,00 aguardam aprovação
    Quando o solicitante alterar o valor para R$ 1.500,00 ao mesmo tempo em que o gestor tentar aprovar R$ 1.200,00
    Então não deve existir aprovação válida para R$ 1.500,00
    E o resultado deve exigir avaliação do valor atual
    E o histórico deve permanecer consistente com a ordem efetiva dos eventos

  Cenário: Tentativa de alterar valor durante a execução
    Dado que uma demanda está "Em andamento"
    Quando o solicitante tentar alterar o valor
    Então a alteração deve ser recusada
    E o valor e o histórico devem permanecer inalterados

  Cenário: Tentativa de alterar valor de demanda concluída
    Dado que uma demanda está "Concluída"
    Quando qualquer pessoa tentar alterar o valor
    Então a alteração deve ser recusada
    E a demanda deve permanecer somente para consulta
```

### Funcionalidade: reenvio após rejeição

```gherkin
Funcionalidade: Corrigir e reenviar uma demanda rejeitada

  Cenário: Solicitante reenvia demanda rejeitada
    Dado que uma demanda foi rejeitada com justificativa
    Quando o solicitante corrigir a demanda e reenviá-la
    Então a situação deve ser "Aguardando aprovação"
    E uma nova avaliação pendente deve ser criada
    E a rejeição anterior deve permanecer no histórico

  Cenário: Novo gestor aprova o reenvio
    Dado que uma demanda possui uma rejeição anterior
    E um novo envio aguarda aprovação
    Quando um gestor elegível aprovar o novo envio
    Então a demanda deve ficar "Aprovada"
    E o histórico deve permitir distinguir os dois ciclos de avaliação

  Cenário: Tentativa de iniciar demanda rejeitada
    Dado que uma demanda está "Rejeitada"
    Quando o solicitante tentar iniciar a execução
    Então o início deve ser recusado
    E deve ser informado que a demanda precisa ser reenviada e aprovada
```

### Funcionalidade: início e conclusão

```gherkin
Funcionalidade: Controlar o início e a conclusão da execução

  Cenário: Solicitante inicia demanda com aprovação válida
    Dado que o valor atual possui aprovação válida
    E a demanda está "Aprovada"
    Quando o solicitante iniciar a execução
    Então a situação deve ser "Em andamento"
    E o valor solicitado deve ficar bloqueado
    E o início deve ser registrado no histórico

  Esquema do Cenário: Início sem aprovação válida
    Dado que a demanda está <situacao>
    Quando o solicitante tentar iniciar a execução
    Então o início deve ser recusado
    E a demanda deve permanecer em <situacao>

    Exemplos:
      | situacao              |
      | "Nova"               |
      | "Aguardando aprovação" |
      | "Rejeitada"          |

  Cenário: Outra pessoa tenta iniciar a demanda aprovada
    Dado que uma demanda possui aprovação válida
    E Ana é a solicitante
    Quando Bruno tentar iniciar a execução
    Então o início deve ser recusado
    E a situação deve permanecer "Aprovada"

  Cenário: Conclusão de demanda legada em andamento
    Dado que uma demanda já estava "Em andamento" antes da vigência da política
    E não possui aprovação registrada
    Quando o solicitante concluir a demanda
    Então a situação deve ser "Concluída"
    E nenhuma aprovação retroativa deve ser exigida

  Cenário: Demanda nova tenta usar a exceção legada
    Dado que uma demanda passou para "Em andamento" depois da vigência da política
    Quando não houver aprovação válida associada ao valor
    Então a transição para execução deve ser considerada inválida
    E a exceção de legado não deve ser aplicada
```

### Funcionalidade: histórico e preservação

```gherkin
Funcionalidade: Preservar a rastreabilidade da demanda

  Cenário: Consultar histórico com múltiplos ciclos
    Dado que uma demanda foi rejeitada, alterada, reenviada e aprovada
    Quando uma pessoa consultar o histórico
    Então deve visualizar os eventos em ordem cronológica
    E deve identificar o valor e os atores de cada ciclo
    E deve visualizar a justificativa da rejeição
    E nenhuma decisão anterior deve ter sido sobrescrita

  Cenário: Consultar dados anteriores à política
    Dado que uma demanda existia antes da vigência da política
    Quando uma pessoa abrir a demanda
    Então os dados e o histórico anteriores devem continuar disponíveis

  Cenário: Falha ao registrar uma decisão
    Dado que uma demanda aguarda aprovação
    Quando não for possível registrar integralmente a decisão e seu histórico
    Então a situação da demanda não deve mudar
    E a avaliação deve permanecer pendente
    E não deve existir decisão parcial

  Cenário: Falha ao invalidar aprovação por alteração de valor
    Dado que uma demanda aprovada ainda não iniciou
    Quando não for possível registrar conjuntamente o novo valor e a invalidação
    Então nenhuma das duas mudanças deve ser efetivada
    E a demanda deve manter o estado consistente anterior
```

## 14. Indicadores de sucesso e controle

| Indicador | Definição | Meta inicial |
| --- | --- | --- |
| Execuções conformes | Demandas não legadas iniciadas com aprovação válida ÷ demandas não legadas iniciadas | 100% |
| Autoaprovações aceitas | Decisões válidas em que gestor e solicitante são a mesma pessoa | 0 |
| Rejeições justificadas | Rejeições válidas com justificativa significativa ÷ rejeições válidas | 100% |
| Decisões rastreáveis | Decisões com ator, data/hora, resultado e valor ÷ decisões registradas | 100% |
| Invalidações conformes | Mudanças de valor pré-execução que invalidaram avaliação aplicável ÷ mudanças elegíveis | 100% |

Como o Nexo é um portal local de workshop, estes indicadores são critérios verificáveis sobre os dados disponíveis, não uma exigência de plataforma externa de analytics.

## 15. Riscos e mitigação de produto

| Risco | Impacto | Mitigação exigida |
| --- | --- | --- |
| Aprovação aplicada a valor desatualizado | Execução indevida | Vincular decisão ao valor submetido e invalidar ao alterá-lo |
| Duas decisões concorrentes | Histórico contraditório | Aceitar uma única decisão válida por envio |
| Alteração parcial sem histórico | Perda de auditoria | Tornar mudança de estado e registro histórico indivisíveis |
| Autoaprovação por perfil com papéis acumulados | Quebra de segregação | Comparar a pessoa que decide com o solicitante |
| Bloqueio de demandas legadas | Interrupção operacional | Identificar e preservar a exceção de demandas já em andamento |
| Rejeição vaga ou vazia | Retrabalho | Exigir justificativa significativa |
| Histórico sobrescrito no reenvio | Perda de contexto | Acrescentar ciclos, nunca substituir decisões |

## 16. Dependências de negócio

- Perfis fictícios existentes devem identificar pessoa e papel de gestor.
- A demanda deve possuir solicitante, valor, situação e histórico consultáveis.
- Deve ser possível distinguir demandas já em execução na entrada em vigor da política.
- As regras atuais de consulta, edição pelo solicitante e somente leitura de demandas concluídas devem ser preservadas, salvo quando este PRD as altera explicitamente.

## 17. Questões para validação do PRD

As decisões abaixo não bloqueiam a definição do fluxo principal, mas devem ser confirmadas antes da especificação técnica:

1. O valor `R$ 0,00` é permitido pelo produto atual? Se permitido, este PRD exige aprovação; se proibido, mantém-se a validação existente.
2. Há limite de tamanho para a justificativa de rejeição? Recomenda-se definir mínimo e máximo somente após observar os limites já aplicados aos textos da demanda.
3. O solicitante pode cancelar um envio pendente sem alterar o valor? Esta versão não prevê cancelamento explícito.
4. Uma demanda rejeitada pode ser reenviada sem nenhuma alteração? Esta versão permite, pois a nova decisão pode refletir contexto externo não registrado.
5. A data de vigência será inferida pela situação inicial dos dados existentes ou registrada explicitamente? A decisão deve garantir que somente demandas já em andamento recebam a exceção.

## 18. Critério de prontidão para especificação técnica

O PRD estará validado quando Produto e representantes do negócio:

- aprovarem objetivos, escopo e situações propostas;
- confirmarem as premissas e responderem às questões abertas relevantes;
- aceitarem os requisitos `RN-001` a `RN-028`;
- aceitarem os critérios `CA-001` a `CA-010` e os cenários Gherkin;
- confirmarem a reconciliação com `doc-specs/constitution.md`, caso o arquivo seja disponibilizado.

Somente após essa validação devem ser definidas arquitetura, contratos, persistência, componentes de interface e estratégia de automação.

