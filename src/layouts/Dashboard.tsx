import { Box } from "@mui/material";
import { OwnerDashboardDesktop } from "../features/dashboard/components/OwnerDashboardDesktop";

export function DashboardLayout() {
  return (
    <Box display={"flex"} flexDirection={"column"} gap={2}>
      <OwnerDashboardDesktop />
    </Box>
  );
}
