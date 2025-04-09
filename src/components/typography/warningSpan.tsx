import {Typography} from "@mui/material";

export function WarningSpan({children}: { children: React.ReactNode }) {
    return <Typography component="span" sx={{ textTransform: "uppercase",color: (theme) => theme.palette.error.main, fontWeight: 900}}>{children}</Typography>;
}