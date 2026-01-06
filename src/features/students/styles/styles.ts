import { alpha } from "@mui/system";
import { Gradients } from "../../trainer-mobile/hooks/useGradients";
import { Theme } from "@mui/material";

export const headerContainerST = (gradients: Gradients) => {
    return {
        borderRadius: 3,
        background: gradients.primary,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
        }
    }
} 

export const StatsCardST = (theme: Theme) => {
    return {
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha('#ffffff', 0.2),
        background: alpha('#ffffff', 0.1),
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
        }
    }
}

export const HeaderButtonST = (theme: Theme) => {
    return { 
        background: 'white',
        color: theme.palette.primary.main,
        fontWeight: 600,
        textTransform: 'none',
        px: 3,
        '&:hover': {
            background: alpha('#ffffff', 0.9),
        }
    }
}

export const EditButtonST = () => {
    return { 
        color: 'white',
        background: alpha('#ffffff', 0.1),
        '&:hover': {
            background: alpha('#ffffff', 0.2),
        }
    }
}

export const GoBackButtonST = () => {
    return { 
        color: 'white',
        mr: 2,
        '&:hover': {
            background: alpha('#ffffff', 0.1),
        }
    }
}

export const TabsST = (theme: Theme, gradients: Gradients) => {
    return {
        '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
        },
        '& .Mui-selected': {
            color: theme.palette.primary.main,
        },
        '& .MuiTabs-indicator': {
            background: gradients.primary,
            height: 3,
        }
    }
}

export const InfoCardST = (theme: Theme, color: 'primary' | 'success' | 'warning' | 'info') => {
    return {
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: theme.palette.background.paper,
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: alpha(theme.palette[color].main, 0.3),
            background: alpha(theme.palette[color].main, 0.02),
        }
    }
}

export const InfoIconBoxST = (gradients: Gradients, color: 'primary' | 'success' | 'warning' | 'info') => {
    return {
            p: 1,
            borderRadius: 2,
            background: gradients[color],
            color: 'white',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 40,
            height: 40,
        }
}

export const InfolabelST = () => {
    return { 
        color: 'text.secondary',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: 0.5
        }
}

export const SubscriptionHeaderST = (gradients: Gradients,) => {
    return {
        p: 3,
        background: gradients.primary,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
        }
    }
}

export const SubscriptionCardST = (theme: Theme) => {
    return {
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        background: theme.palette.background.paper,
    }
}
