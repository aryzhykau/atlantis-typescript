import { Box, Collapse, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

interface MobileCollapsibleSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultOpen?: boolean;
  onDarkBackground?: boolean;
}

export function MobileCollapsibleSearch({
  value,
  onChange,
  placeholder = 'Поиск',
  defaultOpen = false,
  onDarkBackground = false,
}: MobileCollapsibleSearchProps) {
  const [open, setOpen] = useState(defaultOpen);

  const handleClose = () => {
    setOpen(false);
    onChange('');
  };

  return (
    <Box>
      {!open && (
        <Tooltip title="Поиск">
          <IconButton
            onClick={() => setOpen(true)}
            aria-label="open-search"
            sx={onDarkBackground ? { color: 'white' } : undefined}
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
      )}

      <Collapse in={open} unmountOnExit>
        <TextField
          size="small"
          fullWidth
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoFocus
          sx={onDarkBackground ? {
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.55)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.85)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.8)',
              opacity: 1,
            },
            '& .MuiSvgIcon-root': {
              color: 'white',
            },
          } : undefined}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClose} aria-label="close-search">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Collapse>
    </Box>
  );
}
