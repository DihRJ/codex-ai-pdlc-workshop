# Preparação antes do evento

Reserve tempo antes do dia 19/09 para instalar as dependências e abrir o portal. A prática começa às 10h; instalação de ferramentas não faz parte do tempo principal.

## Máquina e ferramentas

1. Instale Node.js **24** e confirme com `node --version`. O npm acompanha a instalação do Node.js.
2. Tenha Git e um navegador disponíveis.
3. Faça fork, clone o projeto, execute `npm ci` e `npm run doctor`.
4. Execute `npm run dev` e abra `http://127.0.0.1:3000`.
5. Crie uma demanda de teste. Recarregue a página e confirme que ela permanece.
6. Pare o servidor. Execute `npm run validate`.
7. Instale o navegador de teste com `npx playwright install chromium` e execute `npm run test:e2e`.
8. Confirme seu acesso ao Codex App ou CLI e abra a pasta do projeto nele. Consulte a [documentação oficial do Codex CLI](https://developers.openai.com/codex/cli/) para instalação e acesso.

O portal funciona sem chave de API. O uso do Codex depende do acesso da sua conta e de conexão com o serviço. Não coloque credenciais em arquivos do repositório.

## Windows

Os scripts do projeto usam Node.js e não dependem de comandos Bash. Você pode usar o Prompt de Comando, PowerShell ou terminal do VS Code. Se aparecer bloqueio de `npm.ps1`, use o Prompt de Comando ou troque `npm` por `npm.cmd`, sem alterar políticas do computador.

Se estiver em uma máquina gerenciada, verifique o acesso ao GitHub, ao registro npm e ao Codex antecipadamente com o suporte responsável. O projeto não modifica proxy, certificados ou controles de segurança.

## Problemas frequentes

| Sintoma                                    | O que conferir                                                                                                                            |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `node` ou `git` não encontrado             | Instalação e PATH; abra um novo terminal após instalar                                                                                    |
| Erro de versão do Node                     | Execute `node --version`; o projeto usa a linha 24                                                                                        |
| Falha ao baixar pacotes                    | Conectividade, registro npm e configuração da máquina                                                                                     |
| Porta 3000 ocupada                         | Pare a aplicação anterior ou use `npm run dev -- --port 3001`                                                                             |
| Porta 3100 ocupada                         | Pare o servidor de teste anterior antes de executar E2E                                                                                   |
| Chromium não instalado                     | Execute `npx playwright install chromium` antes do E2E                                                                                    |
| Bibliotecas do navegador ausentes no Linux | Consulte a instalação de dependências do Playwright; quando autorizado no seu ambiente, use `npx playwright install --with-deps chromium` |
| Conflito de edição                         | Feche e abra os detalhes; revise a atualização feita na outra tela                                                                        |
| Dados de outra versão                      | Use uma cópia separada para alternar entre starter e solução                                                                              |

## Recuperação de dados e trava

Para voltar aos exemplos, pare o servidor e execute `npm run data:reset`. Confirme com `s`. O comando preserva um backup do arquivo anterior, inclusive quando ele contém JSON inválido. Para uso automatizado consciente: `npm run data:reset -- --yes`.

Se um encerramento abrupto deixar `.local/demands.json.lock`, pare todos os processos deste projeto e confira o PID registrado no arquivo. Somente depois de confirmar que nenhum processo continua usando os dados, remova essa trava pelo gerenciador de arquivos. Reinicie o servidor. Não remova a trava de um servidor ativo.

Não edite `data/seed.json` para recuperar sua execução. Ela é a referência versionada. Os testes não devem receber o caminho do seu arquivo de trabalho.

## Preparação da instrutora

Confirme os comandos na máquina que usará no evento e ensaie as explicações com o [guia da instrutora](https://github.com/glaucia86/codex-ai-pdlc-workshop/blob/workshop-solution/docs/instructor/guia.md). O relatório técnico da referência distingue o que foi executado e o que ainda precisa de ensaio humano.
