import { useState } from 'react';
import { useSnackbar } from '../useSnackBar';

export interface UseFormSubmissionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface UseFormSubmissionReturn {
  submit: (mutationFn: () => Promise<any>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useFormSubmission = (options: UseFormSubmissionOptions = {}): UseFormSubmissionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { displaySnackbar } = useSnackbar();

  const {
    successMessage = 'Операция выполнена успешно',
    errorMessage = 'Произошла ошибка при выполнении операции',
    onSuccess,
    onError,
  } = options;

  const submit = async (mutationFn: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);

    try {
      await mutationFn();
      displaySnackbar(successMessage, 'success');
      onSuccess?.();
    } catch (err: any) {
      const errorDetail = err?.data?.detail || err?.message || errorMessage;
      setError(errorDetail);
      displaySnackbar(errorDetail, 'error');
      onError?.(err);
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submit,
    isLoading,
    error,
  };
};
