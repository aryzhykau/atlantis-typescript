import {Box, Typography, IconButton, Drawer, } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {useState} from "react";
import {MobileSideBar} from "../components/sideBar/MobileSidebar.tsx";

export function MobileHomeLayout({children}:{children: React.ReactNode}) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = (value: boolean) => setDrawerOpen(value);

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
        </Box>
        <Box>
            {children}
        </Box>

        </>
    )
}