import React from 'react';
import logger from '../services/logger.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      errorId: this.state.errorId
    };

    logger.error('React Error Boundary caught an error', errorDetails);

    this.setState({
      error,
      errorInfo
    });

    if (window.reportError && typeof window.reportError === 'function') {
      window.reportError(error, errorDetails);
    }
  }

  handleRetry = () => {
    logger.userAction('Error boundary retry attempted', { errorId: this.state.errorId });
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    logger.userAction('Error boundary page reload', { errorId: this.state.errorId });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p className="error-description">
              We're sorry, but something unexpected happened. The error has been logged 
              and we'll work to fix it as soon as possible.
            </p>

            <div className="error-details">
              <details>
                <summary>Technical Details (for developers)</summary>
                <div className="error-technical">
                  <div className="error-field">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </div>
                  <div className="error-field">
                    <strong>Error Message:</strong> {this.state.error?.message}
                  </div>
                  <div className="error-field">
                    <strong>Component Stack:</strong>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="error-field">
                      <strong>Stack Trace:</strong>
                      <pre>{this.state.error?.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            </div>

            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                Try Again
              </button>
              
              <button 
                onClick={this.handleReload}
                className="reload-button"
              >
                Reload Page
              </button>

              <a 
                href="/"
                className="home-button"
              >
                Go to Home
              </a>
            </div>

            <div className="error-help">
              <p>
                If this problem persists, please try:
              </p>
              <ul>
                <li>Refreshing the page</li>
                <li>Clearing your browser cache</li>
                <li>Using a different browser</li>
                <li>Checking your internet connection</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
