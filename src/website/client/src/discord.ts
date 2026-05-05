import { DiscordSDK } from '@discord/embedded-app-sdk';

/** Discord Application ID (from .env via Vite) */
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID as string;

export const discordSdk = new DiscordSDK(CLIENT_ID);

export interface DiscordAuth {
  token: string;        // our JWT (from /api/auth/token)
  userId: string;
  username: string;
  avatar: string | null;
  globalName: string | null;
}

/**
 * Full Discord Activity SDK initialization + auth flow.
 *
 * 1. Wait for Discord iframe to be ready
 * 2. Authorize → get OAuth2 `code`
 * 3. Exchange `code` server-side → receive JWT
 * 4. Authenticate SDK with the Discord access_token
 */
export async function setupDiscordSDK(): Promise<DiscordAuth> {
  await discordSdk.ready();

  const { code } = await discordSdk.commands.authorize({
    client_id: CLIENT_ID,
    response_type: 'code',
    state: '',
    prompt: 'none',
    scope: ['identify', 'guilds', 'guilds.members.read'],
  });

  // Exchange code server-side to receive our JWT
  const res = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Token exchange failed');
  }

  const { token } = (await res.json()) as { token: string };

  // Authenticate the SDK (needed to use privileged SDK commands later)
  // We decode the JWT to get the Discord access_token stored inside
  // (the server embeds it at sign time)
  const [, payloadB64] = token.split('.');
  const payload = JSON.parse(atob(payloadB64)) as {
    userId: string;
    accessToken: string;
  };

  const auth = await discordSdk.commands.authenticate({
    access_token: payload.accessToken,
  });

  return {
    token,
    userId: auth.user.id,
    username: auth.user.username,
    avatar: auth.user.avatar ?? null,
    globalName: auth.user.global_name ?? null,
  };
}
