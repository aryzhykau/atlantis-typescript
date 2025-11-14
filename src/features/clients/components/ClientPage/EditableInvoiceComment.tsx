import React, { useState, useCallback } from 'react';
import { Box, Typography, TextField, IconButton, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import { useUpdateInvoiceCommentMutation } from '../../../../store/apis/invoices';
import { useSnackbar } from '../../../../hooks/useSnackBar';

interface EditableInvoiceCommentProps {
  invoiceId: number;
  initialComment: string | null | undefined;
}

export const EditableInvoiceComment: React.FC<EditableInvoiceCommentProps> = ({
  invoiceId,
  initialComment,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(initialComment || '');
  const { displaySnackbar } = useSnackbar();
  const [updateInvoiceComment, { isLoading }] = useUpdateInvoiceCommentMutation();

  const handleSave = useCallback(async () => {
    try {
      await updateInvoiceComment({
        invoiceId,
        comment: comment.trim() || null,
      }).unwrap();

      displaySnackbar('Комментарий к инвойсу успешно обновлён', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update invoice comment:', error);
      displaySnackbar('Ошибка при обновлении комментария', 'error');
    }
  }, [invoiceId, comment, updateInvoiceComment, displaySnackbar]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setComment(initialComment || '');
        setIsEditing(false);
      }
      // Prevent DataGrid from capturing space key
      if (e.key === ' ') {
        e.stopPropagation();
      }
    },
    [handleSave, initialComment]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Stop propagation of all key events to prevent DataGrid interference
    e.stopPropagation();
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <TextField
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyPress={handleKeyPress}
          placeholder="Введите комментарий..."
          size="small"
          disabled={isLoading}
          autoFocus
          fullWidth
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '0.875rem',
            },
          }}
        />
        <IconButton
          onClick={handleSave}
          disabled={isLoading}
          size="small"
          color="primary"
          sx={{
            minWidth: 32,
            minHeight: 32,
          }}
        >
          {isLoading ? <CircularProgress size={20} /> : <SaveIcon fontSize="small" />}
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        cursor: 'pointer',
        '&:hover': {
          '& .edit-icon': {
            opacity: 1,
          },
        },
      }}
      onClick={handleEdit}
    >
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          color: comment ? 'text.primary' : 'text.secondary',
          fontStyle: comment ? 'normal' : 'italic',
        }}
      >
        {comment || 'Нажмите для добавления комментария'}
      </Typography>
      <EditIcon
        className="edit-icon"
        fontSize="small"
        sx={{
          opacity: 0,
          transition: 'opacity 0.2s',
          color: 'action.active',
        }}
      />
    </Box>
  );
};
