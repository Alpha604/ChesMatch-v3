
export type UserType = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  password?: string; // In a real app, never store plain text
  type: UserType;
  approved: boolean;
  blocked: boolean;
  createdAt: string;
}

export interface Player {
  id: number;
  userId: number; // Owner of this player entry
  name: string;
  rating: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  certified: boolean;
  // New fields for rich profile
  avatarColor?: string;
  playStyle?: string;
  description?: string;
}

export type MatchResult = 'win' | 'loss' | 'draw' | 'none';

export interface Match {
  number: number;
  result: MatchResult;
  // New features
  accuracy?: number; // 0-100
  estimatedRating?: number;
}

export interface Session {
  id: number;
  userId: number;
  opponentId: number;
  opponentName: string; // Snapshot in case player is deleted
  gameType: 'chess' | 'rapid' | 'blitz';
  timeControl: string;
  userScore: number;
  opponentScore: number;
  wins: number;
  draws: number;
  losses: number;
  date: string;
  matches: Match[];
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  autoLogout: boolean;
  soundEffects: boolean;
}

export type View = 'dashboard' | 'players' | 'sessions' | 'stats' | 'settings' | 'admin';
