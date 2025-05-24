import React from "react";
import { IClientUserGet } from "../../models/client";
import { InfoCard, IInfoCardItem } from "../InfoCard";
import { IInvoiceGet } from "../../../invoices/models/invoice";
import { Box, Button, Modal } from "@mui/material";
import { AddUserPaymentForm } from "./AddUserPaymentForm";    
import { useState } from "react";

// Иконки (если понадобятся)
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Баланс
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Неоплаченная сумма/инвойсы
import PaymentsIcon from '@mui/icons-material/Payments'; // К доплате

interface FinancialInfoCardProps {
    client: IClientUserGet;
    invoices: IInvoiceGet[];
    invalidateFunction: () => void;
}

const style = {
  position: "absolute",
  width: "50%",
  top: "50%",
  height: "90%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  p: 4,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};

export const FinancialInfoCard: React.FC<FinancialInfoCardProps> = ({ client, invoices, invalidateFunction}) => {
    const unpaidSumFromInvoices = invoices.reduce((acc, invoice) => {
        if (invoice.status === "UNPAID") {
            return acc + invoice.amount;
        }
        return acc;
    }, 0);

    const currentBalance = client.balance ?? 0;
    const amountToPayOff = Math.max(0, unpaidSumFromInvoices - currentBalance);

    const unpaidCount = invoices.filter(invoice => invoice.status === "UNPAID").length;
    
    const financialItems: IInfoCardItem[] = [
        {
            icon: <AccountBalanceWalletIcon />,
            label: "Баланс",
            value: `${currentBalance} €`,
            valueColor: currentBalance >= 0 ? "success.main" : "error.main"
        },
        {
            icon: <ReceiptLongIcon />,
            label: "Сумма к оплате",
            value: `${unpaidSumFromInvoices} €`,
            valueColor: unpaidSumFromInvoices > 0 ? "error.main" : "text.primary"
        },
        {
            icon: <PaymentsIcon />,
            label: "Нужно доплатить",
            value: `${amountToPayOff} €`,
            valueColor: amountToPayOff > 0 ? "warning.main" : "text.primary"
        },
        {
            icon: <ReceiptLongIcon />,
            label: "Неоплач. инвойсов",
            value: unpaidCount,
            valueColor: unpaidCount > 0 ? "error.main" : "text.primary"
        }
    ];

    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
        invalidateFunction();
    }

    return (
        <InfoCard 
            title="Финансовая информация"
            items={financialItems}
        >
          <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{width: "fit-content"}}>
            Добавить платеж
          </Button>
          <Modal open={open} onClose={() => setOpen(false)}>
            <Box sx={style}>
              <AddUserPaymentForm
                initialValues={{
                  client_id: client.id,
                  amount: unpaidSumFromInvoices > 0 ? amountToPayOff : 0, // Используем amountToPayOff, рассчитанный из invoices
                  description: "",
                }}
                client_name={`${client.first_name} ${client.last_name}`}
                onClose={handleClose}
              />
            </Box>
          </Modal>
        </InfoCard>
    );
}; 