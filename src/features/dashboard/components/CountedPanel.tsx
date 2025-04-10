import {Box, Typography} from "@mui/material";

interface ICountedPanelProps {
    headerLines: string[];
    data: number
}

const CountedPanel = ({headerLines, data}: ICountedPanelProps) => {
    const headerStyle = {
        color: (theme: { palette: { text: { secondary: string; }; }; }) => theme.palette.text.secondary,
    };

    return <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        sx = {{backgroundColor: theme => theme.palette.background.paper}}
        borderRadius={2}
        width={"150px"}
        height={"150px"}
        p={"16px"}
    >
        {headerLines.map((line) => {
            return (<Typography variant={"body2"} sx={headerStyle}>{line}</Typography>)
        })}
        <Typography variant={"h1"}>{data}</Typography>
    </Box>

}

export default CountedPanel;