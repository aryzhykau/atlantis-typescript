import {GridRenderCellParams} from "@mui/x-data-grid";
import {useState} from "react";
import {Box, IconButton, Modal, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {ClientSubscriptionForm} from "./ClientSubscriptionForm.tsx";
import dayjs, {Dayjs} from "dayjs";


const SubscriptionsCell = ({params} : {params: GridRenderCellParams}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const handleOpen = () => setModalOpen(true);

    const handleModalClose = () => setModalOpen(false);

    const style = {
        position: "absolute",
        width: "35%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        p: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    };



    return <>
        <Box display={"flex"} justifyContent={"center"} alignItems={"center"} overflow={"scroll"}>
    { !params.row.active_subscription ? <IconButton onClick={handleOpen}>
        <AddIcon/>
    </IconButton> : <Typography variant={"body2"}>Абонемент {params.row.active_subscription.subscription.title} до {dayjs(params.row.active_subscription.end_date).format("DD.MM.YYYY")}</Typography>

    }
        </Box>
            <Modal open={modalOpen} onClose={handleModalClose}>
                <Box sx={style}>
                    <ClientSubscriptionForm client={params.row} onClose={handleModalClose} ></ClientSubscriptionForm>
                </Box>
            </Modal>
        </>

}

export default SubscriptionsCell;