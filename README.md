# OAuth Pages Lab

Projeto acadêmico de autenticação OAuth desenvolvido com **Cloudflare Pages Functions**, **D1**, **Google OAuth** e **GitHub OAuth**.

## 🌐 Projeto

**Site:**
https://oauth-pages-lab-bvt.pages.dev

## 🔐 Autenticação

O projeto possui autenticação através de:

* Google OAuth
* GitHub OAuth
* PKCE com S256
* `state` para proteção contra CSRF
* `nonce` para validação do fluxo OAuth
* Sessões locais armazenadas no Cloudflare D1

## 🗄️ Banco de dados

O projeto utiliza **Cloudflare D1** para armazenar:

* Transações OAuth
* Sessões dos usuários
* Expiração das sessões
* Dados básicos do usuário autenticado

O binding utilizado pela aplicação é:

```text
DB
```

## 🍪 Sessões e segurança

As sessões são controladas através de cookie com as seguintes propriedades:

* `HttpOnly`
* `Secure`
* `SameSite=Strict`

O sistema também possui:

* Expiração de sessões
* Revogação de sessões
* Proteção contra reutilização de sessões revogadas
* Validação de `Origin` no logout
* Consumo das transações OAuth após utilização
* Rejeição de `state` inválido
* Rejeição de transações OAuth inexistentes ou reutilizadas

## 👤 API

A aplicação possui o endpoint:

```text
/api/me
```

Ele permite consultar os dados do usuário autenticado.

Quando não existe uma sessão válida, a API retorna:

```text
401 Unauthorized
```

Também existe o fluxo de logout para encerrar a sessão do usuário.

## 🔗 Callbacks OAuth

### Google

```text
https://oauth-pages-lab-bvt.pages.dev/oauth/callback/google
```

### GitHub

```text
https://oauth-pages-lab-bvt.pages.dev/oauth/callback/github
```

## 🧪 Testes de segurança

Foram realizados testes para verificar situações inválidas no fluxo de autenticação:

* Transação OAuth inexistente
* `state` alterado
* Reutilização de transação OAuth
* Sessão expirada
* `Origin` inválida no logout
* Reutilização de sessão revogada

Todos os testes apresentaram o comportamento esperado.

## 📂 Evidências

Os arquivos utilizados para comprovar a configuração, funcionamento e testes do projeto estão organizados na pasta:

👉 [**Ver evidências da Entrega 1**](https://github.com/kaua-fuckner/oauth-pages-lab/tree/main/public/entrega1)

A pasta contém os registros de configuração do Pages, autenticação com Google e GitHub, esquema do D1, testes de falha e checklist de aceitação.

## ✅ Checklist

* [x] Cloudflare Pages publicado
* [x] Branch `main` configurada
* [x] Pages Functions funcionando
* [x] Cloudflare D1 configurado
* [x] Binding `DB` configurado
* [x] Login com Google funcionando
* [x] Login com GitHub funcionando
* [x] PKCE S256
* [x] `state`
* [x] `nonce`
* [x] Sessões armazenadas no D1
* [x] Cookie `HttpOnly`
* [x] Cookie `Secure`
* [x] Cookie `SameSite=Strict`
* [x] `/api/me`
* [x] Logout
* [x] Expiração de sessão
* [x] Revogação de sessão
* [x] Proteção contra reutilização de transações OAuth
* [x] Proteção contra `state` inválido
* [x] Validação de `Origin`
* [x] Testes de falha realizados

## 🛠️ Tecnologias

* HTML
* CSS
* JavaScript
* Cloudflare Pages
* Cloudflare Pages Functions
* Cloudflare D1
* Google OAuth
* GitHub OAuth
