import {Box, Toolbar, Typography, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme, alpha, Tooltip} from "@mui/material";
import {IUser} from "../models/user.ts";
import {MenuItems} from "../globalConstants/mainMenu.tsx";
import {SideBar} from "../components/sideBar/SideBar.tsx";
import {useLocation} from "react-router-dom";
import {IMenuItems} from "../models/mainMenu.ts";
import {Logout, ChevronLeft, ChevronRight} from "@mui/icons-material";
import {useAuth} from "../hooks/useAuth.tsx";
import {useState, useEffect} from "react";
import useMobile from "../hooks/useMobile.tsx";

const sideBarWidth = 240;// Ширина сайдбара
const collapsedSideBarWidth = 64;// Ширина свернутого сайдбара

export interface HomeLayoutProps {
    children: React.ReactNode;// Для детей (children)
    data: IUser;                   // Тип для данных
    isLoading: boolean;          // Тип для флага загрузки
}

export default function HomeLayout({ children,  data, isLoading }: HomeLayoutProps) {
    const theme = useTheme();
    const location = useLocation();
    const { doLogout } = useAuth();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const isMobile = useMobile();
    
    // Состояние сворачивания сайдбара с сохранением в localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Автоматическое сворачивание на мобильных устройствах
    useEffect(() => {
        if (isMobile && !isCollapsed) {
            setIsCollapsed(true);
        }
    }, [isMobile, isCollapsed]);

    // Сохранение состояния в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Динамическая ширина сайдбара
    const currentSideBarWidth = isCollapsed ? collapsedSideBarWidth : sideBarWidth;

    // Градиенты в стиле дизайн-системы тренеров
    const gradients = {
        primary: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #8e44ad 0%, #6c5ce7 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };

    const getHeaderTitle = () => {
        if(location.pathname === "/home/" || location.pathname === "/home") {
            return "Дашборд"
        }
        else {
            const page: IMenuItems = MenuItems.filter((item) => item.link === location.pathname.split("/")[2])[0];
            console.log(page)
            return page.title;
        }
    }

    const handleLogoutClick = () => {
        setLogoutDialogOpen(true);
    };

    const handleLogoutConfirm = () => {
        doLogout();
        setLogoutDialogOpen(false);
    };

    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };

    const handleToggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            <Box sx={{
                display: "grid",
                gridTemplateColumns: `${currentSideBarWidth}px 1fr`,
                gridTemplateRows: "64px 1fr",
                height: "100vh",
                p: "16px",
                columnGap: 1,
                transition: 'grid-template-columns 0.3s ease-in-out',
            }}>
                {/* Хедер в стиле дизайн-системы тренеров */}
                <Paper elevation={0} sx={{
                    gridColumn: "2", 
                    gridRow: "1",
                    background: gradients.primary,
                    borderRadius: '12px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.2,
                    }
                }}>
                    <Toolbar sx={{
                        display: "flex", 
                        justifyContent: "space-between",
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        <Typography 
                            variant="h5" 
                            noWrap 
                            component="div"
                            sx={{ 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                            }}
                        >
                            {getHeaderTitle()}
                        </Typography>

                        {!isLoading && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                background: alpha('#ffffff', 0.1),
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                            }}>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    {`${data.first_name} ${data.last_name}`}
                                </Typography>
                                <IconButton
                                    color="inherit"
                                    onClick={handleLogoutClick}
                                    sx={{ 
                                        color: 'white',
                                        background: alpha('#ffffff', 0.1),
                                        '&:hover': {
                                            background: alpha('#ffffff', 0.2),
                                            transform: 'scale(1.05)',
                                        },
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    <Logout />
                                </IconButton>
                            </Box>
                        )}
                    </Toolbar>
                </Paper>
                
                {/* Сайдбар с кнопкой сворачивания */}
                <SideBar 
                    width={currentSideBarWidth} 
                    isCollapsed={isCollapsed}
                    onToggle={handleToggleSidebar}
                />

                {/* Основной контент */}
                <Box sx={{
                    gridColumn: "2", 
                    gridRow: "2", 
                    p: 3, 
                    overflow: "auto",
                    background: theme.palette.background.default,
                    borderRadius: '12px',
                }}>
                    {children}
                </Box>
            </Box>

            {/* Диалог подтверждения логаута */}
            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: theme.palette.background.paper,
                    }
                }}
            >
                <DialogTitle sx={{ 
                    pb: 1,
                    background: gradients.primary,
                    color: 'white',
                    borderRadius: '12px 12px 0 0',
                }}>
                    Выйти из системы?
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Вы уверены, что хотите выйти из системы? Все несохраненные данные будут потеряны.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={handleLogoutCancel} 
                        color="inherit"
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleLogoutConfirm} 
                        variant="contained" 
                        color="error"
                        autoFocus
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: theme.palette.error.main,
                            '&:hover': {
                                background: theme.palette.error.dark,
                            }
                        }}
                    >
                        Выйти
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}