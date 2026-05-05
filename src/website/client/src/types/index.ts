export interface UserProfile {
  userId: string;
  displayName: string | null;
  balance: number;
  inBank: number;
  level: number;
  experiences: number;
  reputations: number;
  backgroundUrl?: string | null;
}

export interface ActivitySession {
  channelId: string;
  guildId: string | null;
  players: UserProfile[];
}

export interface EconomyUpdate {
  userId: string;
  balance: number;
  inBank: number;
}

export interface GameMeta {
  id: string;
  name: string;
  emoji: string;
  description: string;
  available: boolean;
  minPlayers?: number;
  maxPlayers?: number;
}
