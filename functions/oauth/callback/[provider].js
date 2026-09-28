import {
  randomBase64url,
  sha256Base64url,
} from "../../_shared/crypto.js";

import {
  getCookie,
  setCookie,
} from "../../_shared/cookies.js";

import {
  getProvider,
} from "../../_shared/providers.js";

import {
  verifyGoogleIdToken,
} from "../../_shared/oidc.js";

function errorResponse(message, status = 400) {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet(context) {
  const providerName = context.params.provider;
  const provider = getProvider(providerName);

  if (!provider) {
    return errorResponse("Not Found", 404);
  }

  const url = new URL(context.request.url);

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (error || !code || !state) {
    return errorResponse("Invalid OAuth response");
  }

  const transactionCookie = getCookie(
    context.request,
    "__Host-oauth-tx"
  );

  if (!transactionCookie) {
    return errorResponse("Missing OAuth transaction");
  }

  const transactionIdHash =
    await sha256Base64url(transactionCookie);

  const now = Math.floor(Date.now() / 1000);

  const transaction = await context.env.DB.prepare(
    `SELECT id_hash, provider, state_hash, nonce, code_verifier, expires_at
     FROM oauth_transactions
     WHERE id_hash = ?
       AND expires_at > ?`
  )
    .bind(transactionIdHash, now)
    .first();

  if (!transaction) {
    return errorResponse("Invalid or expired OAuth transaction");
  }

  if (transaction.provider !== providerName) {
    return errorResponse("Invalid OAuth provider");
  }

  const stateHash = await sha256Base64url(state);

  if (stateHash !== transaction.state_hash) {
    return errorResponse("Invalid state");
  }

  await context.env.DB.prepare(
    `DELETE FROM oauth_transactions
     WHERE id_hash = ?`
  )
    .bind(transaction.id_hash)
    .run();

  const baseUrl = context.env.PUBLIC_BASE_URL;

  if (!baseUrl) {
    return errorResponse(
      "Server configuration error",
      500
    );
  }

  const redirectUri =
    `${baseUrl}/oauth/callback/${providerName}`;

  const clientId =
    providerName === "google"
      ? context.env.GOOGLE_CLIENT_ID
      : context.env.GITHUB_CLIENT_ID;

  const clientSecret =
    providerName === "google"
      ? context.env.GOOGLE_CLIENT_SECRET
      : context.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return errorResponse(
      "Server configuration error",
      500
    );
  }

  let identity;

  if (providerName === "google") {
    const tokenResponse = await fetch(
      provider.tokenEndpoint,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code_verifier: transaction.code_verifier,
        }),
      }
    );

    if (!tokenResponse.ok) {
      return errorResponse(
        "Google token exchange failed"
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token) {
      return errorResponse(
        "Missing Google identity token"
      );
    }

    identity = await verifyGoogleIdToken(
      tokenData.id_token,
      clientId,
      transaction.nonce
    );
  } else {
    const tokenResponse = await fetch(
      provider.tokenEndpoint,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          "Accept":
            "application/json",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code_verifier: transaction.code_verifier,
        }),
      }
    );

    if (!tokenResponse.ok) {
      return errorResponse(
        "GitHub token exchange failed"
      );
    }

    const tokenData = await tokenResponse.json();

    if (
      !tokenData.access_token ||
      String(tokenData.token_type).toLowerCase() !==
        "bearer"
    ) {
      return errorResponse(
        "Invalid GitHub token response"
      );
    }

    const userResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization:
            `Bearer ${tokenData.access_token}`,
          Accept:
            "application/vnd.github+json",
          "X-GitHub-Api-Version":
            "2026-03-10",
        },
      }
    );

    if (!userResponse.ok) {
      return errorResponse(
        "GitHub profile request failed"
      );
    }

    const user = await userResponse.json();

    if (!Number.isInteger(user.id)) {
      return errorResponse(
        "Invalid GitHub profile"
      );
    }

    identity = {
      issuer: "https://github.com",
      subject: String(user.id),
      email: user.email ?? null,
      displayName:
        user.name ??
        user.login ??
        null,
    };

    const revokeResponse = await fetch(
      `https://api.github.com/applications/${encodeURIComponent(
        clientId
      )}/grant`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            `Basic ${btoa(
              `${clientId}:${clientSecret}`
            )}`,
          Accept:
            "application/vnd.github+json",
          "Content-Type":
            "application/json",
          "X-GitHub-Api-Version":
            "2026-03-10",
        },
        body: JSON.stringify({
          access_token:
            tokenData.access_token,
        }),
      }
    );

    if (revokeResponse.status !== 204) {
      return errorResponse(
        "GitHub authorization revocation failed"
      );
    }
  }

  const sessionId = randomBase64url();

  const sessionIdHash =
    await sha256Base64url(sessionId);

  const sessionExpiresAt =
    now + 8 * 60 * 60;

  await context.env.DB.prepare(
    `INSERT INTO sessions
      (id_hash, issuer, subject, email, display_name, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      sessionIdHash,
      identity.issuer,
      identity.subject,
      identity.email,
      identity.displayName,
      sessionExpiresAt,
      now
    )
    .run();

  const headers = new Headers();

  headers.set("Location", baseUrl);

  headers.append(
    "Set-Cookie",
    setCookie(
      "__Host-oauth-tx",
      "",
      {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 0,
      }
    )
  );

  headers.append(
    "Set-Cookie",
    setCookie(
      "__Host-session",
      sessionId,
      {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 28800,
      }
    )
  );

  headers.set(
    "Cache-Control",
    "no-store"
  );

  const response = new Response(null, {
    status: 302,
    headers,
  });

  return response;
}