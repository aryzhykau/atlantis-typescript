import {Box} from "@mui/material";


const ClientBalanceCell = ({balance}: {balance: number}) => {
    return <>
        <Box color={theme => balance < 0 ? theme.palette.error.main : theme.palette.success.main}>
            {balance}€
        </Box>

    </>
}


export default ClientBalanceCell;