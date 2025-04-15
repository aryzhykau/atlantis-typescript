import {Box, CircularProgress} from "@mui/material";


const ClientBalanceCell = ({balance}: {balance: number | undefined}) => {
    return <>
        {balance ? (<Box color={theme => balance < 0 ? theme.palette.error.main : theme.palette.success.main}>
            {balance}€
        </Box>) : (<CircularProgress/>)
        }
    </>
}


export default ClientBalanceCell;