// Enums
export enum ImageCategory {
  ANIMALS = 'animals',
  ARCHITECTURE = 'architecture',
  NATURE = 'nature',
  FOOD = 'food',
  PRODUCTS = 'products',
}

export enum BadgeType {
  AI_WHISPERER = 'ai_whisperer', // 5 correct
  GOOD_SAMARITAN = 'good_samaritan', // 4 correct
  JUST_HUMAN = 'just_human', // 3 correct
  HUMAN_IN_TRAINING = 'human_in_training', // 2 or fewer correct
}

// Core Game Data Models
export interface ImageData {
  id: string;
  url: string;
  category: ImageCategory;
  isAI: boolean;
  metadata: {
    source: string;
    description: string;
  };
}

export interface GameRound {
  roundNumber: number;
  category: ImageCategory;
  imageA: ImageData;
  imageB: ImageData;
  correctAnswer: 'A' | 'B'; // Which position contains the human image
  aiImagePosition: 'A' | 'B'; // Which position contains the AI image
  userAnswer?: 'A' | 'B';
  timeRemaining?: number;
  isCorrect?: boolean;
}

export interface GameSession {
  userId: string;
  sessionId: string;
  startTime: number;
  rounds: GameRound[];
  totalScore: number;
  correctCount: number;
  totalTimeBonus: number;
  badge: BadgeType;
  completed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  correctCount: number;
  timeBonus: number;
  completedAt: number;
  badge: BadgeType;
}

export interface DailyGameState {
  date: string; // YYYY-MM-DD format
  imageSet: GameRound[];
  participantCount: number;
  categoryOrder: ImageCategory[];
}

// API Request Types
export interface StartGameRequest {
  userId: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  roundNumber: number;
  userAnswer: 'A' | 'B';
  timeRemaining: number;
}

export interface GetLeaderboardRequest {
  type: 'daily' | 'weekly' | 'all-time';
  limit?: number;
}

export interface GetUserRankRequest {
  userId: string;
  type: 'daily' | 'weekly' | 'all-time';
}

// API Response Types
export interface GameInitResponse {
  success: boolean;
  session?: GameSession;
  error?: string;
}

export interface StartGameResponse {
  success: boolean;
  sessionId?: string;
  currentRound?: GameRound;
  error?: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  isCorrect?: boolean;
  correctAnswer?: 'A' | 'B';
  aiImagePosition?: 'A' | 'B';
  roundScore?: number;
  nextRound?: GameRound;
  gameComplete?: boolean;
  finalResults?: {
    totalScore: number;
    correctCount: number;
    timeBonus: number;
    badge: BadgeType;
  };
  error?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  entries?: LeaderboardEntry[];
  userRank?: number;
  totalParticipants?: number;
  error?: string;
}

export interface UserRankResponse {
  success: boolean;
  rank?: number;
  score?: number;
  totalParticipants?: number;
  error?: string;
}

export interface ParticipantCountResponse {
  success: boolean;
  count?: number;
  error?: string;
}

export interface GameResultsResponse {
  success: boolean;
  session?: GameSession;
  leaderboardPosition?: number;
  error?: string;
}

// Legacy response types for backward compatibility
export interface InitResponse {
  type: 'init';
  postId: string;
  count: number;
  username: string;
}

export interface IncrementResponse {
  type: 'increment';
  postId: string;
  count: number;
}

export interface DecrementResponse {
  type: 'decrement';
  postId: string;
  count: number;
}
