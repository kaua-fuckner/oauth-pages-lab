# Evidência 07 — Testes de Falha

Projeto: `oauth-pages-lab`

Foram realizados testes para verificar o comportamento da aplicação diante de situações inválidas ou de reutilização de dados de autenticação.

## 1. OAuth transaction inexistente

**Teste:** tentativa de continuar o fluxo OAuth sem uma transação OAuth válida.

**Resultado obtido:**
`Missing OAuth transaction`

**Status:** PASSOU

---

## 2. State alterado

**Teste:** alteração do parâmetro `state` durante o retorno OAuth.

**Resultado obtido:**
`Invalid state`

**Status:** PASSOU

---

## 3. Reutilização da OAuth transaction

**Teste:** tentativa de reutilizar uma transação OAuth que já havia sido consumida.

**Resultado obtido:**
`Missing OAuth transaction`

**Status:** PASSOU

---

## 4. Sessão expirada

**Teste:** utilização de uma sessão com `expires_at = 0`.

**Resultado obtido:**

```json
{"error":"unauthorized"}
```

**Status:** PASSOU

---

## 5. Logout com Origin inválida

**Teste:** tentativa de realizar logout utilizando um `Origin` inválido.

**Resultado obtido:**
HTTP `403 Forbidden`

Mensagem:
`Invalid Origin`

**Status:** PASSOU

---

## 6. Reutilização de sessão revogada

**Teste:** tentativa de reutilizar o cookie de uma sessão que já havia sido revogada/removida.

**Resultado obtido:**

```json
{"error":"unauthorized"}
```

**Status:** PASSOU

---

# Resultado Final

Todos os 6 testes de falha realizados apresentaram o comportamento esperado.

**6/6 testes passaram.**
