import { Box } from "@mui/system";

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export const StudentTabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`student-tabpanel-${index}`}
            aria-labelledby={`student-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}