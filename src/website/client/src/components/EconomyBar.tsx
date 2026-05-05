import type { UserProfile } from '../types';

interface EconomyBarProps {
  profile: UserProfile;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);

export default function EconomyBar({ profile }: EconomyBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Pill icon="💰" label={fmt(profile.balance)} title="Portefeuille" />
      <Pill icon="🏦" label={fmt(profile.inBank)} title="Banque" />
      <Pill icon="⭐" label={`Niv. ${profile.level}`} title="Niveau" />
    </div>
  );
}

function Pill({
  icon,
  label,
  title,
}: {
  icon: string;
  label: string;
  title: string;
}) {
  return (
    <div
      title={title}
      className="flex items-center gap-1.5 bg-[#1e1f22] rounded-full px-3 py-1 text-sm font-semibold"
    >
      <span>{icon}</span>
      <span className="text-white">{label}</span>
    </div>
  );
}
