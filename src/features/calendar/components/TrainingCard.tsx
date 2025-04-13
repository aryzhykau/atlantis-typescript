import {Box, CircularProgress, Divider, Typography} from "@mui/material";
import {ITrainingGet} from "../models/training.ts";
import { Theme } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import {useGetTrainerQuery} from "../../../store/apis/trainersApi.ts";
import dayjs from "dayjs";
import {useGetTrainingTypeQuery} from "../../../store/apis/trainingTypesApi.ts";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';


const TrainingCard = ({training}:{training: ITrainingGet}) => {

    const {data: trainer, isLoading: isTrainerLoading, isSuccess: isTrainerSuccess} = useGetTrainerQuery(training.trainer_id);
    const {data: trainingType, isLoading: isTrainingTypeLoading, isSuccess: isTrainingTypeSuccess} = useGetTrainingTypeQuery(training.training_type_id, {refetchOnMountOrArgChange: true} );
    const trainingTime = dayjs(training.training_datetime).format("HH:mm");
    const cardStyle = {
        backgroundColor: (theme: Theme) => theme.palette.background.default,
        width: "100%",
        borderRadius: "5px",
        padding: "4px",
        borderLeft:`2px solid ${trainingType?.color}`,
        boxSizing: "border-box",



    }


    return <Box sx={cardStyle}>
        {(isTrainerLoading || isTrainingTypeLoading) && <CircularProgress/>}
        {isTrainerSuccess && isTrainingTypeSuccess && (

                <>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon sx={{color:(theme: Theme) => theme.palette.text.disabled}}/>}
                        sx={{
                            width: "100%",
                            p: 0,
                            backgroundColor: (theme: Theme) => theme.palette.background.default,


                        }}>
                        <Box display={"flex"} flexDirection={"column"} width={"100%"} >
                            <Typography variant={"body1"}>{trainingType.title}</Typography>
                            <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap={2} my={"2px"}>
                                <Typography variant={"body2"} color={"textDisabled"}>Тренер: </Typography>
                                <Typography variant={"body2"}>{trainer.first_name} {trainer.last_name}</Typography>
                            </Box>
                            <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap={2} my={"2px"}>
                                <Typography variant={"body2"} color={"textDisabled"}>Клиентов: </Typography>
                                <Typography variant={"body2"}>{training.clients.length}</Typography>
                                <Typography variant={"body1"} alignSelf={"flex-end"}>{trainingTime}</Typography>
                            </Box>

                        </Box>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            p:0,
                            backgroundColor: (theme: Theme) => theme.palette.background.default,
                        }}
                    >
                        <Box display={"flex"} flexDirection={"column"} justifyContent={"flex-start"}>
                        {training.clients.map((client, index)=> {
                            return (
                                <>
                                    <Box display={"flex"} gap={1} justifyContent={"flex-start"} alignItems={"center"}>
                                        <Typography variant={"body2"}>{client.client.first_name} {client.client.last_name}</Typography>
                                        {dayjs(training.training_datetime).tz(dayjs.tz.guess()).format("DD-MM") == dayjs(client.client.birth_date).tz(dayjs.tz.guess()).format("DD-MM") && <CakeRoundedIcon fontSize={"small"}/>}
                                    </Box>
                                    <Box display={"flex"} gap={1}>
                                        <EmailOutlinedIcon fontSize={"small"} sx={{color: (theme: Theme) => theme.palette.text.disabled}}/>
                                        <Typography variant={"body2"} color={"textDisabled"}>{client.client.email}</Typography>
                                    </Box>
                                    <Box display={"flex"} gap={1}>
                                        <PhoneEnabledIcon fontSize={"small"} sx={{color: (theme: Theme) => theme.palette.text.disabled}}/>
                                        <Typography variant={"body2"} color={"textDisabled"}>{client.client.phone}</Typography>
                                    </Box>
                                    {index !== training.clients.length-1 && <Divider sx={{my: "8px"}} />}
                                </>
                            )
                        })}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </>
        )}

    </Box>
}

export default TrainingCard;