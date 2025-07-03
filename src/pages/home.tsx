import {useGetCurrentUserQuery} from "../store/apis/userApi.ts";
import {Alert, Box, CircularProgress, Paper, Snackbar, Typography} from "@mui/material";
import HomeLayout from "../layouts/HomeLayout.tsx";
import {Outlet} from "react-router-dom";
import {useEffect} from "react";
import {useSnackbar} from "../hooks/useSnackBar.tsx";
import useIsMobile from "../hooks/useMobile.tsx";
import {MobileHomeLayout} from "../layouts/MobileHomeLayout.tsx";
import { TrainerMobileApp } from "../features/trainer-mobile/components/TrainerMobileApp";

export function HomePage() {
    const {isLoading, isSuccess, data, error, isError} = useGetCurrentUserQuery();
    const {snackbar, hideSnackbar} = useSnackbar();
    const isMobile = useIsMobile();
    useEffect(() => {
        console.log(error)
    }, [isError, error]);
    return (
        <>
            {isLoading && import.meta.env.VITE_ENV === "dev" && (
                <Box display={"flex"} justifyContent={"center"} alignItems={"center"} mt={4} flexDirection={"column"}>
                    <Typography variant={"h3"}>Ожидаем загрузки сервера, это может занять до минуты. Пожалуйста подождите</Typography>
                    <CircularProgress/>
                </Box>
            )}
            {isLoading && import.meta.env.VITE_ENV === "prod" && (
                <Box display={"flex"} justifyContent={"center"} alignItems={"center"} mt={4} flexDirection={"column"}>
                    s<CircularProgress/>
                </Box>
            )}
            {isSuccess && (
                // Если пользователь - тренер, показываем специальный мобильный интерфейс
                data.role === 'TRAINER' ? (
                    <TrainerMobileApp />
                ) : (
                    // Для админов и клиентов - обычный интерфейс
                    isMobile ? <MobileHomeLayout><Outlet/></MobileHomeLayout> : <HomeLayout  data={data} isLoading={isLoading}><Outlet/></HomeLayout>
                )
            )}
            {isError && <Paper sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>Ошибка</Paper>}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={hideSnackbar}
                sx={{ zIndex: 9999 }}
            >
                <Alert onClose={hideSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            </>
    )
}