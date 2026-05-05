import { useState, useEffect } from 'react';
import { setupDiscordSDK, type DiscordAuth } from './discord';
import Lobby from './pages/Lobby';
import type { UserProfile } from './types';

type AppState = 'loading' | 'ready' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('loading');
  const [auth, setAuth] = useState<DiscordAuth | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setupDiscordSDK()
      .then(async (discordAuth) => {
        setAuth(discordAuth);

        const res = await fetch('/api/profile/me', {
          headers: { Authorization: `Bearer ${discordAuth.token}` },
        });

        if (!res.ok) throw new Error('Impossible de charger votre profil');

        const data = (await res.json()) as UserProfile;
        setProfile(data);
        setState('ready');
      })
      .catch((err: unknown) => {
        console.error('[App] Init error:', err);
        setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
        setState('error');
      });
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#313338]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#b5bac1] text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#313338]">
        <div className="text-center space-y-2 px-6">
          <p className="text-4xl">⚠️</p>
          <p className="text-white font-semibold">Une erreur est survenue</p>
          <p className="text-[#b5bac1] text-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return <Lobby auth={auth!} profile={profile!} />;
}
