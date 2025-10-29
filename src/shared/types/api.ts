// Enums
export enum ImageCategory {
  ANIMALS = 'animals',
  ARCHITECTURE = 'architecture',
  NATURE = 'nature',
  FOOD = 'food',
  PRODUCTS = 'products',
  SCIENCE = 'science',
}

export enum BadgeType {
  AI_WHISPERER = 'ai_whisperer', // 6 correct
  AI_DETECTIVE = 'ai_detective', // 5 correct
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
  attemptNumber: number; // 1 or 2 for daily limit tracking
  showedEducationalContent: boolean;
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
  educationalContent: EducationalContent;
  inspirationalContent: InspirationContent;
}

// Educational and Inspirational Content
export interface EducationalContent {
  tips: string[];
  facts: string[];
  currentTipIndex: number;
  currentFactIndex: number;
}

export interface InspirationContent {
  quotes: string[];
  jokes: string[];
  currentIndex: number;
  type: 'quote' | 'joke';
}

// Play Limit Tracking
export interface UserPlayLimit {
  userId: string;
  date: string;
  attempts: number;
  maxAttempts: number; // 2 in production, unlimited in dev
  bestScore: number;
  bestAttempt: GameSession;
}

// Audio Configuration
export interface AudioConfig {
  backgroundMusic: string; // File path/URL
  successSound: string;
  failureSound: string;
  enabled: boolean;
  volume: number; // 0-1
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

export interface GetPlayAttemptsRequest {
  userId: string;
}

export interface IncrementAttemptsRequest {
  userId: string;
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

export interface PlayAttemptsResponse {
  success: boolean;
  attempts?: number;
  maxAttempts?: number;
  remainingAttempts?: number;
  bestScore?: number;
  error?: string;
}

export interface DailyPlayCountResponse {
  success: boolean;
  playCount?: number;
  maxAttempts?: number;
  remainingAttempts?: number;
  error?: string;
}

export interface WeeklyUserRankResponse {
  success: boolean;
  userRank?: number | null;
  score?: number | null;
  totalParticipants?: number;
  error?: string;
}

export interface EducationalContentResponse {
  success: boolean;
  tips?: string[];
  facts?: string[];
  currentTip?: string;
  currentFact?: string;
  error?: string;
}

export interface InspirationalContentResponse {
  success: boolean;
  quotes?: string[];
  jokes?: string[];
  currentContent?: string;
  contentType?: 'quote' | 'joke';
  error?: string;
}

export interface CurrentContentResponse {
  success: boolean;
  tip?: string;
  fact?: string;
  inspiration?: string;
  error?: string;
}

// Realtime message types
export interface ParticipantUpdateMessage {
  type: 'participant_count_update';
  count: number;
  timestamp: number;
}

export interface ParticipantJoinMessage {
  type: 'participant_join';
  userId: string;
  username: string;
  timestamp: number;
}

export interface ParticipantLeaveMessage {
  type: 'participant_leave';
  userId: string;
  timestamp: number;
}

export interface LeaderboardUpdateMessage {
  type: 'leaderboard_update';
  leaderboardType: 'daily' | 'weekly' | 'all-time';
  entry: LeaderboardEntry;
  timestamp: number;
}

export interface RankUpdateMessage {
  type: 'rank_update';
  userId: string;
  leaderboardType: 'daily' | 'weekly' | 'all-time';
  newRank: number;
  totalParticipants: number;
  timestamp: number;
}

export type RealtimeMessage = 
  | ParticipantUpdateMessage 
  | ParticipantJoinMessage 
  | ParticipantLeaveMessage
  | LeaderboardUpdateMessage
  | RankUpdateMessage;

export interface GameResultsResponse {
  success: boolean;
  session?: GameSession;
  leaderboardPosition?: number;
  error?: string;
}

// AI Tip Comment API Types
export interface PostAITipRequest {
  comment: string;
}

export interface PostAITipResponse {
  success: boolean;
  commentId?: string;
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
