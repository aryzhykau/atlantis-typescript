import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Grid } from '@mui/material';
import { Person } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { parsePhoneNumber } from 'libphonenumber-js';
import { FormikDialog, FormikTextField, FormikDatePicker, FormikTelInput, FormActions } from '../../../components/forms';
import { useFormSubmission } from '../../../hooks/forms';
import { adminSchemas } from '../../../utils/validationSchemas';
import { useCreateAdminMutation, useUpdateAdminMutation } from '../../../store/apis/adminManagementApi';
import { IAdminResponse, IAdminCreatePayload, IAdminUpdatePayload } from '../models/admin';

interface AdminFormValues {
  first_name: string;
  last_name: string;
  date_of_birth: Dayjs | null;
  email: string;
  phone: string;
}

interface AdminFormProps {
  open: boolean;
  onClose: () => void;
  admin?: IAdminResponse | null;
}

const AdminForm: React.FC<AdminFormProps> = ({ open, onClose, admin }) => {
  const [createAdmin] = useCreateAdminMutation();
  const [updateAdmin] = useUpdateAdminMutation();

  const isEditing = Boolean(admin);
  
  // Form submission hook
  const { submit, isLoading } = useFormSubmission({
    successMessage: isEditing 
      ? 'Администратор успешно обновлен' 
      : 'Администратор успешно создан',
    onSuccess: onClose
  });

  const initialValues: AdminFormValues = {
    first_name: admin?.first_name || '',
    last_name: admin?.last_name || '',
    date_of_birth: admin?.date_of_birth ? dayjs(admin.date_of_birth) : null,
    email: admin?.email || '',
    phone: admin && admin.phone_country_code && admin.phone_number 
      ? `${admin.phone_country_code.startsWith('+') ? admin.phone_country_code : '+' + admin.phone_country_code}${admin.phone_number}` 
      : '',
  };

  const handleSubmit = async (values: AdminFormValues) => {
    await submit(async () => {
      const phoneInfo = values.phone ? parsePhoneNumber(values.phone) : null;
      
      if (isEditing && admin) {
        const updatePayload: IAdminUpdatePayload = {
          first_name: values.first_name,
          last_name: values.last_name,
          date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
          email: values.email,
          phone_country_code: phoneInfo?.countryCallingCode ? `+${phoneInfo.countryCallingCode}` : undefined,
          phone_number: phoneInfo?.nationalNumber || undefined,
        };
        await updateAdmin({ adminId: admin.id, adminData: updatePayload }).unwrap();
      } else {
        const createPayload: IAdminCreatePayload = {
          first_name: values.first_name,
          last_name: values.last_name,
          date_of_birth: values.date_of_birth?.format('YYYY-MM-DD') || '',
          email: values.email,
          phone_country_code: phoneInfo?.countryCallingCode ? `+${phoneInfo.countryCallingCode}` : '',
          phone_number: phoneInfo?.nationalNumber || '',
        };
        await createAdmin(createPayload).unwrap();
      }
    });
  };

  return (
    <FormikDialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Редактировать администратора' : 'Создать администратора'}
      subtitle={isEditing ? 'Обновите информацию об администраторе' : 'Добавьте нового администратора в систему'}
      icon={<Person />}
      maxWidth="md"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={isEditing ? adminSchemas.update : adminSchemas.create}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {() => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Основная информация */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormikTextField 
                    name="first_name" 
                    label="Имя" 
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormikTextField 
                    name="last_name" 
                    label="Фамилия" 
                    required 
                  />
                </Grid>
              </Grid>

              {/* Контактная информация */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormikTextField 
                    name="email" 
                    label="Email" 
                    type="email"
                    required 
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormikDatePicker 
                    name="date_of_birth" 
                    label="Дата рождения"
                  />
                </Grid>
              </Grid>

              {/* Телефон */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormikTelInput 
                    name="phone" 
                    label="Номер телефона" 
                    required 
                    defaultCountry="SK"
                  />
                </Grid>
              </Grid>

              <FormActions
                submitText={isEditing ? "Обновить" : "Создать"}
                isSubmitting={isLoading}
                onCancel={onClose}
                showCancel={false}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </FormikDialog>
  );
};

export { AdminForm };
export default AdminForm;
