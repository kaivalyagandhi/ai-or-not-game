/**
 * Unit tests for badge assignment logic
 */

import { describe, it, expect } from 'vitest';
import { determineBadge } from '../badge-manager.js';
import { BadgeType } from '../../../shared/types/api.js';

describe('Badge Manager - Badge Assignment', () => {
  it('should assign AI_WHISPERER badge for 6 correct answers', () => {
    const badge = determineBadge(6);
    expect(badge).toBe(BadgeType.AI_WHISPERER);
  });

  it('should assign AI_DETECTIVE badge for 5 correct answers', () => {
    const badge = determineBadge(5);
    expect(badge).toBe(BadgeType.AI_DETECTIVE);
  });

  it('should assign GOOD_SAMARITAN badge for 4 correct answers', () => {
    const badge = determineBadge(4);
    expect(badge).toBe(BadgeType.GOOD_SAMARITAN);
  });

  it('should assign JUST_HUMAN badge for 3 correct answers', () => {
    const badge = determineBadge(3);
    expect(badge).toBe(BadgeType.JUST_HUMAN);
  });

  it('should assign HUMAN_IN_TRAINING badge for 2 correct answers', () => {
    const badge = determineBadge(2);
    expect(badge).toBe(BadgeType.HUMAN_IN_TRAINING);
  });

  it('should assign HUMAN_IN_TRAINING badge for 1 correct answer', () => {
    const badge = determineBadge(1);
    expect(badge).toBe(BadgeType.HUMAN_IN_TRAINING);
  });

  it('should assign HUMAN_IN_TRAINING badge for 0 correct answers', () => {
    const badge = determineBadge(0);
    expect(badge).toBe(BadgeType.HUMAN_IN_TRAINING);
  });

  it('should handle edge case of negative correct count', () => {
    const badge = determineBadge(-1);
    expect(badge).toBe(BadgeType.HUMAN_IN_TRAINING);
  });

  it('should handle edge case of more than 6 correct answers', () => {
    const badge = determineBadge(10);
    expect(badge).toBe(BadgeType.AI_WHISPERER);
  });

  it('should handle floating point correct count', () => {
    const badge = determineBadge(3.7);
    expect(badge).toBe(BadgeType.JUST_HUMAN);
  });
});
