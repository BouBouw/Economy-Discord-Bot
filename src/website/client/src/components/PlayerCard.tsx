import type { UserProfile } from '../types';

interface PlayerCardProps {
  player: UserProfile;
  isCurrentUser: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);

export default function PlayerCard({ player, isCurrentUser }: PlayerCardProps) {
  const name = player.displayName ?? `Joueur ${player.userId.slice(0, 6)}`;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        isCurrentUser ? 'bg-[#404249]' : 'bg-[#2b2d31]'
      }`}
    >
      {/* Avatar placeholder */}
      <div className="w-9 h-9 rounded-full bg-[#5865f2] flex items-center justify-center text-sm font-bold shrink-0">
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {name}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-[#b5bac1] font-normal">(vous)</span>
          )}
        </p>
        <p className="text-[#b5bac1] text-xs">
          Niv. {player.level} · {player.reputations} rép.
        </p>
      </div>

      {/* Balance */}
      <span className="text-yellow-400 text-sm font-bold shrink-0">
        {fmt(player.balance)}
      </span>
    </div>
  );
}
