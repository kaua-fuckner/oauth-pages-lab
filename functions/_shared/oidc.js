import { base64url, sha256 } from "./crypto.js";

function decodeBase64url(value) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function decodeJsonBase64url(value) {
  const bytes = decodeBase64url(value);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}

export async function discoverGoogle() {
  const response = await fetch(
    "https://accounts.google.com/.well-known/openid-configuration"
  );

  if (!response.ok) {
    throw new Error("OIDC discovery failed");
  }

  return response.json();
}

export async function verifyGoogleIdToken(idToken, clientId, expectedNonce) {
  const parts = idToken.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const header = decodeJsonBase64url(encodedHeader);
  const payload = decodeJsonBase64url(encodedPayload);
  const signature = decodeBase64url(encodedSignature);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Invalid JWT algorithm");
  }

  const discovery = await discoverGoogle();

  if (discovery.issuer !== "https://accounts.google.com") {
    throw new Error("Invalid issuer");
  }

  const jwksResponse = await fetch(discovery.jwks_uri);

  if (!jwksResponse.ok) {
    throw new Error("JWKS request failed");
  }

  const jwks = await jwksResponse.json();

  const jwk = jwks.keys.find(
    (key) => key.kid === header.kid && key.kty === "RSA"
  );

  if (!jwk) {
    throw new Error("Signing key not found");
  }

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const data = new TextEncoder().encode(
    `${encodedHeader}.${encodedPayload}`
  );

  const validSignature = await crypto.subtle.verify(
    {
      name: "RSASSA-PKCS1-v1_5",
    },
    publicKey,
    signature,
    data
  );

  if (!validSignature) {
    throw new Error("Invalid JWT signature");
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== "https://accounts.google.com") {
    throw new Error("Invalid issuer");
  }

  if (payload.aud !== clientId) {
    throw new Error("Invalid audience");
  }

  if (!payload.exp || payload.exp <= now) {
    throw new Error("Expired token");
  }

  if (payload.iat && payload.iat > now + 300) {
    throw new Error("Invalid issued-at time");
  }

  if (payload.nonce !== expectedNonce) {
    throw new Error("Invalid nonce");
  }

  if (!payload.sub) {
    throw new Error("Missing subject");
  }

  return {
    issuer: payload.iss,
    subject: payload.sub,
    email: payload.email ?? null,
    displayName: payload.name ?? null,
  };
}