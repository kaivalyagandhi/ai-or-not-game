import React, { useState, useEffect } from 'react';

interface AITipFormProps {
  challengeMessage: string;
  aiTip: string;
  onSubmit: (comment: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const AITipForm: React.FC<AITipFormProps> = ({
  challengeMessage,
  aiTip,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [editableComment, setEditableComment] = useState('');

  // Pre-populate the form with the formatted comment
  useEffect(() => {
    const formattedComment = `${challengeMessage}\n${aiTip}`;
    setEditableComment(formattedComment);
  }, [challengeMessage, aiTip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editableComment.trim()) {
      await onSubmit(editableComment.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white p-4">
          <h2 className="text-xl font-bold">Share Your AI Detection Tip</h2>
          <p className="text-primary-100 text-sm mt-1">
            Help other players by sharing what you learned!
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your comment (you can edit this before posting):
            </label>
            <textarea
              id="comment"
              value={editableComment}
              onChange={(e) => setEditableComment(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-montserrat"
              placeholder="Share your AI detection tip..."
              disabled={isSubmitting}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {editableComment.length} characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !editableComment.trim()}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : (
                <>
                  <span>💡</span>
                  Post Tip
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
