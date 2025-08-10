import {IMenuItems} from "../models/mainMenu.ts";
import PersonIcon from "@mui/icons-material/Person";
import SportsIcon from '@mui/icons-material/Sports';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PoolIcon from '@mui/icons-material/Pool';
import PaymentsIcon from '@mui/icons-material/Payments';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {ClientsLayout} from "../layouts/clients/Clients.tsx";
import { TrainersListPage } from "../features/trainers/components/TrainersListPage.tsx";
import {DashboardLayout} from "../layouts/Dashboard.tsx";
import { TrainingSettings } from "../layouts/trainingTypesSubscriptions/TrainingSettings.tsx";
import {MobileClients} from "../layouts/clients/MobileClients.tsx";
import InvoicesPayments from "../layouts/invoicesPyaments/InvoicesPayments.tsx";
import { StudentsListPage } from '../features/students/components/StudentsListPage.tsx';
import CalendarV2Page from "../features/calendar-v2/components/CalendarV2Page.tsx";
import MobileCalendarV2Page from "../features/calendar-v2/components/MobileCalendarV2Page.tsx";
import CallIcon from '@mui/icons-material/Call';
import { ClientContactsDataGrid } from "../features/client-contacts/components/ClientContactsDataGrid.tsx";

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
        mobilePage: <MobileClients/>
    },
    {
        title: "Контакты клиентов",
        link: "client-contacts",
        icon: <CallIcon />,
        page: <ClientContactsDataGrid />,
        mobilePage: <ClientContactsDataGrid />
    },
    {
        title: "Ученики",
        link: "students",
        icon: <SchoolIcon/>,
        page: <StudentsListPage/>,
        mobilePage: <StudentsListPage/>
    },
    {
        title: "Тренеры",
        link: "trainers",
        icon: <SportsIcon/>,
        page: <TrainersListPage/>,
        mobilePage: <TrainersListPage/>
    },
    {
        title: "Тренировки и абонементы",
        link: "trainings-and-abonements",
        icon: <PoolIcon/>,
        page: <TrainingSettings></TrainingSettings>,
        mobilePage: <></>
    },
    {
        title: "Платежи",
        link: "invoices",
        icon: <PaymentsIcon/>,
        page: <InvoicesPayments/>,
        mobilePage: <></>
    },
    {
        title: "Календарь",
        link: "calendar",
        icon: <CalendarTodayIcon />,
        page: <CalendarV2Page />,
        mobilePage: <MobileCalendarV2Page />
    }
];