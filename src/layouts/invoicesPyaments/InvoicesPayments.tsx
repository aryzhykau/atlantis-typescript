import React, {useEffect} from "react";
import {useGetInvoicesQuery} from "../../store/apis/invoices.ts";
import {Box} from "@mui/material";


const InvoicesPayments: React.FC = () => {
    const {data, refetch} = useGetInvoicesQuery({ only_unpaid: false})

    useEffect(() => {
        refetch()
    }, []);

    return <>{} </>
}
export default InvoicesPayments;