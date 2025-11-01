import React, { useState, useEffect } from 'react';
import { fetchSessionContentCached, fetchRandomContentFresh } from '../utils/content';
import { getFallbackTip, getFallbackFact } from '../utils/fallbackContent';

interface EducationalContentProps {
  onContinue: () => void;
  sessionId?: string; // Optional session ID for unique content
}

export const EducationalContent: React.FC<EducationalContentProps> = ({ onContinue, sessionId }) => {
  const [tip, setTip] = useState<string>('');
  const [fact, setFact] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use session-specific content if sessionId is provided, otherwise use random content
        const response = sessionId 
          ? await fetchSessionContentCached(sessionId)
          : await fetchRandomContentFresh();
        
        if (response.success) {
          setTip(response.tip || getFallbackTip('empty'));
          setFact(response.fact || getFallbackFact('empty'));
        } else {
          setError(response.error || 'Failed to load content');
          // Set fallback content
          setTip(getFallbackTip('failed'));
          setFact(getFallbackFact('failed'));
        }
      } catch (err) {
        console.error('Error loading educational content:', err);
        setError('Failed to load educational content');
        // Set fallback content
        setTip(getFallbackTip('error'));
        setFact(getFallbackFact('error'));
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading educational content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary-500">
            AI Fact Check
          </h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <p className="text-yellow-800 text-sm">
                {error} (showing fallback content)
              </p>
            </div>
          </div>
        )}

        {/* Content Cards */}
        <div className="space-y-4 mb-6">
          {/* AI Check */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-xl mr-3 mt-1">💡</div>
              <div>
                <h3 className="text-base font-semibold text-secondary-500 mb-2">
                  AI Check
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm educational-body">
                  {tip}
                </p>
              </div>
            </div>
          </div>

          {/* AI Fact */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-xl mr-3 mt-1">🤖</div>
              <div>
                <h3 className="text-base font-semibold text-secondary-500 mb-2">
                  AI Fact
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm educational-body">
                  {fact}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Game Progress</span>
            <span>3 of 6 rounds complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg btn-text"
          >
            Continue Playing!
          </button>
        </div>
      </div>
    </div>
  );
};
