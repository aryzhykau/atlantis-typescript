import {IconButton} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {GridRenderCellParams} from "@mui/x-data-grid";
import React from "react";

interface IActionsProps {
    params: GridRenderCellParams;
    handleEdit: (row: never) => void;
    handleDelete: (id: number) => void;
}


const Actions: React.FC<IActionsProps> = ({params, handleEdit, handleDelete})=> {
    return (
        <>
            <IconButton
                color="primary"
                onClick={() => handleEdit(params.row as never)}
            >
                <EditIcon/>
            </IconButton>
            <IconButton
                color="secondary"
                onClick={() => handleDelete(params.row.id)}
            >
                <DeleteIcon color={"error"}/>
            </IconButton>
        </>
    )
}

export default Actions;