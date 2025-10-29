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





        {/* Game Instructions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-3 text-center">
            How to Play
          </p>
          <ul className="space-y-2 text-sm text-gray-600 text-left">
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">1.</span>
              You'll see 6 pairs of images - pick the REAL photo (not AI-generated)
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">2.</span>
              You have 10 seconds per round
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">3.</span>
              Faster correct answers = higher score!
            </li>
          </ul>
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
          className="w-full font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xl transform hover:scale-105 transition-transform"
        >
          Start Playing
        </button>


      </div>
    </div>
  );
};
