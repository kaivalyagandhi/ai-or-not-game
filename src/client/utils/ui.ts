/**
 * UI utility functions for formatting and display
 */

/**
 * Formats a combined round label with round number, total rounds, and category
 * @param roundNumber Current round number (1-based)
 * @param totalRounds Total number of rounds in the game
 * @param category Category name for the current round
 * @returns Formatted label string in the format "ROUND X OF Y (Category)"
 */
export const formatRoundLabel = (
  roundNumber: number,
  totalRounds: number,
  category: string
): string => {
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  return `ROUND ${roundNumber} OF ${totalRounds} (${capitalizedCategory})`;
};
