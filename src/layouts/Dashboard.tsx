import { Box } from "@mui/material";
import { OwnerDashboardDesktop } from "../features/dashboard/components/OwnerDashboardDesktop";

export function DashboardLayout() {
  return (
    <Box display={"flex"} flexDirection={"column"} gap={2} height="100%" minHeight={0}>
      <OwnerDashboardDesktop />
    </Box>
  );
}
