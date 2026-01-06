import { Grid, Paper, Typography, useTheme } from "@mui/material"
import { SvgIconComponent } from '@mui/icons-material';
import { StatsCardST } from "../styles/styles";

export type StatsCardType = {
    icon: SvgIconComponent;
    value: number;
    description: string;
}

export const StatsCard = ({icon: Icon, value, description}: StatsCardType) => {
    const theme = useTheme();
    
    return (
    <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={0}sx={StatsCardST(theme)}>
            <Icon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {description}
            </Typography>
        </Paper>
    </Grid>
    )
}