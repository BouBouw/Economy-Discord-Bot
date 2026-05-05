import { useEffect, useState } from 'react';
import { discordSdk } from '../discord';
import { getSocket } from '../socket';
import Layout from '../components/Layout';
import PlayerCard from '../components/PlayerCard';
import EconomyBar from '../components/EconomyBar';
import GameCard from '../components/GameCard';
import type { DiscordAuth } from '../discord';
import type { UserProfile, ActivitySession, EconomyUpdate, GameMeta } from '../types';

interface LobbyProps {
  auth: DiscordAuth;
  profile: UserProfile;
}

const GAMES: GameMeta[] = [
  {
    id: 'blackjack',
    name: 'Blackjack',
    emoji: '🃏',
    description: 'Battez le croupier',
    available: false,
    minPlayers: 1,
    maxPlayers: 6,
  },
  {
    id: 'slots',
    name: 'Machine à Sous',
    emoji: '🎰',
    description: 'Tentez votre chance',
    available: false,
    minPlayers: 1,
    maxPlayers: 1,
  },
  {
    id: 'roulette',
    name: 'Roulette',
    emoji: '🎡',
    description: 'Misez et gagnez',
    available: false,
    minPlayers: 1,
    maxPlayers: 8,
  },
  {
    id: 'dice',
    name: 'Dés',
    emoji: '🎲',
    description: 'Jeu de dés classique',
    available: false,
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: 'tictactoe',
    name: 'Morpion',
    emoji: '⭕',
    description: '3 en ligne',
    available: false,
    minPlayers: 2,
    maxPlayers: 2,
  },
  {
    id: 'poker',
    name: 'Poker',
    emoji: '♠️',
    description: 'Texas Hold\'em',
    available: false,
    minPlayers: 2,
    maxPlayers: 8,
  },
];

export default function Lobby({ auth, profile }: LobbyProps) {
  const [session, setSession] = useState<ActivitySession | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    const socket = getSocket(auth.token);

    socket.on('connect', () => {
      socket.emit('join_session', {
        channelId: discordSdk.channelId,
        guildId: discordSdk.guildId,
        userId: auth.userId,
      });
    });

    socket.on('session_update', (data: ActivitySession) => {
      setSession(data);
    });

    socket.on('economy_update', (data: EconomyUpdate) => {
      if (data.userId === auth.userId) {
        setCurrentProfile((prev) => ({
          ...prev,
          balance: data.balance,
          inBank: data.inBank,
        }));
      }
    });

    return () => {
      socket.off('connect');
      socket.off('session_update');
      socket.off('economy_update');
    };
  }, [auth]);

  const playerCount = session?.players.length ?? 0;

  return (
    <Layout>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#2b2d31] border-b border-[#1e1f22] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎮</span>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Activité</h1>
            <p className="text-[#b5bac1] text-xs">
              {playerCount > 0
                ? `${playerCount} joueur${playerCount > 1 ? 's' : ''} connecté${playerCount > 1 ? 's' : ''}`
                : 'Connexion…'}
            </p>
          </div>
        </div>
        <EconomyBar profile={currentProfile} />
      </header>

      {/* ── Body ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Games */}
        <section>
          <SectionTitle>Jeux disponibles</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* Players in voice channel */}
        {session && session.players.length > 0 && (
          <section>
            <SectionTitle>Dans le salon vocal</SectionTitle>
            <div className="space-y-2 mt-3">
              {session.players.map((player) => (
                <PlayerCard
                  key={player.userId}
                  player={player}
                  isCurrentUser={player.userId === auth.userId}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[#b5bac1] text-[11px] font-semibold uppercase tracking-wider">
      {children}
    </h2>
  );
}
