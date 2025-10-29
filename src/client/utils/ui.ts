/**
 * UI utility functions for formatting and display
 */

/**
 * Formats a round label with round number and total rounds
 * @param roundNumber Current round number (1-based)
 * @param totalRounds Total number of rounds in the game
 * @param category Category name for the current round (unused but kept for compatibility)
 * @returns Formatted label string in the format "ROUND X OF Y"
 */
export const formatRoundLabel = (
  roundNumber: number,
  totalRounds: number,
  category: string
): string => {
  return `ROUND ${roundNumber} OF ${totalRounds}`;
};
