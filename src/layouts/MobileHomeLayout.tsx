import {Box, Typography, IconButton, Drawer, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, useTheme} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {Logout, LightMode as LightModeIcon, DarkMode as DarkModeIcon} from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeModeProvider';
import {useState} from "react";
import {MobileSideBar} from "../components/sideBar/MobileSidebar.tsx";
import {useAuth} from "../hooks/useAuth.tsx";

export function MobileHomeLayout({children}:{children: React.ReactNode}) {
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
                position: "relative",
                top: 0,
                pt: "env(safe-area-inset-top)",
                px: "env(safe-area-inset-left)",
                height: 80,
                width: "100%",

            }}
        >
            <Typography variant="h5" component="h1" align="center" sx={{fontSize: '1.5rem'}}>
                ATLANTIS
            </Typography>
            <Typography variant="body2" align="center" sx={{fontSize: '1rem'}}>
                Swimming School
            </Typography>
            <Box sx={{position: 'absolute', top: 20, left: 20}}>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => toggleDrawer(true)}>
                    <MenuIcon/>
                </IconButton>
                <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
                    <Box
                        sx={{width: 250, py: 3}}
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
            <Box sx={{position: 'absolute', top: 20, right: 20}}>
                <Box sx={{display: 'flex', gap: 1}}>
                    <Tooltip title="Переключить тему">
                        <IconButton onClick={() => toggleMode?.()}>
                            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        color="inherit"
                        onClick={handleLogoutClick}
                        sx={{ 
                            color: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.light + 20',
                            }
                        }}
                    >
                        <Logout />
                    </IconButton>
                </Box>
            </Box>
        </Box>
        <Box>
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