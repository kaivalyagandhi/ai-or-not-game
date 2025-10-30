import { ErrorInfo, useCallback } from 'react';
import { 
  SplashScreen, 
  GameRound, 
  ResultsScreen,
  LeaderboardTabs,
  ErrorBoundary,
  LoadingScreen,
  EducationalContent,
  AudioSystem
} from './components';
import { useGameState } from './hooks/useGameState';
import { AudioContextManager } from './utils/audio';
import { AudioContext, useAudioRef } from './hooks/useAudio';

export const App = () => {
  const {
    gameState,
    session,
    currentRound,
    error,
    loading,

    startGame,
    handleRoundComplete,
    goToSplash,
    goToLeaderboard,
    goBackFromLeaderboard,
    continueFromEducational,
  } = useGameState();

  // Audio system ref for controlling audio
  const audioSystemRef = useAudioRef();

  // Audio toggle handler
  const handleAudioToggle = useCallback((enabled: boolean) => {
    console.log('Audio', enabled ? 'enabled' : 'disabled');
  }, []);

  // Handle start game from splash
  const handleStartGame = async () => {
    // Unlock audio context on user interaction
    await AudioContextManager.getInstance().unlockAudioContext();
    
    // Try to start background music only if it's not already playing
    // This handles the case where auto-start failed due to browser restrictions
    if (audioSystemRef.current?.isAudioEnabled() && !audioSystemRef.current?.isBackgroundMusicPlaying()) {
      console.log('🎮 Starting background music on user interaction');
      audioSystemRef.current?.playBackgroundMusic();
    }
    
    // Start the game - background music continues throughout
    startGame();
  };

  // Background music is now handled automatically by AudioSystem
  // It starts when the component loads and continues throughout the game

  // Error boundary error handler
  const handleErrorBoundaryError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  };

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading game..." />;
  }

  // Error state with enhanced error handling
  if (gameState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-red-900">
            Oops! Something went wrong
          </h1>
          <p className="text-red-700 mb-4">
            {error || 'An unexpected error occurred'}
          </p>
          
          {/* Show offline indicator if applicable */}
          {!navigator.onLine && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <span className="text-lg mr-2">📡</span>
                <span className="text-sm">You appear to be offline</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={goToSplash}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 text-sm"
            >
              Refresh Page
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <p>If the problem persists:</p>
            <ul className="list-disc list-inside text-left mt-2 space-y-1">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Main game container with error boundary
  return (
    <AudioContext.Provider value={audioSystemRef}>
      <ErrorBoundary onError={handleErrorBoundaryError}>
        <div className="game-container relative">
          {/* Audio System - always present */}
          <AudioSystem 
            ref={(ref) => {
              if (ref) {
                audioSystemRef.current = ref;
              }
            }}
            onAudioToggle={handleAudioToggle}
          />
        {(() => {
          switch (gameState) {
            case 'splash':
              return <SplashScreen onStartGame={handleStartGame} onViewLeaderboard={goToLeaderboard} />;
            
            case 'playing':
              if (!currentRound || !session?.sessionId) {
                return (
                  <div className="flex items-center justify-center min-h-screen">
                    <p className="text-red-600">Game data not available</p>
                  </div>
                );
              }
              return (
                <GameRound
                  round={currentRound}
                  sessionId={session.sessionId}
                  onRoundComplete={handleRoundComplete}
                />
              );
            
            case 'educational':
              return (
                <EducationalContent
                  onContinue={continueFromEducational}
                  sessionId={session?.sessionId}
                />
              );
            
            case 'results':
              if (!session) {
                return (
                  <div className="flex items-center justify-center min-h-screen">
                    <p className="text-red-600">Session data not available</p>
                  </div>
                );
              }
              return (
                <ResultsScreen
                  session={session}
                  onPlayAgain={goToSplash}
                  onViewLeaderboard={goToLeaderboard}
                />
              );
            
            case 'leaderboard':
              return (
                <div className="min-h-screen bg-gray-50">
                  <LeaderboardTabs
                    currentUserId={session?.userId}
                    onClose={goBackFromLeaderboard}
                    onBack={goBackFromLeaderboard}
                  />
                </div>
              );
            
            default:
              return <SplashScreen onStartGame={handleStartGame} />;
          }
        })()}
        </div>
      </ErrorBoundary>
    </AudioContext.Provider>
  );
};
