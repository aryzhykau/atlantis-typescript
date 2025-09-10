import {Box} from "@mui/material";
import {UnifiedTrainingTypesDataView} from "../../features/trainingTypes/components/UnifiedTrainingTypesDataView";
import {UnifiedSubscriptionsDataView} from "../../features/subscriptions/components/UnifiedSubscriptionsDataView";


export function TrainingSettings() {

    return (
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"flex-start"} sx={{ p: 3, gap: 3 }}>
            <UnifiedTrainingTypesDataView />
            <UnifiedSubscriptionsDataView />
        </Box>
    )
}