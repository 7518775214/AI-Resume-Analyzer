import React, { Component } from 'react';
import ServerError from '../pages/ServerError';

/**
 * Reusable React Error Boundary Component
 * Catches JavaScript errors in child component rendering, lifecycle methods, and constructors.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary Caught Error]:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ServerError
            error={this.state.error}
            onRetry={this.handleReset}
          />
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
