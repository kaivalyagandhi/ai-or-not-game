/**
 * Badge Assignment and Management System
 *
 * This module handles badge logic based on correct answer count,
 * badge assignment functions, and badge display data for results screen.
 */

import { BadgeType } from '../../shared/types/api.js';

/**
 * Badge configuration and metadata
 */
export interface BadgeConfig {
  type: BadgeType;
  name: string;
  description: string;
  minCorrectAnswers: number;
  maxCorrectAnswers: number;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

/**
 * Badge display information for UI
 */
export interface BadgeDisplayInfo {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  earned: boolean;
  correctAnswersRequired: string;
}

/**
 * Badge configurations for all available badges
 */
export const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  [BadgeType.AI_WHISPERER]: {
    type: BadgeType.AI_WHISPERER,
    name: 'AI Whisperer',
    description: 'Perfect score! You can spot AI-generated content with incredible accuracy.',
    minCorrectAnswers: 6,
    maxCorrectAnswers: 6,
    icon: '🤖',
    color: '#FFD700', // Gold
    rarity: 'legendary',
  },
  [BadgeType.AI_DETECTIVE]: {
    type: BadgeType.AI_DETECTIVE,
    name: 'AI Detective',
    description: 'Outstanding! You have excellent skills at detecting AI-generated content.',
    minCorrectAnswers: 5,
    maxCorrectAnswers: 5,
    icon: '🕵️',
    color: '#E6E6FA', // Lavender
    rarity: 'rare',
  },
  [BadgeType.GOOD_SAMARITAN]: {
    type: BadgeType.GOOD_SAMARITAN,
    name: 'Good Samaritan',
    description: 'Excellent work! You have a keen eye for distinguishing real from artificial.',
    minCorrectAnswers: 4,
    maxCorrectAnswers: 4,
    icon: '👁️',
    color: '#C0C0C0', // Silver
    rarity: 'rare',
  },
  [BadgeType.JUST_HUMAN]: {
    type: BadgeType.JUST_HUMAN,
    name: 'Just Human',
    description: "Not bad! You're getting the hang of spotting AI-generated images.",
    minCorrectAnswers: 3,
    maxCorrectAnswers: 3,
    icon: '👤',
    color: '#CD7F32', // Bronze
    rarity: 'uncommon',
  },
  [BadgeType.HUMAN_IN_TRAINING]: {
    type: BadgeType.HUMAN_IN_TRAINING,
    name: 'Human in Training',
    description: 'Keep practicing! AI detection skills take time to develop.',
    minCorrectAnswers: 0,
    maxCorrectAnswers: 2,
    icon: '🎓',
    color: '#808080', // Gray
    rarity: 'common',
  },
};

/**
 * Determine badge based on correct answer count
 */
export function determineBadge(correctCount: number): BadgeType {
  if (correctCount >= 6) {
    return BadgeType.AI_WHISPERER;
  } else if (correctCount >= 5) {
    return BadgeType.AI_DETECTIVE;
  } else if (correctCount >= 4) {
    return BadgeType.GOOD_SAMARITAN;
  } else if (correctCount >= 3) {
    return BadgeType.JUST_HUMAN;
  } else {
    return BadgeType.HUMAN_IN_TRAINING;
  }
}

/**
 * Get badge configuration by type
 */
export function getBadgeConfig(badgeType: BadgeType): BadgeConfig {
  return BADGE_CONFIGS[badgeType];
}

/**
 * Get badge display information for UI
 */
export function getBadgeDisplayInfo(
  badgeType: BadgeType,
  earned: boolean = true
): BadgeDisplayInfo {
  const config = getBadgeConfig(badgeType);

  let correctAnswersRequired: string;
  if (config.minCorrectAnswers === config.maxCorrectAnswers) {
    correctAnswersRequired = `${config.minCorrectAnswers} correct`;
  } else {
    correctAnswersRequired = `${config.minCorrectAnswers}-${config.maxCorrectAnswers} correct`;
  }

  return {
    type: config.type,
    name: config.name,
    description: config.description,
    icon: config.icon,
    color: config.color,
    rarity: config.rarity,
    earned,
    correctAnswersRequired,
  };
}

/**
 * Get all badge display information for results screen
 */
export function getAllBadgeDisplayInfo(earnedBadge: BadgeType): BadgeDisplayInfo[] {
  return Object.values(BadgeType).map((badgeType) => {
    const earned = badgeType === earnedBadge;
    return getBadgeDisplayInfo(badgeType, earned);
  });
}

/**
 * Validate badge type
 */
export function isValidBadgeType(badgeType: string): badgeType is BadgeType {
  return Object.values(BadgeType).includes(badgeType as BadgeType);
}

/**
 * Get badge requirements text for UI
 */
export function getBadgeRequirementsText(badgeType: BadgeType): string {
  const config = getBadgeConfig(badgeType);

  if (config.minCorrectAnswers === config.maxCorrectAnswers) {
    if (config.minCorrectAnswers === 6) {
      return 'Get all 6 answers correct';
    } else if (config.minCorrectAnswers === 0) {
      return 'Complete the daily challenge';
    } else {
      return `Get exactly ${config.minCorrectAnswers} answers correct`;
    }
  } else {
    return `Get ${config.minCorrectAnswers}-${config.maxCorrectAnswers} answers correct`;
  }
}

/**
 * Get badge rarity color
 */
export function getBadgeRarityColor(rarity: 'common' | 'uncommon' | 'rare' | 'legendary'): string {
  switch (rarity) {
    case 'legendary':
      return '#FFD700'; // Gold
    case 'rare':
      return '#9932CC'; // Purple
    case 'uncommon':
      return '#1E90FF'; // Blue
    case 'common':
    default:
      return '#808080'; // Gray
  }
}

/**
 * Get badge achievement message
 */
export function getBadgeAchievementMessage(badgeType: BadgeType, correctCount: number): string {
  const config = getBadgeConfig(badgeType);

  switch (badgeType) {
    case BadgeType.AI_WHISPERER:
      return `🎉 Perfect! You earned the "${config.name}" badge with ${correctCount}/6 correct answers!`;
    case BadgeType.AI_DETECTIVE:
      return `🕵️ Outstanding! You earned the "${config.name}" badge with ${correctCount}/6 correct answers!`;
    case BadgeType.GOOD_SAMARITAN:
      return `🌟 Great job! You earned the "${config.name}" badge with ${correctCount}/6 correct answers!`;
    case BadgeType.JUST_HUMAN:
      return `👍 Nice work! You earned the "${config.name}" badge with ${correctCount}/6 correct answers!`;
    case BadgeType.HUMAN_IN_TRAINING:
      return `📚 Keep learning! You earned the "${config.name}" badge with ${correctCount}/6 correct answers!`;
    default:
      return `You earned the "${config.name}" badge with ${correctCount}/6 correct answers!`;
  }
}

/**
 * Get next badge information (what the user needs to achieve next)
 */
export function getNextBadgeInfo(currentBadge: BadgeType): BadgeDisplayInfo | null {
  const currentConfig = getBadgeConfig(currentBadge);

  // Find the next badge with higher requirements
  const allBadges = Object.values(BadgeType);
  const nextBadge = allBadges.find((badgeType) => {
    const config = getBadgeConfig(badgeType);
    return config.minCorrectAnswers > currentConfig.minCorrectAnswers;
  });

  if (!nextBadge) {
    return null; // Already at the highest badge
  }

  return getBadgeDisplayInfo(nextBadge, false);
}

/**
 * Calculate badge progress (percentage towards next badge)
 */
export function calculateBadgeProgress(correctCount: number): {
  currentBadge: BadgeType;
  nextBadge: BadgeType | null;
  progress: number; // 0-100
  progressText: string;
} {
  const currentBadge = determineBadge(correctCount);
  const nextBadgeInfo = getNextBadgeInfo(currentBadge);

  if (!nextBadgeInfo) {
    return {
      currentBadge,
      nextBadge: null,
      progress: 100,
      progressText: 'Maximum badge achieved!',
    };
  }

  const nextBadgeConfig = getBadgeConfig(nextBadgeInfo.type);
  const progress = (correctCount / nextBadgeConfig.minCorrectAnswers) * 100;
  const remaining = nextBadgeConfig.minCorrectAnswers - correctCount;

  return {
    currentBadge,
    nextBadge: nextBadgeInfo.type,
    progress: Math.min(progress, 100),
    progressText: `${remaining} more correct answer${remaining === 1 ? '' : 's'} needed for ${nextBadgeInfo.name}`,
  };
}
