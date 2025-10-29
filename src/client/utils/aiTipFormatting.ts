/**
 * Formats a comment by combining challenge results message with AI tip
 * @param challengeMessage The challenge results message
 * @param aiTip The AI detection tip text
 * @returns Formatted comment string
 */
export const formatAITipComment = (challengeMessage: string, aiTip: string): string => {
  // Handle edge cases for missing or empty AI tips
  if (!aiTip || aiTip.trim() === '') {
    return challengeMessage;
  }

  // Handle edge case for missing challenge message
  if (!challengeMessage || challengeMessage.trim() === '') {
    return `Here's my AI detection tip to help you: ${aiTip.trim()}`;
  }

  // Format comment as specified in requirements
  return `${challengeMessage.trim()}\nHere's my AI detection tip to help you: ${aiTip.trim()}`;
};

/**
 * Validates that a comment has the required components
 * @param comment The formatted comment
 * @returns True if comment is valid, false otherwise
 */
export const validateAITipComment = (comment: string): boolean => {
  if (!comment || comment.trim() === '') {
    return false;
  }

  // Check if comment has some content
  return comment.trim().length > 0;
};

/**
 * Extracts the AI tip portion from a formatted comment
 * @param formattedComment The full formatted comment
 * @returns The AI tip portion or empty string if not found
 */
export const extractAITipFromComment = (formattedComment: string): string => {
  const tipPrefix = 'Here\'s my AI detection tip to help you: ';
  const tipIndex = formattedComment.indexOf(tipPrefix);
  
  if (tipIndex === -1) {
    return '';
  }
  
  return formattedComment.substring(tipIndex + tipPrefix.length).trim();
};
