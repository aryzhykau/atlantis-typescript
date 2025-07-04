import {Box, Toolbar, Typography, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button} from "@mui/material";
import {IUser} from "../models/user.ts";
import {MenuItems} from "../globalConstants/mainMenu.tsx";
import {SideBar} from "../components/sideBar/SideBar.tsx";
import {useLocation} from "react-router-dom";
import {IMenuItems} from "../models/mainMenu.ts";
import {Logout} from "@mui/icons-material";
import {useAuth} from "../hooks/useAuth.tsx";
import {useState} from "react";

const sideBarWidth = 240;// Ширина сайдбара
export interface HomeLayoutProps {
    children: React.ReactNode;// Для детей (children)
    data: IUser;                   // Тип для данных
    isLoading: boolean;          // Тип для флага загрузки
}



export default function HomeLayout({ children,  data, isLoading }: HomeLayoutProps) {
    const location = useLocation();
    const { doLogout } = useAuth();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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

    return (
        <>
            <Box sx={{
                display: "grid",
                gridTemplateColumns: `${sideBarWidth}px 1fr`,
                gridTemplateRows: "64px 1fr",
                height: "100vh",
                p: "16px",
                columnGap: 1,
            }}>
                {/* Хедер */}
                <Paper  elevation={0} sx={{gridColumn: "2", gridRow: "1"}}>
                    <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                        <Typography variant="h6" noWrap component="div">
                            {getHeaderTitle()}
                        </Typography>

                        {!isLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant={"h6"}>{`${data.first_name} ${data.last_name}`}</Typography>
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
                        )}
                    </Toolbar>
                </Paper>
                {/* Сайдбар */}
                <SideBar width={sideBarWidth}/>


                {/* Основной контент */}
                <Box sx={{gridColumn: "2", gridRow: "2", p: 3 , overflow: "auto"}}>
                    {children}
                </Box>
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
    );
}