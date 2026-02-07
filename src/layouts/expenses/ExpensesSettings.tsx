import {Box} from "@mui/material";
import {UnifiedExpenseTypesDataView} from "../../features/expenses/components/UnifiedExpenseTypesDataView";
import {UnifiedExpensesDataView} from "../../features/expenses/components/UnifiedExpensesDataView";

export function ExpensesSettings() {
    return (
        <Box display={"flex"} flexDirection={"column"} sx={{ p: 3, gap: 3 }}>
           <UnifiedExpensesDataView />
           <UnifiedExpenseTypesDataView />
        </Box>
    )
}
