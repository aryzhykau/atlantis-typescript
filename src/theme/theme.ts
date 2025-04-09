import { createTheme } from '@mui/material/styles';

// Светлая тема
const lightTheme = createTheme({
    palette: {
        mode: 'light', // Устанавливаем режим светлой темы
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", sans-serif',
    },
});

// Тёмная тема
const darkTheme = createTheme({
    palette: {
        mode: 'dark', // Устанавливаем режим тёмной темы
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#121212',
        },
    },
    typography: {
        fontFamily: '"Roboto", sans-serif',
    },
});

export { lightTheme, darkTheme };
