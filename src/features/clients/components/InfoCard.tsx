import { Box, Card, CardContent, Typography, Divider, Grid, Paper, Theme } from "@mui/material";
import { Children, ReactNode } from "react";

// Интерфейс для элемента данных карточки
export interface IInfoCardItem {
    icon?: ReactNode;
    label: string;
    value: ReactNode | string | number | null;
    valueColor?: string;
    width?: string | number;
    fullWidth?: boolean;
}

// Интерфейс пропсов компонента
export interface InfoCardProps {
    children?: ReactNode;
    title: string;
    items: IInfoCardItem[];
    gridSize?: {
        xs: number;
        md: number;
    };
    height?: string;
}

export const InfoCard = ({ children, title, items, gridSize = { xs: 12, md: 4 }, height }: InfoCardProps) => {
    return (
       
            <Paper elevation={3} sx={{ height: height || "100%" }}>
                <Card sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {title}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {items.map((item, index) => (
                                <Box key={index} sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                                    {item.icon && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                            {item.icon}
                                        </Box>
                                    )}
                                    <Box sx={{ minWidth: item.icon ? '30%' : '35%', maxWidth: item.icon ? '35%' : '40%', flexShrink: 0 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.label}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1, wordBreak: 'break-word', textAlign: 'left' }}>
                                        <Typography 
                                            variant="body1" 
                                            color={item.valueColor || "text.primary"}
                                        >
                                            {item.value !== null && item.value !== undefined ? item.value : "Не указано"}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                          </Box>
                          <Divider />
                          {children}
                        </Box>
                    </CardContent>
                </Card>
            </Paper>
        
    );
}; 