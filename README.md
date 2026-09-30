# OAuth Pages Lab

Projeto acadêmico de autenticação OAuth 2.0 utilizando **Google** e **GitHub**, desenvolvido com **Cloudflare Pages Functions** e **Cloudflare D1**.

## 🌐 Projeto publicado

**Cloudflare Pages:**
https://oauth-pages-lab-bvt.pages.dev

**Repositório:**
https://github.com/kaua-fuckner/oauth-pages-lab

## 🔐 Autenticação

O projeto possui autenticação utilizando:

* Google OAuth 2.0
* GitHub OAuth 2.0
* PKCE com método S256
* State para proteção contra CSRF
* Nonce para validação do fluxo OAuth
* Sessões armazenadas no Cloudflare D1

## 🗄️ Banco de dados

O projeto utiliza **Cloudflare D1** para armazenar:

* Transações OAuth temporárias
* Sessões autenticadas

As transações OAuth possuem controle de expiração e não podem ser reutilizadas.

As sessões também possuem controle de expiração e podem ser revogadas durante o logout.

## 🍪 Segurança da sessão

O cookie de sessão utiliza:

* `HttpOnly`
* `Secure`
* `SameSite=Strict`

Os tokens OAuth não são armazenados no navegador.

## 🔗 Endpoints

### API de sessão

`/api/me`

Retorna os dados do usuário autenticado.

Usuários não autenticados recebem resposta `401 Unauthorized`.

### Logout

O logout encerra a sessão e impede a reutilização do cookie de sessão revogado.

### Callbacks OAuth

**Google:**

`/oauth/callback/google`

**GitHub:**

`/oauth/callback/github`

## 🧪 Testes de segurança realizados

Foram realizados testes para verificar o comportamento do sistema em situações de falha:

| Teste                           | Resultado |
| ------------------------------- | --------- |
| Ausência de transação OAuth     | PASSOU    |
| State alterado                  | PASSOU    |
| Reutilização da transação OAuth | PASSOU    |
| Sessão expirada                 | PASSOU    |
| Origin inválido no logout       | PASSOU    |
| Reutilização de sessão revogada | PASSOU    |

### Resultados

* `Missing OAuth transaction`
* `Invalid state`
* `{"error":"unauthorized"}`
* `403 Forbidden — Invalid Origin`

## 📋 Checklist

* [x] Site publicado no Cloudflare Pages
* [x] Projeto utilizando a branch `main`
* [x] Cloudflare Pages Functions funcionando
* [x] Banco D1 configurado
* [x] Login com Google funcionando
* [x] Login com GitHub funcionando
* [x] Callbacks OAuth configurados
* [x] PKCE utilizando S256
* [x] Sessão local criada no D1
* [x] Cookie de sessão seguro
* [x] Endpoint `/api/me` funcionando
* [x] Usuário não autenticado recebe `401`
* [x] Logout funcionando
* [x] Sessão removida após logout
* [x] Transação OAuth não pode ser reutilizada
* [x] State alterado é rejeitado
* [x] Sessão expirada é rejeitada
* [x] Origin inválido é rejeitado
* [x] Sessão revogada não pode ser reutilizada
* [x] Arquivos estáticos permanecem públicos
* [x] Segredos não foram incluídos no código-fonte
* [x] Tokens não são armazenados no navegador
* [x] Não foram utilizados Node.js, npm, npx ou Wrangler

## 👨‍💻 Projeto acadêmico

Projeto desenvolvido para avaliação acadêmica individual.

Tecnologias principais:

* HTML
* JavaScript
* Cloudflare Pages
* Cloudflare Pages Functions
* Cloudflare D1
* OAuth 2.0
