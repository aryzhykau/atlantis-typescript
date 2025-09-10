import React from 'react';
import { Box, Typography } from '@mui/material';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { IStudentSubscriptionView } from '../../subscriptions/models/subscription';
import { createEnhancedStudentSubscriptionColumns } from '../tables/enhancedStudentSubscriptionColumns';

interface StudentSubscriptionsTableProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading: boolean;
}

export const StudentSubscriptionsTable: React.FC<StudentSubscriptionsTableProps> = ({ subscriptions, isLoading }) => {
    const columns = createEnhancedStudentSubscriptionColumns({});

    if (!subscriptions || subscriptions.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                    История абонементов пуста
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    У студента пока нет абонементов
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                История абонементов ({subscriptions.length})
            </Typography>
            
            <UnifiedDataGrid
                rows={subscriptions}
                columns={columns}
                loading={isLoading}
                entityType="subscriptions"
                pageSizeOptions={[10, 25, 50]}
                initialPageSize={10}
                variant="elevated"
                ariaLabel="Таблица истории абонементов студента"
                height="auto"
            />
        </Box>
    );
}; 