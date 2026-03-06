import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { UnifiedInvoicesDataView } from "../../features/invoices/components/UnifiedInvoicesDataView";
import { UnifiedPaymentHistoryDataGrid } from "../../features/payments/components/UnifiedPaymentHistoryDataGrid";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    const isActive = value === index;

    return (
        <Box
            component="div"
            role="tabpanel"
            id={`payment-tabpanel-${index}`}
            aria-labelledby={`payment-tab-${index}`}
            aria-hidden={!isActive}
            sx={{
                flex: 1,
                minHeight: 0,
                display: isActive ? 'flex' : 'none',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
            {...other}
        >
            {isActive && (
                <Box sx={{ p: 3, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {children}
                </Box>
            )}
        </Box>
    );
}

const InvoicesPayments: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="payment tabs">
                    <Tab label="Инвойсы" id="payment-tab-0" aria-controls="payment-tabpanel-0" />
                    <Tab label="История транзакций" id="payment-tab-1" aria-controls="payment-tabpanel-1" />
                </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
                <UnifiedInvoicesDataView />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <UnifiedPaymentHistoryDataGrid />
            </TabPanel>
        </Box>
    );
};

export default InvoicesPayments;