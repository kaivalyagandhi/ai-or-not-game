/**
 * Enhanced error boundary specifically for image loading failures
 * Provides graceful fallbacks and retry mechanisms
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

interface Props {
  children: ReactNode;
  fallbackImage?: string;
  onImageError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryAttempts?: number;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

export class ImageErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ImageErrorBoundary caught an error:', error, errorInfo);
    
    // Log to performance monitor
    performanceMonitor.recordImageLoad(-1); // Indicate failure
    
    // Call optional error handler
    if (this.props.onImageError) {
      this.props.onImageError(error, errorInfo);
    }

    // Auto-retry for network-related errors
    if (this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  /**
   * Determine if error should trigger auto-retry
   */
  private shouldAutoRetry(error: Error): boolean {
    const { retryAttempts = 2 } = this.props;
    const { retryCount } = this.state;
    
    // Don't retry if we've exceeded attempts
    if (retryCount >= retryAttempts) {
      return false;
    }

    // Retry for network-related errors
    const networkErrors = [
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      'timeout',
      'NETWORK_ERROR',
    ];

    return networkErrors.some(errorType => 
      error.message.includes(errorType) || error.name.includes(errorType)
    );
  }

  /**
   * Schedule a retry with exponential backoff
   */
  private scheduleRetry = () => {
    const { retryCount } = this.state;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Max 5 seconds

    this.setState({ isRetrying: true });

    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        retryCount: retryCount + 1,
        isRetrying: false,
      });
    }, delay);
  };

  /**
   * Manual retry handler
   */
  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: this.state.retryCount + 1,
      isRetrying: false,
    });
  };

  /**
   * Get adaptive settings for error display
   */
  private getAdaptiveSettings() {
    return performanceMonitor.getAdaptiveSettings();
  }

  override render() {
    if (this.state.hasError) {
      const { fallbackImage, showErrorDetails = false, retryAttempts = 2 } = this.props;
      const { error, retryCount, isRetrying } = this.state;
      const settings = this.getAdaptiveSettings();
      const canRetry = retryCount < retryAttempts;

      // Show retry loading state
      if (isRetrying) {
        return (
          <div className="flex items-center justify-center min-h-[200px] bg-gray-100 rounded-lg">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Retrying image load...</p>
            </div>
          </div>
        );
      }

      // Fallback image if provided
      if (fallbackImage) {
        return (
          <div className="relative">
            <img 
              src={fallbackImage} 
              alt="Fallback content"
              className="w-full h-full object-cover rounded-lg"
              onError={() => {
                // If fallback also fails, show error UI
                this.setState({ hasError: true, error: new Error('Fallback image failed') });
              }}
            />
            {showErrorDetails && (
              <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Using fallback image
              </div>
            )}
          </div>
        );
      }

      // Error UI with adaptive complexity
      return (
        <div className={`flex flex-col items-center justify-center min-h-[200px] p-6 rounded-lg ${
          settings.animationComplexity === 'minimal' 
            ? 'bg-gray-100' 
            : 'bg-gradient-to-br from-red-50 to-orange-50'
        }`}>
          <div className="text-center space-y-4 max-w-sm">
            {/* Error icon */}
            <div className={`text-4xl ${settings.enableAnimations ? 'animate-bounce' : ''}`}>
              🖼️💥
            </div>
            
            {/* Error message */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Image Loading Failed
              </h3>
              <p className="text-sm text-gray-600">
                {error?.message.includes('timeout') 
                  ? 'The image took too long to load. This might be due to a slow connection.'
                  : error?.message.includes('NetworkError') || error?.message.includes('Failed to fetch')
                    ? 'Network connection issue. Please check your internet connection.'
                    : 'Unable to load the image. This might be a temporary issue.'
                }
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {canRetry && (
                <button
                  onClick={this.handleManualRetry}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full"
                >
                  Try Again ({retryAttempts - retryCount} attempts left)
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full"
              >
                Reload Page
              </button>
            </div>

            {/* Error details for debugging */}
            {showErrorDetails && error && (
              <details className="text-left">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {error.name}: {error.message}
                  {error.stack && `\n${error.stack.slice(0, 200)}...`}
                </pre>
              </details>
            )}

            {/* Network info */}
            <div className="text-xs text-gray-500">
              Retry count: {retryCount}/{retryAttempts}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping images with error boundary
 */
export const withImageErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ImageErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} ref={ref} />
    </ImageErrorBoundary>
  ));
};

/**
 * Hook for handling image loading errors in functional components
 */
export const useImageErrorHandler = (retryAttempts: number = 2) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleImageError = React.useCallback((error: Error) => {
    setError(error);
    performanceMonitor.recordImageLoad(-1); // Indicate failure
  }, []);

  const retry = React.useCallback(() => {
    if (retryCount < retryAttempts) {
      setIsRetrying(true);
      setError(null);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsRetrying(false);
      }, Math.min(1000 * Math.pow(2, retryCount), 5000));
    }
  }, [retryCount, retryAttempts]);

  const reset = React.useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    error,
    retryCount,
    isRetrying,
    canRetry: retryCount < retryAttempts,
    handleImageError,
    retry,
    reset,
  };
};
