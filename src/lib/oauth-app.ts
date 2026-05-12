export function authIssuer(): string {
  return (process.env.NEXT_PUBLIC_AUTH_ISSUER ?? "").replace(/\/$/, "");
}

export function oauthClientId(): string {
  return process.env.OAUTH_CLIENT_ID ?? "adofai_online_contest";
}

export function appOrigin(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return u.replace(/\/$/, "");
}
