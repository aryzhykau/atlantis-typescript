import {Box, Typography, IconButton, Drawer, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, useTheme, alpha} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {Logout, LightMode as LightModeIcon, DarkMode as DarkModeIcon} from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeModeProvider';
import {useState} from "react";
import {MobileSideBar} from "../components/sideBar/MobileSidebar.tsx";
import {useAuth} from "../hooks/useAuth.tsx";

export function MobileHomeLayout({children}:{children: React.ReactNode}) {
    const HEADER_CONTENT_HEIGHT = 64;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const { doLogout } = useAuth();
    const theme = useTheme();
    const { toggleMode } = useThemeMode();
    
    const toggleDrawer = (value: boolean) => setDrawerOpen(value);

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

    return (
        <>
        <Box
            bgcolor={theme => theme.palette.background.paper}
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                pt: "env(safe-area-inset-top)",
                pl: "env(safe-area-inset-left)",
                pr: "env(safe-area-inset-right)",
                backdropFilter: 'blur(10px)',
                width: "100%",
                borderBottom: '1px solid',
                borderColor: 'divider',
                boxShadow: theme.palette.mode === 'dark'
                    ? `0 6px 20px ${alpha(theme.palette.common.black, 0.3)}`
                    : `0 6px 18px ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
        >
            <Box
                sx={{
                    height: HEADER_CONTENT_HEIGHT,
                    px: 2,
                    display: 'grid',
                    gridTemplateColumns: '88px 1fr 88px',
                    alignItems: 'center',
                    columnGap: 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => toggleDrawer(true)}
                        sx={{
                            width: 40,
                            height: 40,
                            '&:hover': {
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        <MenuIcon sx={{ fontSize: 24 }} />
                    </IconButton>
                </Box>

                <Box sx={{ minWidth: 0, textAlign: 'center', px: 1 }}>
                    <Typography
                        variant="h6"
                        component="h1"
                        sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.02em', fontSize: '1.2rem' }}
                    >
                        ATLANTIS
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.84, letterSpacing: '0.04em', fontSize: '0.72rem' }}>
                        Swimming School
                    </Typography>
                </Box>

                <Box sx={{display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center'}}>
                    <Tooltip title="Переключить тему">
                        <IconButton
                            onClick={() => toggleMode?.()}
                            sx={{
                                width: 40,
                                height: 40,
                                color: theme.palette.mode === 'dark' ? 'warning.main' : 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {theme.palette.mode === 'dark' ? (
                                <LightModeIcon sx={{ color: 'inherit', fontSize: 24 }} />
                            ) : (
                                <DarkModeIcon sx={{ color: 'inherit', fontSize: 24 }} />
                            )}
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        color="inherit"
                        onClick={handleLogoutClick}
                        sx={{
                            width: 40,
                            height: 40,
                            color: 'error.main',
                            '&:hover': {
                                backgroundColor: 'transparent',
                            }
                        }}
                    >
                        <Logout sx={{ fontSize: 24 }} />
                    </IconButton>
                </Box>
            </Box>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        width: 'min(86vw, 320px)',
                        borderTopRightRadius: 16,
                        borderBottomRightRadius: 16,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        backgroundColor: 'background.paper',
                    },
                }}
            >
                <Box
                    sx={{height: '100%', py: 1}}
                    role="presentation"
                    onClick={() => toggleDrawer(false)}
                    onKeyDown={() => toggleDrawer(false)}
                    display="flex"
                    flex="column"
                >
                    <MobileSideBar/>
                </Box>
            </Drawer>
        </Box>
        <Box sx={{ mt: `calc(${HEADER_CONTENT_HEIGHT}px + env(safe-area-inset-top))` }}>
            {children}
        </Box>

        {/* Диалог подтверждения логаута */}
        <Dialog
            open={logoutDialogOpen}
            onClose={handleLogoutCancel}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ pb: 1 }}>
                Выйти из системы?
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    Вы уверены, что хотите выйти из системы? Все несохраненные данные будут потеряны.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button onClick={handleLogoutCancel} color="inherit">
                    Отмена
                </Button>
                <Button 
                    onClick={handleLogoutConfirm} 
                    variant="contained" 
                    color="error"
                    autoFocus
                >
                    Выйти
                </Button>
            </DialogActions>
        </Dialog>
        </>
    )
}