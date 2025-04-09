import {Box, Toolbar, Typography,  Paper, } from "@mui/material";
import {IUser} from "../models/user.ts";
import {MenuItems} from "../globalConstants/mainMenu.tsx";
import {SideBar} from "../components/sideBar/SideBar.tsx";
import {useLocation} from "react-router-dom";
import {IMenuItems} from "../models/mainMenu.ts";

const sideBarWidth = 240;// Ширина сайдбара
export interface HomeLayoutProps {
    children: React.ReactNode;// Для детей (children)
    data: IUser;                   // Тип для данных
    isLoading: boolean;          // Тип для флага загрузки
}



export default function HomeLayout({ children,  data, isLoading }: HomeLayoutProps) {
    const location = useLocation();


    const getHeaderTitle = () => {
        if(location.pathname === "/home/" || location.pathname === "/home") {
            return "Дашборд"
        }
        else {
            const page: IMenuItems = MenuItems.filter((item) => item.link === location.pathname.split("/")[2])[0];
            console.log(page)
            return page.title;
        }
    }
    return (
        <Box sx={{
            display: "grid",
            gridTemplateColumns: `${sideBarWidth}px 1fr`,
            gridTemplateRows: "64px 1fr",
            height: "100vh",
            p: "16px",
            columnGap: 1,
        }}>
            {/* Хедер */}
            <Paper  elevation={0} sx={{gridColumn: "2", gridRow: "1"}}>
                <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant="h6" noWrap component="div">
                        {getHeaderTitle()}
                    </Typography>

                    {!isLoading && <Typography variant={"h6"}>{`${data.first_name} ${data.last_name}`}</Typography>}
                </Toolbar>
            </Paper>
            {/* Сайдбар */}
            <SideBar width={sideBarWidth}/>


            {/* Основной контент */}
            <Box sx={{gridColumn: "2", gridRow: "2", p: 3, overflow: "auto"}}>
                {children}
            </Box>
        </Box>
    );
}