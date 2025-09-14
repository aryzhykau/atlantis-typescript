import React, { ReactNode, Component, ErrorInfo } from 'react';
import { Box, Alert, Typography } from '@mui/material';

interface CalendarErrorDisplayProps {
  error?: any;
  title?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

/**
 * Error display component for calendar-related errors
 */
const CalendarErrorDisplay: React.FC<CalendarErrorDisplayProps> = ({
  error,
  title = 'Ошибка загрузки календаря',
  showRetry = false,
  onRetry,
}) => {
  if (!error) return null;

  const errorMessage = error?.data?.detail || error?.message || 'Произошла неизвестная ошибка';

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2">
          {errorMessage}
        </Typography>
        {showRetry && onRetry && (
          <Box sx={{ mt: 2 }}>
            <button onClick={onRetry}>Повторить попытку</button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

interface CalendarErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CalendarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for calendar components
 */
class CalendarErrorBoundary extends Component<CalendarErrorBoundaryProps, CalendarErrorBoundaryState> {
  constructor(props: CalendarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CalendarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Calendar error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <CalendarErrorDisplay 
          error={this.state.error}
          title="Ошибка компонента календаря"
          showRetry
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

export { CalendarErrorDisplay, CalendarErrorBoundary };
