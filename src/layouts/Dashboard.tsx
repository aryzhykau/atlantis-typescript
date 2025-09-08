import { Box } from "@mui/material";
import OverviewStats from "../features/dashboard/components/OverviewStats";
// import * as React from 'react';
// import { LineChart } from '@mui/x-charts/LineChart';
// import useCalendar from "../features/calendar/hooks/useCalendar.ts";



// const getDaysInMonth=(year: number, month: number): number[] => {
//     const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
//     return Array.from({length: daysInMonth}, (_, index) => index + 1);
// };

export function DashboardLayout() {

  return (
    <Box display={"flex"} flexDirection={"column"} gap={2}>
      <OverviewStats />
    </Box>
  );
}