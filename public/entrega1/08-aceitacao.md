# Evidência 08 — Checklist de Aceitação

Projeto: `oauth-pages-lab`

## Publicação e infraestrutura

* [x] Site publicado no Cloudflare Pages
* [x] Projeto utilizando a branch `main`
* [x] Pages Functions funcionando
* [x] Banco D1 configurado
* [x] Binding D1 configurado como `DB`

## OAuth

* [x] Login com Google funcionando
* [x] Login com GitHub funcionando
* [x] Callback do Google configurado corretamente
* [x] Callback do GitHub configurado corretamente
* [x] PKCE utilizando S256
* [x] `state` utilizado na proteção do fluxo
* [x] `nonce` utilizado na proteção do fluxo
* [x] Transação OAuth armazenada no D1
* [x] Transação OAuth consumida após utilização
* [x] Reutilização da transação OAuth rejeitada
* [x] Alteração do `state` rejeitada

## Sessões

* [x] Sessão local criada no D1
* [x] Cookie de sessão configurado como `HttpOnly`
* [x] Cookie configurado como `Secure`
* [x] Cookie configurado como `SameSite=Strict`
* [x] `/api/me` funcionando para usuário autenticado
* [x] `/api/me` retorna HTTP 401 quando não autenticado
* [x] Logout funcionando
* [x] Sessão removida/revogada após logout
* [x] Sessão expirada rejeitada
* [x] Cookie de sessão revogada não pode ser reutilizado
* [x] Logout com `Origin` inválida rejeitado com HTTP 403

## Segurança e organização

* [x] Arquivos estáticos públicos funcionando
* [x] Secrets não armazenados no código-fonte
* [x] Tokens OAuth não armazenados no navegador
* [x] Projeto desenvolvido sem Node.js
* [x] Projeto desenvolvido sem npm
* [x] Projeto desenvolvido sem npx
* [x] Projeto desenvolvido sem Wrangler

## Resultado

Todos os requisitos e testes realizados foram atendidos conforme a implementação e os testes executados no projeto.

