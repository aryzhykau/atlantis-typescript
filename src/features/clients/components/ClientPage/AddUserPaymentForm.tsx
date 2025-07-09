import { Button } from "@mui/material";
import { Box, Divider, IconButton, Typography   } from "@mui/material";
import { Formik } from "formik";
import { Form , Field} from "formik";
import { useSnackbar } from "../../../../hooks/useSnackBar";
import { useCreatePaymentMutation } from "../../../../store/apis/paymentsApi";
import { IPayment } from "../../../payments/models/payment";
import * as Yup from "yup";
import { TextField } from "formik-mui";
import CloseIcon from "@mui/icons-material/Close";

interface AddPaymentFormProps {
  initialValues: IPayment;
  client_name: string;
  onClose: () => void;
}



const PaymentSchema = Yup.object({
  description: Yup.string(),
  amount: Yup.number().required('Amount is required').min(1, 'Amount must be greater than 0'),
});

export const AddUserPaymentForm = ({initialValues, client_name, onClose }: AddPaymentFormProps) => {

    const [createPayment] = useCreatePaymentMutation();
    const {displaySnackbar} = useSnackbar();

    const handleSubmit = async (values: IPayment) => {
      try {
        await createPayment({paymentData: values}).unwrap();
        displaySnackbar("Платеж успешно добавлен", "success");
        onClose();
      } catch (error) {
        displaySnackbar("Ошибка при добавлении платежа", "error");
      }
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={PaymentSchema}
            onSubmit={handleSubmit}
        >
            <Form>
              <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
                <Box sx={{display: "flex", flexDirection: "row", gap: 2, alignItems: "center", justifyContent: "space-between"}}>
                    <Typography variant="h6">Добавить платеж клиенту {client_name}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                    <Field
                      component={TextField}
                        name="description"
                        label="Примечание (необязательно)"
                    />
                    <Field
                        component={TextField}
                        type="number"
                        name="amount"
                        label="Сумма платежа"
                    />
                    <Box sx={{display: "flex", flexDirection: "row", gap: 2, justifyContent: "flex-end"}}>
                    <Button type="submit" variant="contained" color="primary">
                        Добавить платеж
                    </Button>
                </Box>
                </Box>
                
              </Box>
            </Form>
        </Formik>
    )
}

