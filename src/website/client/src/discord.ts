import { DiscordSDK } from '@discord/embedded-app-sdk';

/** Discord Application ID (from .env via Vite) */
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID as string;

// Lazy singleton — initialized inside setupDiscordSDK()
let _sdk: DiscordSDK | null = null;
export const getDiscordSdk = () => _sdk!;

export interface DiscordAuth {
  token: string;        // our JWT (from /api/auth/token)
  userId: string;
  username: string;
  avatar: string | null;
  globalName: string | null;
  channelId: string | null;
  guildId: string | null;
}

/**
 * Full Discord Activity SDK initialization + auth flow.
 *
 * 1. Instantiate SDK (inside function so errors are catchable)
 * 2. Wait for Discord iframe to be ready
 * 3. Authorize → get OAuth2 `code`
 * 4. Exchange `code` server-side → receive JWT
 * 5. Authenticate SDK with the Discord access_token
 */
export async function setupDiscordSDK(): Promise<DiscordAuth> {
  _sdk = new DiscordSDK(CLIENT_ID);

  await _sdk.ready();

  const { code } = await _sdk.commands.authorize({
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

  // Decode JWT payload to retrieve the Discord access_token
  const [, payloadB64] = token.split('.');
  const payload = JSON.parse(atob(payloadB64)) as {
    userId: string;
    accessToken: string;
  };

  const auth = await _sdk.commands.authenticate({
    access_token: payload.accessToken,
  });

  return {
    token,
    userId: auth.user.id,
    username: auth.user.username,
    avatar: auth.user.avatar ?? null,
    globalName: auth.user.global_name ?? null,
    channelId: _sdk.channelId,
    guildId: _sdk.guildId,
  };
}
