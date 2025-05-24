import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
    IconButton,
    Chip,
    Divider,
    Switch,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import dayjs from "dayjs";
import { IClientGet } from "../../clients/models/client.ts";

export function ClientMobileCard({
                                     client,
                                     onEdit,
                                     onDelete,
                                     onToggleActive,
                                 }: {
    client: IClientGet;
    onEdit: (id: number) => void; // Callback for editing client
    onDelete: (id: number) => void; // Callback for deleting client
    onToggleActive: (event: React.ChangeEvent<HTMLInputElement>, client: IClientGet) => void; // Callback for toggling active status
}) {
    return (
        <Accordion
            sx={{
                width: "100%",
                borderRadius: 3,
                marginBottom: 0,
                border: "1px solid",
                borderColor: client.active ? "#4caf50" : "#f44336", // Sporty colors for active/inactive
                "&:before": { display: "none" },
 // Gradient when active
            }}
        >
            {/* Summary Header (always visible) */}
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffff" }} />}
                sx={{
                    padding: 2,
                    borderRadius: "8px 8px 0 0",
                  // Bold color blocks for headers
                    color: "white",
                }}
            >
                <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                >
                    {/* Basic Info */}
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                color: (theme) => theme.palette.text.primary,
                                textTransform: "uppercase",
                            }}
                        >
                            {client.first_name} {client.last_name}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx ={{
                                fontStyle: "italic",
                                color: theme => theme.palette.text.secondary
                            }}
                        >
                            {client.phone}
                        </Typography>
                    </Box>

                </Box>
            </AccordionSummary>

            {/* Accordion Details (visible when expanded) */}
            <AccordionDetails
                sx={{
                    padding: 2, // Light background to contrast the header
                }}
            >

               <Box display="flex" justifyContent="space-between" alignItems="center" >
                {/* Contact Information */}
                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                    <Typography
                        variant="body2"
                        display="flex"
                        alignItems="center"
                        gap={1}
                    >
                        <PhoneIcon fontSize="small" sx={{ color: "gray" }} />
                        {client.phone || "No phone number"}
                    </Typography>
                    <Typography
                        variant="body2"
                        display="flex"
                        alignItems="center"
                        gap={1}
                    >
                        <EmailIcon fontSize="small" sx={{ color: "gray" }} />
                        {client.email || "No email"}
                    </Typography>
                </Box>
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    mb={1}
                >
                    <IconButton
                        aria-label="Edit client"
                        size="medium"
                        sx={{
                            color: "primary.main",
                        }}
                        onClick={() => onEdit(client.id)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        aria-label="Delete client"
                        size="medium"
                        sx={{
                            color: "error.main",
                        }}
                        onClick={() => onDelete(client.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
               </Box>

                <Divider />

                {/* Additional Details */}
                <Box display="flex" flexDirection="column" gap={1} my={2}>
                    <Typography variant="caption">
                        Birth Date:{" "}
                        {client.birth_date
                            ? dayjs(client.birth_date).format("DD.MM.YYYY")
                            : "Not Specified"}
                        {client.is_birthday && (
                            <Chip
                                label="🎉 Birthday Today!"
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Typography>
                    <Typography variant="caption">
                        Google Authenticated:{" "}
                        {client.google_authenticated ? "Yes" : "No"}
                    </Typography>
                    {client.parent_name && (
                        <Typography variant="caption">
                            Parent: {client.parent_name}
                        </Typography>
                    )}
                </Box>

                <Divider />

                {/* Active Status Switch */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                >
                    <Typography variant="body2" fontWeight="bold">
                        Status: {client.active ? "Активен" : "Деактивирован"}
                    </Typography>
                    <Switch
                        checked={client.active}
                        onChange={(event ) => onToggleActive(event, client)}
                        color="primary"
                    />
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}