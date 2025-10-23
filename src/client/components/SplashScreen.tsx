import React, { useState, useEffect } from 'react';
import { ParticipantCountResponse } from '../../shared/types/api';

interface SplashScreenProps {
  onStartGame: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame }) => {
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current date in a readable format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch participant count
  const fetchParticipantCount = async () => {
    try {
      const response = await fetch('/api/participants/count');
      const data: ParticipantCountResponse = await response.json();
      
      if (data.success && data.count !== undefined) {
        setParticipantCount(data.count);
      } else {
        setError('Failed to load participant count');
      }
    } catch (err) {
      console.error('Error fetching participant count:', err);
      setError('Failed to load participant count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipantCount();
    
    // Set up polling for real-time updates every 5 seconds
    const interval = setInterval(fetchParticipantCount, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Game Logo/Title */}
        <div className="space-y-4">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Spot the Bot
          </h1>
          <p className="text-lg text-gray-600">
            Can you tell AI from reality?
          </p>
        </div>

        {/* Current Date */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
            Daily Challenge
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {getCurrentDate()}
          </p>
        </div>

        {/* Participant Counter */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
            Players Today
          </p>
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <p className="text-2xl font-bold text-indigo-600">
              {participantCount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Game Instructions */}
        <div className="bg-white rounded-lg p-6 shadow-sm text-left">
          <h3 className="font-semibold text-gray-900 mb-3">How to Play:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">1.</span>
              You'll see 5 pairs of images
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">2.</span>
              Pick the REAL photo (not AI-generated)
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">3.</span>
              You have 10 seconds per round
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">4.</span>
              Faster correct answers = higher score!
            </li>
          </ul>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
        >
          Start Playing
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          One game per day • Compete on the leaderboard
        </p>
      </div>
    </div>
  );
};
