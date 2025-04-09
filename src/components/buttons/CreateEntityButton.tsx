import {Button} from "@mui/material";
import React from "react";


interface ICreateEntityButtonProps {
    onClick: () => void;
    children?: React.ReactNode;

}

const CreateEntityButton: React.FC<ICreateEntityButtonProps> = ({children, onClick}) => {
    return <Button
        variant={"contained"}
        onClick={onClick}
        style={{
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
        }}
    >
        {children}
    </Button>
}

export default CreateEntityButton;