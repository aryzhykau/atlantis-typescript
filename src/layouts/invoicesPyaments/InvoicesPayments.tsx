import React, {useEffect} from "react";
import {useGetInvoicesQuery} from "../../store/apis/invoices.ts";
import {Box} from "@mui/material";
import { InvoicesDataView } from "../../features/invoices/components/InvoicesDataView.tsx";


const InvoicesPayments: React.FC = () => {
    return <><InvoicesDataView></InvoicesDataView></>
}
export default InvoicesPayments;