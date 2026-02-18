import { createTheme } from '@mui/material/styles';
import { ruRU } from '@mui/x-date-pickers/locales';

const lightTheme = createTheme({
    shape: {
        borderRadius: 10
    },
    palette: {
        mode: 'light', // Светлая тема
        primary: {
            main: '#8e44ad', // Фиолетовый оттенок как основной
        },
        secondary: {
            main: '#6c5ce7', // Графитово-синий для контраста
        },
        background: {
            default: '#f1f1f1', // Нейтральный фон
            paper: '#ffffff',  // Белый фон для карточек
        },
        text: {
            primary: '#2c3e50', // Тёмно-серый для текста
            secondary: '#7f8c8d', // Более светлый оттенок для второстепенного текста
        },
        error: {
            main: '#e74c3c', // Красный для ошибок
        },
        warning: {
            main: '#f39c12', // Желтый для предупреждений
        },
        success: {
            main: '#27ae60', // Зелёный для успеха
        },
        info: {
            main: '#3498db', // Синий для информационных элементов
        },
        action: {
            active: '#8e44ad', // Фиолетовый для активных элементов
            hover: '#9b59b6', // Легкий фиолетовый оттенок для hover
        },
        divider: '#dcdcdc', // Цвет разделителей
    },
    typography: {
        fontFamily: "'Roboto', sans-serif", // Основной шрифт
        h1: {
            fontSize: '3rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.05em',
            color: '#2c3e50', // Цвет для h1
        },
        h2: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#2c3e50',
        },
        h3: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#2c3e50',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.5,
            color: '#2c3e50',
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 700,
            lineHeight: 1.6,
            color: '#2c3e50',
        },
        h6: {
            fontSize: '1.125rem',
            fontWeight: 700,
            lineHeight: 1.7,
            color: '#2c3e50',
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#2c3e50',
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#2c3e50',
        },
        caption: {
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#7f8c8d',
        },
        button: {
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.6,
            color: '#2c3e50',
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.6,
            color: '#7f8c8d',
        },
    },
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: 24,
                    background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                    boxShadow: '0px 18px 50px rgba(15,23,42,0.25)',
                    backdropFilter: 'blur(8px)',
                }),
            },
        },
    },
}, ruRU);

const darkTheme = createTheme({
    shape: {
        borderRadius: 10
    },
    palette: {
        mode: 'dark', // Тёмная тема
        primary: {
            main: '#8e44ad', // Фиолетовый для акцентов
        },
        secondary: {
            main: '#6c5ce7', // Более тёмный синий для контраста
        },
        background: {
            default: '#121212', // Почти чёрный фон
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ecf0f1', // Светлый текст на тёмном фоне
            secondary: '#bdc3c7', // Более тёмный серый для второстепенного текста
        },
        error: {
            main: '#e74c3c',
        },
        warning: {
            main: '#f39c12',
        },
        success: {
            main: '#27ae60',
        },
        info: {
            main: '#3498db',
        },
        action: {
            active: '#8e44ad',
            hover: '#9b59b6',
        },
        divider: '#7f8c8d', // Тёмный разделитель
    },
    typography: {
        fontFamily: "'Roboto', sans-serif",
        h1: {
            fontSize: '3rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.05em',
            color: '#ecf0f1', // Цвет для h1
        },
        h2: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#ecf0f1',
        },
        h3: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#ecf0f1',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.5,
            color: '#ecf0f1',
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 700,
            lineHeight: 1.6,
            color: '#ecf0f1',
        },
        h6: {
            fontSize: '1.125rem',
            fontWeight: 700,
            lineHeight: 1.7,
            color: '#ecf0f1',
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#ecf0f1',
        },
        body2: {
            fontSize: '0.8rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#ecf0f1',
        },
        caption: {
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#bdc3c7',
        },
        button: {
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.6,
            color: '#ecf0f1',
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.6,
            color: '#bdc3c7',
        },
    },
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: 24,
                    background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                    boxShadow: '0px 18px 50px rgba(15,23,42,0.35)',
                    backdropFilter: 'blur(8px)',
                }),
            },
        },
    },
}, ruRU);

export { lightTheme, darkTheme };
