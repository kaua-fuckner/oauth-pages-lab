import {
  getCookie,
  setCookie,
} from "../_shared/cookies.js";

import {
  sha256Base64url,
} from "../_shared/crypto.js";

function errorResponse(message, status = 400) {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost(context) {
  const baseUrl =
    context.env.PUBLIC_BASE_URL;

  if (!baseUrl) {
    return errorResponse(
      "Server configuration error",
      500
    );
  }

  // Verifica a origem da requisição
  const origin =
    context.request.headers.get("Origin");

  if (origin !== baseUrl) {
    return errorResponse(
      "Invalid Origin",
      403
    );
  }

  // Obtém o cookie da sessão
  const sessionCookie = getCookie(
    context.request,
    "__Host-session"
  );

  // Se não houver sessão, apenas limpa o cookie
  if (sessionCookie) {
    const sessionIdHash =
      await sha256Base64url(
        sessionCookie
      );

    // Remove a sessão do banco
    await context.env.DB.prepare(
      `DELETE FROM sessions
       WHERE id_hash = ?`
    )
      .bind(sessionIdHash)
      .run();
  }

  // Limpa o cookie do navegador
  const headers =
    new Headers();

  headers.set(
    "Location",
    baseUrl
  );

  headers.append(
    "Set-Cookie",
    setCookie(
      "__Host-session",
      "",
      {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 0,
      }
    )
  );

  headers.set(
    "Cache-Control",
    "no-store"
  );

  // Redireciona para a página inicial
  return new Response(
    null,
    {
      status: 303,
      headers,
    }
  );
}