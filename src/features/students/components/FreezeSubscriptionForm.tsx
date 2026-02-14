import React from 'react';
import { Formik, Form } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import { Grid, Typography } from '@mui/material';
import { studentSchemas } from '../../../utils/validationSchemas';

// Form Components
import { FormikNumberField, FormikDatePicker } from '../../../components/forms/fields';
import { FormikDialog } from '../../../components/forms/layout';
import { FormActions } from '../../../components/forms/layout';
import { MobileFormBottomSheet } from '../../../components/mobile-kit';

interface FreezeSubscriptionFormValues {
    freeze_start_date: Dayjs | null;
    freeze_duration_days: number;
}

interface FreezeSubscriptionFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: FreezeSubscriptionFormValues) => void;
    isLoading?: boolean;
    activeSubscriptionName?: string;
    activeSubscriptionEndDate?: string;
    useBottomSheetVariant?: boolean;
}

export const FreezeSubscriptionForm: React.FC<FreezeSubscriptionFormProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    activeSubscriptionName,
    activeSubscriptionEndDate,
    useBottomSheetVariant = false,
}) => {
    const formBody = (
        <Formik<FreezeSubscriptionFormValues>
            initialValues={{
                freeze_start_date: dayjs().add(1, 'day'),
                freeze_duration_days: 7,
            }}
            validationSchema={studentSchemas.freezeSubscription}
            onSubmit={onSubmit}
            enableReinitialize
        >
            {({ isSubmitting }) => (
                <Form>
                    <Grid container spacing={3}>
                        {activeSubscriptionName && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Абонемент: <strong>{activeSubscriptionName}</strong>
                                </Typography>
                                {activeSubscriptionEndDate && (
                                    <Typography variant="body2" color="text.secondary">
                                        Действителен до: {activeSubscriptionEndDate}
                                    </Typography>
                                )}
                            </Grid>
                        )}
                        
                        <Grid item xs={12}>
                            <FormikDatePicker
                                name="freeze_start_date"
                                label="Дата начала заморозки"
                                minDate={dayjs()}
                                views={['year', 'month', 'day']}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormikNumberField
                                name="freeze_duration_days"
                                label="Количество дней заморозки"
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormActions
                                submitText="Заморозить"
                                isSubmitting={isSubmitting || isLoading}
                                onCancel={onClose}
                            />
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    );

    if (useBottomSheetVariant) {
        return (
            <MobileFormBottomSheet
                open={open}
                onClose={onClose}
                title="❄️ Заморозить абонемент"
            >
                {formBody}
            </MobileFormBottomSheet>
        );
    }

    return (
        <FormikDialog
            open={open}
            onClose={onClose}
            title="❄️ Заморозить абонемент"
            maxWidth="sm"
        >
            {formBody}
        </FormikDialog>
    );
}; 