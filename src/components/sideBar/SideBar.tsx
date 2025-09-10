import {Box, List, ListItem, ListItemButton, ListItemIcon, Paper, Typography, useTheme, alpha, IconButton, Tooltip} from "@mui/material";
import {MenuItems} from "../../globalConstants/mainMenu.tsx";
import {Link} from "react-router-dom";
import {IMenuItems} from "../../models/mainMenu.ts";
import {useState} from "react";
import {useLocation} from "react-router-dom";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import {useCurrentUser} from "../../hooks/usePermissions";
import {getFilteredMenuItems} from "../../utils/menuUtils";

interface SideBarProps {
    width: number;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export function SideBar({width, isCollapsed = false, onToggle}: SideBarProps) {
    const theme = useTheme();
    const location = useLocation();
    const { user } = useCurrentUser();
    const filteredMenuItems = getFilteredMenuItems(MenuItems, user?.role);
    
    const [selectedIndex, setSelectedIndex] = useState(() => {
        return filteredMenuItems.findIndex((item) => item.link === location.pathname.split("/")[2]);
    });

    // Градиенты в стиле дизайн-системы тренеров
    const gradients = {
        primary: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #8e44ad 0%, #6c5ce7 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        success: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    };

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
            background: theme.palette.background.paper,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease-in-out',
            position: 'relative',
        }}
    >
        {/* Кнопка сворачивания/разворачивания на границе сайдбара */}
        {onToggle && (
            <IconButton
                onClick={onToggle}
                sx={{
                    position: 'absolute',
                    top: 20,
                    right: -16,
                    zIndex: 10,
                    color: 'white',
                    background: gradients.primary,
                    border: '2px solid',
                    borderColor: theme.palette.background.paper,
                    '&:hover': {
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, #6c5ce7 0%, #8e44ad 100%)'
                            : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(142, 68, 173, 0.4)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    width: 32,
                    height: 32,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
            >
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
        )}

        {/* Градиентный заголовок в стиле дизайн-системы тренеров */}
        <Box sx={{ 
            p: isCollapsed ? 2 : 3, 
            background: gradients.primary,
            borderRadius: '0 10px 24px 0',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            mb: 2,
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3,
            }
        }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {!isCollapsed ? (
                    <>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700, 
                                mb: 1, 
                                display: 'flex', 
                                alignItems: 'center',
                                fontSize: '1.75rem',
                            }}
                        >
                            🏊‍♂️ ATLANTIS
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                opacity: 0.9, 
                                fontWeight: 300,
                                fontSize: '0.875rem',
                            }}
                        >
                            Swimming academy
                        </Typography>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                            }}
                        >
                            🏊‍♂️
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>

        {/* Навигационное меню */}
        <Box sx={{ flex: 1, px: isCollapsed ? 1 : 2 }}>
            <List sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "flex-start", 
                m: 0, 
                py: 1,
                width: "100%"
            }}>
                {filteredMenuItems.map((item: IMenuItems, idx: number) => (
                    <ListItem 
                        key={item.link} 
                        sx={{ 
                            display: "flex", 
                            justifyContent: "flex-start", 
                            width: "100%", 
                            p: 0,
                            mb: 0.5,
                        }}
                    >
                        <Tooltip 
                            title={isCollapsed ? item.title : ""} 
                            placement="right"
                            disableHoverListener={!isCollapsed}
                        >
                            <ListItemButton
                                sx={{
                                    py: isCollapsed ? 1.5 : 2,
                                    px: isCollapsed ? 1 : 2,
                                    width: "100%",
                                    justifyContent: isCollapsed ? "center" : "flex-start",
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease-in-out',
                                    background: selectedIndex === idx 
                                        ? gradients.primary 
                                        : 'transparent',
                                    color: selectedIndex === idx 
                                        ? 'white' 
                                        : theme.palette.text.primary,
                                    '&:hover': {
                                        background: selectedIndex === idx 
                                            ? gradients.primary 
                                            : alpha(theme.palette.primary.main, 0.08),
                                        transform: isCollapsed ? 'scale(1.05)' : 'translateX(4px)',
                                        boxShadow: selectedIndex === idx 
                                            ? '0 4px 12px rgba(142, 68, 173, 0.3)' 
                                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    },
                                    '&.Mui-selected': {
                                        background: gradients.primary,
                                        color: 'white',
                                        '&:hover': {
                                            background: gradients.primary,
                                        }
                                    },
                                }}
                                key={item.link}
                                component={Link}
                                to={`/home/${item.link}`}
                                selected={selectedIndex === idx}
                                onClick={() => handleListItemClick(idx)}
                            >
                                <Box 
                                    display="flex" 
                                    justifyContent={isCollapsed ? "center" : "space-between"} 
                                    alignItems="center"
                                    sx={{ width: '100%' }}
                                >
                                    {!isCollapsed && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ListItemIcon 
                                                sx={{
                                                    color: "inherit",
                                                    minWidth: 40,
                                                    mr: 2,
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: selectedIndex === idx ? 600 : 500,
                                                    fontSize: '0.95rem',
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                        </Box>
                                    )}
                                    {isCollapsed && (
                                        <ListItemIcon 
                                            sx={{
                                                color: "inherit",
                                                minWidth: 'auto',
                                                mr: 0,
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                    )}
                                </Box>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
        </Box>
    </Paper>;
}