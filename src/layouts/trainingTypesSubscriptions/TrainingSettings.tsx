import {Box} from "@mui/material";
import {TrainingTypesDataView} from "../../features/trainingTypes/components/TrainingTypesDataView.tsx";
import {SubscriptionsDataView} from "../../features/subscriptions/components/SubscriptionsDataView.tsx";


export function TrainingSettings() {

    return (
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"flex-start"}>
            <TrainingTypesDataView />
            <SubscriptionsDataView />
        </Box>
    )
}