import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useGradients } from "../../../../trainer-mobile/hooks/useGradients";
import { InfoCardST, InfoIconBoxST, InfolabelST } from "../../../styles/styles";

export interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'info';
    children?: React.ReactNode;
}

export const StudentInfoItem: React.FC<InfoItemProps> = ({ icon, label, value, color = 'primary', children }) => {
    const theme = useTheme();
    const gradients = useGradients();
    
    return (
        <Box sx={{ mb: 3 }}>
             <Paper elevation={0} sx={InfoCardST(theme, color)}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={InfoIconBoxST(gradients, color)}>
                    {icon}
                </Box>
                <Typography variant="caption" sx={InfolabelST}>
                    {label}
                </Typography>
            </Box>
            <Box sx={{ pl: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    {typeof value === 'string' ? (
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500,
                                color: value === 'Не указан' || value === 'Не указана' 
                                    ? 'text.secondary' 
                                    : 'text.primary'
                            }}
                        >
                            {value}
                        </Typography>
                    ) : (
                        value
                    )}
                </Box>
                {children && (
                    <Box sx={{ ml: 2 }}>
                        {children}
                    </Box>
                )}
            </Box>
        </Paper>
        </Box>
    );
};