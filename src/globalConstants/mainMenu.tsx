import {IMenuItems} from "../models/mainMenu.ts";
import PersonIcon from "@mui/icons-material/Person";
import SportsIcon from '@mui/icons-material/Sports';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PoolIcon from '@mui/icons-material/Pool';
import PaymentsIcon from '@mui/icons-material/Payments';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {ClientsLayout} from "../layouts/clients/Clients.tsx";
import { UnifiedTrainersDataGrid } from "../features/trainers/components/UnifiedTrainersDataGrid.tsx";
import {DashboardLayout} from "../layouts/Dashboard.tsx";
import { TrainingSettings } from "../layouts/trainingTypesSubscriptions/TrainingSettings.tsx";
import {MobileClients} from "../layouts/clients/MobileClients.tsx";
import InvoicesPayments from "../layouts/invoicesPyaments/InvoicesPayments.tsx";
import { MobileInvoicesPaymentsPage } from "../features/invoices/components/MobileInvoicesPaymentsPage";
import { StudentsListPage } from '../features/students/components/StudentsListPage.tsx';
import { MobileStudentsListPage } from '../features/students/components/MobileStudentsListPage.tsx';
import { MobileTrainersListPage } from '../features/trainers/components/MobileTrainersListPage.tsx';
import CalendarV2Page from "../features/calendar-v2/components/desktop/layout/CalendarV2Page";
import MobileFullCalendarV2Page from "../features/calendar-v2/components/mobile/layout/MobileFullCalendarV2Page";
import CallIcon from '@mui/icons-material/Call';
import { UnifiedClientContactsDataGrid } from "../features/client-contacts/components/UnifiedClientContactsDataGrid";
import { MobileClientContactsPage } from "../features/client-contacts/components/MobileClientContactsPage";
import AdminManagementPage from "../features/admin-management/components/AdminManagementPage.tsx";
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {ExpensesSettings} from "../layouts/expenses/ExpensesSettings.tsx";
import { MobileTrainingTypesSubscriptionsPage } from "../features/trainingTypes/components/MobileTrainingTypesSubscriptionsPage";
import { MobileExpensesPage } from "../features/expenses/components/MobileExpensesPage";

export const MenuItems: IMenuItems[] = [
    {
        title: "Дашборд",
        link: "dashboard",
        icon: <DashboardIcon/>,
        page: <DashboardLayout/>,
        mobilePage: <></>,
        ownerOnly: true
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
        page: <UnifiedClientContactsDataGrid />,
        mobilePage: <MobileClientContactsPage />
    },
    {
        title: "Ученики",
        link: "students",
        icon: <SchoolIcon/>,
        page: <StudentsListPage/>,
        mobilePage: <MobileStudentsListPage/>
    },
    {
        title: "Тренеры",
        link: "trainers",
        icon: <SportsIcon/>,
        page: <UnifiedTrainersDataGrid/>,
        mobilePage: <MobileTrainersListPage/>,
    },
    {
        title: "Тренировки и абонементы",
        link: "trainings-and-abonements",
        icon: <PoolIcon/>,
        page: <TrainingSettings></TrainingSettings>,
        mobilePage: <MobileTrainingTypesSubscriptionsPage />
    },
    {
        title: "Платежи",
        link: "invoices",
        icon: <PaymentsIcon/>,
        page: <InvoicesPayments/>,
        mobilePage: <MobileInvoicesPaymentsPage/>
    },
    {
        title: "Календарь",
        link: "calendar",
        icon: <CalendarTodayIcon />,
        page: <CalendarV2Page />,
    mobilePage: <MobileFullCalendarV2Page />
    },
    {
        title: "Расходы",
        link: "expenses",
        icon: <ReceiptLongIcon />,
        page: <ExpensesSettings />,
        mobilePage: <MobileExpensesPage />,
        ownerOnly: true
    },
    {
        title: "Управление администраторами",
        link: "admin-management",
        icon: <AdminIcon />,
        page: <AdminManagementPage />,
        mobilePage: <AdminManagementPage />,
        ownerOnly: true
    }
];