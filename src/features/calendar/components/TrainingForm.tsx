import React, {useState} from 'react';
import {Formik, Form, Field, FieldArray, getIn} from 'formik';
import * as Yup from 'yup';
import {Select, AutocompleteRenderInputParams, Autocomplete, CheckboxWithLabel} from 'formik-mui';
import {Button, Box, Typography, Divider, IconButton} from '@mui/material';
import TextField from '@mui/material/TextField';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {ITraining, ITrainingClient} from "../models/training.ts";
import {useTrainers} from "../../trainers/hooks/trainerManagementHooks.ts";
import {useTrainingTypes} from "../../trainingTypes/hooks/useTrainingTypes.ts";
import {DesktopDatePicker, DesktopTimePicker} from "formik-mui-x-date-pickers";
import AddIcon from "@mui/icons-material/Add";
import MenuItem from "@mui/material/MenuItem";
import {useClients} from "../../clients/hooks/clientManagementHooks.ts";
import {IClientGet} from "../../clients/models/client.ts";
import {useTrainings} from "../hooks/useTrainings.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";



interface TrainingFormProps {
    initialValues: ITraining;
    onClose: () => void;
    startWeek:  string;
    endWeek:  string;
    trainerId: number | undefined;
}


dayjs.extend(utc);
dayjs.extend(timezone);





const TrainingForm: React.FC<TrainingFormProps> = ({initialValues, onClose, trainerId ,startWeek, endWeek}) => {

    // const {createTraining, refetchTrainings} = useTrainings();
    const {displaySnackbar} = useSnackbar();
    // const {clients} = useClients();
    const {trainers} = useTrainers();
    const {trainingTypes} = useTrainingTypes();
    const {clients} = useClients();
    const [subscriptionRequired, setSubscriptionRequired] = useState(false);
    const {createTraining, refetchTrainings} = useTrainings(trainerId, startWeek, endWeek);

    const TrainingSchema = Yup.object({
        trainer_id: Yup.string().required('Тренер для тренировки не выбран'),
        training_date: Yup.date().required('Date is required'),
        training_time: Yup.date().required('Time is required'),
        clients: Yup.array().of(
            Yup.object().shape({
                client_id: Yup.number().required('Клиент обязателен').test(
                    'requireSubscription',
                    'Тренировка требует подписки, либо наличия пробного занятия, уберите данного клиента'
                    , (value: number) => {
                        if (!value) return true;
                        return !(clients.find(client => client.id === value)?.active_subscription === null && !clients.find(client => client.id === value)?.has_trial && subscriptionRequired);
                    }
                ),
                trial_training: Yup.boolean()
            })

        ).required().min(1, 'Вы должны добавить хотя бы одного клиента').test(
            'unique',
            'Клиенты не должны повторяться',
            (value: ITrainingClient[]): boolean => {
                if (!value) return true;
                const combinedKeys : string[] = value.map((client) => `${client.client_id}-${client.trial_training}`);
                const uniqueKeys = new Set(combinedKeys);
                return combinedKeys.length === uniqueKeys.size
            }),
        training_type_id: Yup.string().required('Тип тренировки не выбран')
    });

    const handleSubmit = async (values: ITraining, {resetForm}: {resetForm: () => void}) => {

        try {
            console.log(values)
            const newValues = {...values, training_date: dayjs(values.training_date).tz(dayjs.tz.guess()).format()}
            await createTraining({trainingData: newValues,}).unwrap();
            displaySnackbar("Тренировка создана успешно", "success");
            refetchTrainings()
            resetForm();
            onClose();
        }
        catch (error: unknown) {
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                "data" in error &&
                "detail" in (error as { data: { detail?: string } }).data
                    ? (error as { data: { detail?: string } }).data.detail ?? "Что то пошло не так"
                    : "Что то пошло не так";

            displaySnackbar(errorMessage, "error");

        }
    };

    const sxFormControl = {
        margin: 2,
        width: '100%',
    };
    const setSubscriptionHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = e.target.value;

        // Находим выбранный тип тренировки
        const selectedTrainingType = trainingTypes.find(
            (type) => type.id === Number(selectedValue)
        );

        // Проверяем поле require_subscription
        if (selectedTrainingType?.require_subscription) {
            setSubscriptionRequired(true); // Выполняем действие, если требуется подписка
        } else {
            setSubscriptionRequired(false); // Иначе убираем отметку
        }
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={TrainingSchema}
            onSubmit={handleSubmit}
        >

            {({values, touched, errors, setFieldValue, isSubmitting}) => (
                <Form>
                    <Box display="flex" flexDirection="column" gap={3} padding={3} borderRadius={2}
                         bgcolor="background.paper">
                        <Typography variant="h6" component="h2" gutterBottom>
                            Добавление тренировки
                        </Typography>
                        <Box display={"flex"}  flexDirection={"column"} gap={2} sx={{width: "100%"}}>
                            <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                                <Field
                                    component={Select}
                                    formControl={{sx: sxFormControl}}
                                    formHelperText = {"Выберите тренера"}
                                    id = "trainer_id"
                                    name = "trainer_id"
                                    label = "Тренер"
                                    variant="outlined"
                                    fullWidth
                                >
                                    {trainers.map((trainer) => (
                                        <MenuItem key={trainer.id} value={trainer.id}>{trainer.first_name} {trainer.last_name}</MenuItem>
                                    ))}
                                </Field>
                                <Field
                                    id="training_type_id"
                                    name="training_type_id"
                                    formControl={{sx: sxFormControl}}
                                    formHelperText = {"Выберите вид тренировки"}
                                    label="Вид тренировки"
                                    component={Select}
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setSubscriptionHandler(e);
                                        setFieldValue("training_type_id", e.target.value).then();
                                    }}

                                >
                                    {trainingTypes.map((trainingType) => (
                                        <MenuItem key={trainingType.id} value={trainingType.id}>{trainingType.title}</MenuItem>
                                    ))}
                                </Field>
                            </Box>
                            <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                                <Field component={DesktopDatePicker} label="Дата" name="training_date"  />
                                <Field component={DesktopTimePicker} label="Время" name="training_time" />
                            </Box>
                            <Divider/>
                            <Box display={"flex"} flexDirection={"column"}>
                                <FieldArray
                                    name="clients"
                                    render={(arrayHelpers) => (
                                        <Box display="flex" flexDirection="column" gap={2}>
                                            <Box display="flex" alignItems="center" gap={2} flexDirection="row">
                                                <Typography variant="subtitle1">Клиенты:</Typography>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => {
                                                        arrayHelpers.push<ITrainingClient>({
                                                         client_id: null,
                                                         trial_training: false,
                                                        })
                                                    }
                                                    }
                                                >
                                                    <AddIcon/>
                                                </IconButton>
                                            </Box>
                                            {/* Цикл для отображения каждого клиента */}
                                            {arrayHelpers.form.values.clients?.map((_: ITrainingClient, index: number) => (
                                                <Box
                                                    key={index}
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    alignItems="center"

                                                >
                                                    <Field
                                                        name={`clients.[${index}].client_id`}
                                                        component={Autocomplete}
                                                        options={subscriptionRequired ? clients.filter(client => (client.active_subscription !== null || client.has_trial)) : clients}
                                                        value={clients.find((client) => client.id === values.clients[index]?.client_id) || null}

                                                        getOptionLabel={(option: IClientGet) => option.first_name + " " + option.last_name}
                                                        style={{ width: 300 }}
                                                        onChange={(_: React.SyntheticEvent, value: IClientGet | null) => {
                                                            setFieldValue(`clients.[${index}].client_id`, value ? value.id : '').then();
                                                            if(value?.has_trial){
                                                                setFieldValue(`clients.[${index}].trial_training`, true).then();
                                                            }
                                                        }}

                                                        renderInput={(params: AutocompleteRenderInputParams) => (
                                                            <TextField
                                                                {...params}
                                                                name={`clients.[${index}].client_id`}
                                                                error={
                                                                    getIn(touched, `clients.${index}.client_id`) &&
                                                                    !!getIn(errors, `clients.${index}.client_id`)
                                                                }
                                                                helperText={
                                                                    getIn(touched, `clients.${index}.client_id`) &&
                                                                    getIn(errors, `clients.${index}.client_id`)
                                                                }

                                                                label="Выбор клиента"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    />


                                                   <Box width={"50%"} display={"flex"} justifyContent={"space-between"}>
                                                       {clients.find(client => client.id === values.clients[index].client_id)?.has_trial ? <Field
                                                            component={CheckboxWithLabel}
                                                            Label={{label: "Пробное занятие?"}}
                                                            type="checkbox"
                                                            name={`clients.[${index}].trial_training`}

                                                        />: <></>}

                                                        {/* Кнопка для удаления клиента */}
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => arrayHelpers.remove(index)}
                                                        >
                                                            <RemoveCircleOutlinedIcon />
                                                        </IconButton>
                                                   </Box>
                                                </Box>
                                            ))}
                                            {typeof errors.clients === 'string'? <Typography color={"error"} variant={"caption"}>{errors.clients}</Typography> : null }
                                        </Box>

                                    )}

                                />


                            </Box>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isSubmitting}
                        >
                            Добавить тренировку
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default TrainingForm;