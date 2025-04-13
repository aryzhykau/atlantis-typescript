import {Box} from "@mui/material";

const TrainingTypeColorCircle = ({circleColor}:{circleColor: string}) => {
    return (
        <Box sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: circleColor,
        }}/>
    )
}
export default TrainingTypeColorCircle;