import {Box, List, ListItem, ListItemButton, ListItemIcon,  Typography} from "@mui/material";
import {MenuItems} from "../../globalConstants/mainMenu.tsx";
import {Link} from "react-router-dom";
import {IMenuItems} from "../../models/mainMenu.ts";
import {useState} from "react";
import {useLocation} from "react-router-dom";
import {useCurrentUser} from "../../hooks/usePermissions";
import {getFilteredMenuItems} from "../../utils/menuUtils";

export function MobileSideBar() {
    const location = useLocation();
    const currentUser = useCurrentUser();
    const filteredMenuItems = getFilteredMenuItems(MenuItems, currentUser?.user?.role);
    
    const [selectedIndex, setSelectedIndex] = useState(() => {
        return filteredMenuItems.findIndex((item) => item.link === location.pathname.split("/")[2]);
    });

    const handleListItemClick = (
        index: number,
    ) => {
        setSelectedIndex(index);
    };

    return <Box sx={{ display: "flex", flexDirection: "column", width:"100%", alignItems: "center"}}>
            <Typography variant={"h4"} py="15px">Меню</Typography>

            <List sx={{m: 0, "@media (min-width:600px)":{py: "36px",width:"100%"}}}>
                {filteredMenuItems.map((item: IMenuItems, idx: number) =>

                    <ListItem key={item.link} sx={{ width:"100%", p:0}}>
                        <ListItemButton
                            sx={
                                {
                                    height: "64px",
                                    "@media (min-width:600px)":{
                                        py:"16px",
                                        width: "100%",
                                        justifyContent: "center"
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
                            <ListItemIcon sx={{color: "inherit"}}>
                                {item.icon}
                            </ListItemIcon>
                            <Typography variant={"button"}>{item.title}</Typography>
                        </ListItemButton>
                    </ListItem>

                )}
            </List>
    </Box>;
}