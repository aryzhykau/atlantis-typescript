import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { debugLog, LogLevel } from '../../../utils/debug';

interface CalendarErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CalendarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary specifically for calendar components
 * Provides graceful error handling and recovery
 */
export class CalendarErrorBoundary extends Component<
  CalendarErrorBoundaryProps,
  CalendarErrorBoundaryState
> {
  constructor(props: CalendarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CalendarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    debugLog(
      'Calendar Error Boundary caught an error',
      { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack },
      LogLevel.ERROR
    );

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'error.main',
            borderRadius: 1,
            backgroundColor: 'error.light',
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Ошибка календаря
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Произошла ошибка при отображении календаря. Попробуйте обновить страницу.
          </Typography>
          <Button variant="outlined" color="primary" onClick={this.handleReset}>
            Попробовать еще раз
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                {this.state.error.message}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}
