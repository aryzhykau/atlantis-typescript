import {useGetCurrentUserQuery} from "../store/apis/userApi.ts";
import {Alert, Paper, Snackbar} from "@mui/material";
import HomeLayout from "../layouts/HomeLayout.tsx";
import {Outlet} from "react-router-dom";
import {useEffect, useState} from "react";
import {useSnackbar} from "../hooks/useSnackBar.tsx";
import useIsMobile from "../hooks/useMobile.tsx";
import {MobileHomeLayout} from "../layouts/MobileHomeLayout.tsx";
import {SpringLoader} from "../components/loading/SpringLoader.tsx";

export function HomePage() {
    const {isLoading, isSuccess, data, error, isError} = useGetCurrentUserQuery();
    const {snackbar, hideSnackbar} = useSnackbar();
    const isMobile = useIsMobile();
    
    // TODO: REMOVE THIS SECTION AFTER TESTING THE LOADING ANIMATION
    // This adds an artificial 3-second delay to see the spring animation properly
    // To remove: delete the useState hooks below and the useEffect blocks, 
    // then change {showLoader && <SpringLoader />} back to {isLoading && <SpringLoader />}
    // and {!showLoader && isSuccess && ()} back to {isSuccess && ()}
    const [minLoadingTime, setMinLoadingTime] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    
    useEffect(() => {
        // Minimum loading time of 3 seconds for testing the animation
        const timer = setTimeout(() => {
            setMinLoadingTime(false);
        }, 3000);
        
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        // Only hide loader when both API is loaded AND minimum time has passed
        if (!isLoading && !minLoadingTime) {
            setShowLoader(false);
        } else if (isLoading || minLoadingTime) {
            setShowLoader(true);
        }
    }, [isLoading, minLoadingTime]);
    // END OF TESTING SECTION TO REMOVE
    
    useEffect(() => {
        console.log(error)
    }, [isError, error]);
    
    return (
        <>
            {showLoader && <SpringLoader />}
            {!showLoader && isSuccess && (
                // Для админов и клиентов - обычный интерфейс
                isMobile ? <MobileHomeLayout><Outlet/></MobileHomeLayout> : <HomeLayout data={data} isLoading={isLoading}><Outlet/></HomeLayout>
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