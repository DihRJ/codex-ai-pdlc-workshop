# Preparação antes do evento

Reserve tempo antes do dia 19/09 para instalar as dependências e abrir o portal. A prática começa às 10h; instalação de ferramentas não faz parte do tempo principal.

**Primeiro acesso?** Comece pelo [README: preparar o ambiente](../README.md#preparacao), com instruções de instalação para Windows, macOS e Linux, fork e execução. Este guia aprofunda a conferência e a solução de problemas.

## Máquina e ferramentas

1. Instale Node.js **24** e confirme com `node --version`. O npm acompanha a instalação do Node.js.
2. Tenha Git e um navegador disponíveis.
3. Faça fork, clone o projeto, execute `npm ci` e `npm run doctor`.
4. Execute `npm run dev` e abra `http://127.0.0.1:3000`.
5. Crie uma demanda de teste. Recarregue a página e confirme que ela permanece.
6. Pare o servidor. Execute `npm run validate`.
7. Instale o navegador de teste com `npx playwright install chromium` no Windows/macOS, ou `npx playwright install --with-deps chromium` no Linux. Execute `npm run test:e2e` com o servidor de desenvolvimento parado.
8. Confirme seu acesso ao Codex App ou CLI e abra a pasta do projeto nele. Consulte a [documentação oficial do Codex CLI](https://developers.openai.com/codex/cli/) para instalação e acesso.

O portal funciona sem chave de API. O uso do Codex depende do acesso da sua conta e de conexão com o serviço. Não coloque credenciais em arquivos do repositório.

## Windows

Os scripts do projeto usam Node.js e não dependem de comandos Bash. Você pode usar o Prompt de Comando, PowerShell ou terminal do VS Code. Se aparecer bloqueio de `npm.ps1`, use o Prompt de Comando ou troque `npm` por `npm.cmd`, sem alterar políticas do computador. Para os outros comandos instalados via npm, use também `npx.cmd` e `codex.cmd` quando necessário.

Exemplo no PowerShell:

```powershell
npm.cmd ci
npm.cmd run doctor
npm.cmd run dev
```

O portal não exige WSL. Se você já o utiliza, instale Node.js, Git e Codex dentro dele e clone o projeto em uma pasta desse ambiente. Não reutilize `node_modules` instalado no Windows dentro do WSL.

## macOS

Use o Terminal ou o terminal integrado do editor. Instale Node.js 24 pelo [site oficial](https://nodejs.org/en/download). Se já usa nvm, execute `nvm install 24` e `nvm use 24`; dentro do repositório, `nvm use` lê `.nvmrc`.

Se `git --version` solicitar ferramentas de desenvolvimento, execute `xcode-select --install` e conclua a instalação antes de clonar. O [guia do Git para macOS](https://git-scm.com/install/mac) também documenta a alternativa com Homebrew.

Depois do clone, os comandos são os mesmos do README:

```bash
npm ci
npm run doctor
npm run dev
```

## Linux

Instale o [Git pelo gerenciador da sua distribuição](https://git-scm.com/install/linux) e use a linha 24 do [Node.js](https://nodejs.org/en/download). Confirme `node --version`: o pacote disponível no sistema pode estar em outra linha.

Depois do clone, execute `npm ci`, `npm run doctor` e `npm run dev`. Para testar a interface, pare o servidor com `Ctrl+C` e execute:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

A instalação das bibliotecas do Chromium pode pedir senha de administrador. Consulte os [requisitos de sistema do Playwright](https://playwright.dev/docs/intro#system-requirements) e a [instalação de dependências](https://playwright.dev/docs/browsers#install-system-dependencies) se sua distribuição não for suportada.

## Rede e máquina gerenciada

Se estiver em uma máquina gerenciada, verifique o acesso ao GitHub, ao registro npm e ao Codex antecipadamente com o suporte responsável. O projeto não modifica proxy, certificados ou controles de segurança.

## Problemas frequentes

| Sintoma                                    | O que conferir                                                                                                                            |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `node` ou `git` não encontrado             | Instalação e PATH; abra um novo terminal após instalar                                                                                    |
| Erro de versão do Node                     | Execute `node --version`; o projeto usa a linha 24                                                                                        |
| `package.json` não encontrado (`ENOENT`)    | Entre na pasta clonada com `cd codex-ai-pdlc-workshop` antes de executar npm. |
| Pasta já existe ao clonar                  | Abra a cópia que já criou, ou escolha outro nome de pasta; não é necessário apagar seu trabalho. |
| `npm.ps1`, `npx.ps1` ou `codex.ps1` bloqueado | Use o Prompt de Comando ou o comando correspondente com extensão `.cmd`. |
| `codex` não encontrado                     | Confirme a instalação com `npm install -g @openai/codex`, reabra o terminal e tente `codex --version`. Se usa nvm, verifique se a linha 24 está ativa. |
| `EACCES` ao instalar o Codex no macOS/Linux | Use um gerenciador de versões do Node no seu usuário, ou a opção de instalador independente descrita na [documentação do Codex CLI](https://developers.openai.com/codex/cli/). |
| Falha ao baixar pacotes                    | Conectividade, registro npm e configuração da máquina                                                                                     |
| Porta 3000 ocupada                         | Pare a aplicação anterior ou use `npm run dev -- --port 3001`                                                                             |
| Porta 3100 ocupada                         | Pare o servidor de teste anterior antes de executar E2E                                                                                   |
| Chromium não instalado                     | Execute `npx playwright install chromium` antes do E2E                                                                                    |
| Bibliotecas do navegador ausentes no Linux | Consulte a instalação de dependências do Playwright; quando autorizado no seu ambiente, use `npx playwright install --with-deps chromium` |
| Conflito de edição                         | Feche e abra os detalhes; revise a atualização feita na outra tela                                                                        |
| Dados de outra versão                      | Use uma cópia separada para alternar entre starter e solução                                                                              |
| Branch da feature já existe                | Execute `git switch feature/aprovacao-orcamento`, sem `-c`. |
| `git push` sem permissão                    | Execute `git remote -v` e confira se `origin` aponta para seu fork. Verifique a autenticação no GitHub. |

## Recuperação de dados e trava

Para voltar aos exemplos, pare o servidor e execute `npm run data:reset`. Confirme com `s`. O comando preserva um backup do arquivo anterior, inclusive quando ele contém JSON inválido. Para uso automatizado consciente: `npm run data:reset -- --yes`.

Se um encerramento abrupto deixar `.local/demands.json.lock`, pare todos os processos deste projeto e confira o PID registrado no arquivo. Somente depois de confirmar que nenhum processo continua usando os dados, remova essa trava pelo gerenciador de arquivos. Reinicie o servidor. Não remova a trava de um servidor ativo.

Não edite `data/seed.json` para recuperar sua execução. Ela é a referência versionada. Os testes não devem receber o caminho do seu arquivo de trabalho.

## Pronto para acompanhar

Volte ao [checklist do README](../README.md#checklist). Se precisar de ajuda, anote o sistema operacional, o resultado de `node --version`, o comando executado e a mensagem de erro. Isso facilita retomar a preparação com a comunidade.
