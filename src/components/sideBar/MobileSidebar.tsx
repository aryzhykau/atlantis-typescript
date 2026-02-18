import {Box, List, ListItem, ListItemButton, ListItemIcon, Typography, Badge, alpha, useTheme} from "@mui/material";
import {MenuItems} from "../../globalConstants/mainMenu.tsx";
import {Link} from "react-router-dom";
import {IMenuItems} from "../../models/mainMenu.ts";
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {useCurrentUser} from "../../hooks/usePermissions";
import {getFilteredMenuItemsForContext as getFilteredMenuItems} from "../../utils/menuUtils";
import { useListClientContactsQuery } from '../../store/apis/clientContactsApi';
import { useGradients } from "../../features/trainer-mobile/hooks/useGradients";

export function MobileSideBar() {
    const theme = useTheme();
    const gradients = useGradients();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const filteredMenuItems = getFilteredMenuItems(MenuItems, currentUser?.user?.role, true);
    const { data: pendingContacts } = useListClientContactsQuery({ status: 'PENDING', limit: 100 });
    const pendingCount = (pendingContacts || []).length;
    
    const [selectedIndex, setSelectedIndex] = useState(() => {
        return filteredMenuItems.findIndex((item) => item.link === location.pathname.split("/")[2]);
    });

    const handleListItemClick = (
        index: number,
    ) => {
        setSelectedIndex(index);
    };

    useEffect(() => {
        const nextIndex = filteredMenuItems.findIndex((item) => item.link === location.pathname.split("/")[2]);
        setSelectedIndex(nextIndex);
    }, [location.pathname, filteredMenuItems]);

    return <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: '100%' }}>
            <Box
                sx={{
                    px: 2,
                    pt: 2,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant={"h6"} sx={{fontWeight: 800, lineHeight: 1.2}}>Навигация</Typography>
                <Typography variant={"caption"} color="text.secondary">Разделы Atlantis</Typography>
            </Box>

            <List sx={{ m: 0, p: 1.5, pt: 1, width: '100%' }}>
                {filteredMenuItems.map((item: IMenuItems, idx: number) =>

                    <ListItem key={item.link} sx={{ width: "100%", p: 0, mb: 0.75 }}>
                        <ListItemButton
                            sx={{
                                minHeight: 56,
                                width: '100%',
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                color: 'text.primary',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                },
                                '&.Mui-selected': {
                                    background: gradients.primary,
                                    color: 'common.white',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? `0 6px 14px ${alpha(theme.palette.common.black, 0.35)}`
                                        : `0 8px 16px ${alpha(theme.palette.primary.main, 0.28)}`,
                                    '&:hover': {
                                        background: gradients.primary,
                                    }
                                },
                            }}
                            key={item.link}
                            component={Link}
                            to={`/home/${item.link}`}
                            selected={selectedIndex===idx}
                            onClick={() => handleListItemClick( idx)}
                        >
                            <ListItemIcon sx={{color: "inherit", minWidth: 38}}>
                                {item.link === 'client-contacts' ? (
                                    <Badge
                                        badgeContent={pendingCount > 0 ? pendingCount : undefined}
                                        color="error"
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    >
                                        {item.icon}
                                    </Badge>
                                ) : (
                                    item.icon
                                )}
                            </ListItemIcon>
                            <Typography variant={"body2"} sx={{ fontWeight: selectedIndex === idx ? 700 : 600 }}>
                                {item.title}
                            </Typography>
                        </ListItemButton>
                    </ListItem>

                )}
            </List>
    </Box>;
}