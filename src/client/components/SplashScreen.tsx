import React from 'react';
import { apiCall } from '../utils/network';

interface SplashScreenProps {
  onStartGame: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame }) => {

  // Get current date in a shorter format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };





  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full text-center space-y-4">
        {/* Game Logo/Title */}
        <div className="space-y-2">
          <div className="text-5xl mb-2">🤖</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            AI or Not?
          </h1>
          <p className="text-base text-gray-600">
            Can you tell AI from reality?
          </p>
        </div>

        {/* Current Date and Instructions - Horizontal Layout */}
        <div className="splash-horizontal-layout">
          {/* Current Date */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Daily Challenge
            </p>
            <p className="text-base font-semibold text-gray-900">
              {getCurrentDate()}
            </p>
          </div>

          {/* Game Instructions */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 text-center">
              How to Play
            </p>
            <ul className="space-y-1 text-xs text-gray-600 text-left">
              <li className="flex items-start">
                <span className="text-indigo-600 font-bold mr-1">1.</span>
                Pick the REAL photo from 6 pairs
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 font-bold mr-1">2.</span>
                10 seconds per round
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 font-bold mr-1">3.</span>
                Faster = higher score!
              </li>
            </ul>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={async () => {
            // Register participant join when starting game with error handling
            try {
              await apiCall('/api/participants/join', {
                method: 'POST',
              }, {
                maxRetries: 1,
                baseDelay: 500,
              });
            } catch (err) {
              console.error('Error registering participant:', err);
              // Continue with game start even if registration fails
              // This is not critical for gameplay
            }
            onStartGame();
          }}
          className="w-full font-bold py-3 px-6 rounded-lg text-base transition-colors duration-200 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xl transform hover:scale-105 transition-transform"
        >
          Start Playing!
        </button>
      </div>
    </div>
  );
};
