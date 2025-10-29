import React, { useState, useEffect } from 'react';
import { fetchRandomContentFresh } from '../utils/content';

interface EducationalContentProps {
  onContinue: () => void;
}

export const EducationalContent: React.FC<EducationalContentProps> = ({ onContinue }) => {
  const [tip, setTip] = useState<string>('');
  const [fact, setFact] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchRandomContentFresh();
        
        if (response.success) {
          setTip(response.tip || 'Look for \'the smudge.\' AI sometimes blurs or smudges details where objects meet, like a ring against a finger.');
          setFact(response.fact || 'AI image generators don\'t \'see\' or \'think.\' They\'re just incredibly complex pattern-matching machines.');
        } else {
          setError(response.error || 'Failed to load content');
          // Set fallback content
          setTip('AI still gets hands wrong. Count the fingers. If it looks like a horror movie monster\'s hand, you\'ve found your tell.');
          setFact('The term \'AI\' was first used at a college conference in 1956. It\'s older than your parents\' vinyl collection.');
        }
      } catch (err) {
        console.error('Error loading educational content:', err);
        setError('Failed to load educational content');
        // Set fallback content
        setTip('Check for perfect symmetry. Reality is rarely perfect. If a face or building is flawlessly symmetrical, it\'s a red flag.');
        setFact('An AI-generated artwork was sold at an auction for $432,500. It was basically a blurry portrait.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading educational content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎓</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Midgame Learning Break
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
          {/* Detection Tip */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-xl mr-3 mt-1">💡</div>
              <div>
                <h3 className="text-base font-semibold text-green-800 mb-2">
                  AI Image Detection Tip
                </h3>
                <p className="text-green-700 leading-relaxed text-sm">
                  {tip}
                </p>
              </div>
            </div>
          </div>

          {/* AI Fact */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-xl mr-3 mt-1">🤖</div>
              <div>
                <h3 className="text-base font-semibold text-purple-800 mb-2">
                  AI Fact
                </h3>
                <p className="text-purple-700 leading-relaxed text-sm">
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
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Continue Playing!
          </button>
        </div>
      </div>
    </div>
  );
};
