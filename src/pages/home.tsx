import {useGetCurrentUserQuery} from "../store/apis/userApi.ts";
import {Alert, Backdrop, Paper, Snackbar} from "@mui/material";
import HomeLayout from "../layouts/HomeLayout.tsx";
import {Outlet} from "react-router-dom";
import {useEffect} from "react";
import {useSnackbar} from "../hooks/useSnackBar.tsx";
import useIsMobile from "../hooks/useMobile.tsx";
import {MobileHomeLayout} from "../layouts/MobileHomeLayout.tsx";

export function HomePage() {
    const {isLoading, isSuccess, data, error, isError} = useGetCurrentUserQuery();
    const {snackbar, hideSnackbar} = useSnackbar();
    const isMobile = useIsMobile();
    useEffect(() => {
        console.log(error)
    }, [isError, error]);
    return (
        <>
            {isLoading && <Backdrop open={isLoading}/>}
            {isSuccess && (isMobile ? <MobileHomeLayout><Outlet/></MobileHomeLayout> : <HomeLayout  data={data} isLoading={isLoading}><Outlet/></HomeLayout>)}
            {isError && <Paper sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>Ошибка</Paper>}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={hideSnackbar}>
                <Alert onClose={hideSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            </>
    )
}