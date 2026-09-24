import { sha256Base64url } from "../_shared/crypto.js";
import {
  getCookie,
  deleteCookie,
} from "../_shared/cookies.js";

export async function onRequestPost(context) {
  const baseUrl = context.env.PUBLIC_BASE_URL;

  const origin = context.request.headers.get("Origin");

  if (!baseUrl || origin !== baseUrl) {
    return new Response("Forbidden", {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const sessionCookie = getCookie(
    context.request,
    "__Host-session"
  );

  if (sessionCookie) {
    const idHash =
      await sha256Base64url(sessionCookie);

    await context.env.DB.prepare(
      `DELETE FROM sessions
       WHERE id_hash = ?`
    )
      .bind(idHash)
      .run();
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": deleteCookie("__Host-session"),
      "Cache-Control": "no-store",
    },
  });
}