import {IMenuItems} from "../models/mainMenu.ts";
import PersonIcon from "@mui/icons-material/Person";
import SportsIcon from '@mui/icons-material/Sports';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PoolIcon from '@mui/icons-material/Pool';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import {ClientsLayout} from "../layouts/clients/Clients.tsx";
import {TrainersLayout} from "../layouts/trainers/Trainers.tsx";
import {DashboardLayout} from "../layouts/Dashboard.tsx";
import { TrainingSettings } from "../layouts/trainingTypesSubscriptions/TrainingSettings.tsx";
import {MobileClientsLayout} from "../layouts/clients/MobileClients.tsx";
import Calendar from "../layouts/calendar/Calendar.tsx";

import InvoicesPayments from "../layouts/invoicesPyaments/InvoicesPayments.tsx";



export const MenuItems: IMenuItems[] = [
    {
        title: "Дашборд",
        link: "dashboard",
        icon: <DashboardIcon/>,
        page: <DashboardLayout/>,
        mobilePage: <></>
    },
    {
        title: "Клиенты",
        link: "clients",
        icon: <PersonIcon/>,
        page: <ClientsLayout/>,
        mobilePage: <MobileClientsLayout/>
    },
    {
        title: "Тренеры",
        link: "trainers",
        icon: <SportsIcon/>,
        page: <TrainersLayout/>,
        mobilePage: <></>
    },
    {
        title: "Тренировки и абонементы",
        link: "trainings-and-abonements",
        icon: <PoolIcon/>,
        page: <TrainingSettings></TrainingSettings>,
        mobilePage: <></>
    },
    {
        title: "Календарь",
        link: "calendar",
        icon: <CalendarMonthIcon/>,
        page: <Calendar/>,
        mobilePage: <></>
    },
    {
        title: "Платежи",
        link: "invoices",
        icon: <PaymentsIcon/>,
        page: <InvoicesPayments/>,
        mobilePage: <></>
    }
];