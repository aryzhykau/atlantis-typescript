import {Box, List, ListItem, ListItemButton, ListItemIcon, Paper, Toolbar, Typography} from "@mui/material";
import {MenuItems} from "../../globalConstants/mainMenu.tsx";
import {Link} from "react-router-dom";
import {IMenuItems} from "../../models/mainMenu.ts";
import {useState} from "react";
import {useLocation} from "react-router-dom";

interface SideBarProps {
    width: number;
}

export function SideBar({width}: SideBarProps) {
    const location = useLocation();
    const [selectedIndex, setSelectedIndex] = useState(() => {
        return MenuItems.findIndex((item) => item.link === location.pathname.split("/")[2]);
    });

    const handleListItemClick = (
        index: number,
    ) => {
        setSelectedIndex(index);
    };

    return <Paper
        elevation={0}
        sx={{
            gridColumn: "1",
            gridRow: "1 / span 2",
            width: width,
            flexShrink: 0,
            py: "16px",
        }}
    >
        <Toolbar sx={{display: "flex", flexDirection: "column", width:"100%", p:0, "@media (min-width:600px)": {
            p: 0,  // Добавляем паддинг для экранов больше 600px
        }}}>
            <Typography variant={"h2"}>ATLANTIS</Typography>
            <Typography variant={"subtitle1"}>Swimming school</Typography>
            <List sx={{ display:"flex", flexDirection: "column", alignItems: "flex-start", m: 0, "@media (min-width:600px)":{py: "36px",width:"100%"}}}>
                {MenuItems.map((item: IMenuItems, idx: number) =>

                        <ListItem key={item.link} sx={{ display: "flex", justifyContent: "flex-start", width:"100%", p:0}}>
                            <ListItemButton
                                sx={
                                {
                                    "@media (min-width:600px)":{
                                        py:"16px",
                                        width: "100%",
                                        justifyContent: "flex-start"
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main', // Цвет фона для выбранной кнопки
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.main',  // Цвет фона при наведении
                                        }// Цвет текста для выбранной кнопки
                                    },

                                }}
                                key={item.link}
                                component={Link}
                                to={`/home/${item.link}`}
                                selected={selectedIndex===idx}
                                divider={true}
                                onClick={() => handleListItemClick( idx)}
                            >
                                <Box display={"flex"} justifyContent={"space-between"}>
                                    <ListItemIcon sx={{color: "inherit"}}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <Typography variant={"button"}>{item.title}</Typography>
                                </Box>
                            </ListItemButton>
                        </ListItem>

                )}
            </List>
        </Toolbar>
    </Paper>;
}