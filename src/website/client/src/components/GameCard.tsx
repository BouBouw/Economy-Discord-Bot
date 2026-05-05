import type { GameMeta } from '../types';

interface GameCardProps {
  game: GameMeta;
  onSelect?: (id: string) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <button
      disabled={!game.available}
      onClick={() => game.available && onSelect?.(game.id)}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border
        transition-all duration-150 text-center
        ${
          game.available
            ? 'bg-[#2b2d31] border-[#404249] hover:bg-[#35373c] hover:border-[#5865f2] cursor-pointer active:scale-95'
            : 'bg-[#2b2d31] border-[#2b2d31] opacity-40 cursor-not-allowed'
        }
      `}
    >
      <span className="text-4xl leading-none">{game.emoji}</span>
      <p className="text-white text-sm font-semibold">{game.name}</p>
      <p className="text-[#b5bac1] text-xs leading-tight">{game.description}</p>

      {!game.available && (
        <span className="absolute top-2 right-2 text-[10px] bg-[#1e1f22] text-[#b5bac1] px-2 py-0.5 rounded-full">
          Bientôt
        </span>
      )}
    </button>
  );
}
