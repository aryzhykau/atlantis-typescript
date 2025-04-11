import {Box, Button, CircularProgress, Typography} from "@mui/material";
import GoogleLoginIcon from "../../assets/icons/google-signin-icon.svg?react"
import {useAuth} from "../../hooks/useAuth.tsx";


export function GoogleLoginBtn() {

    const {googleLogin, isLoading} = useAuth()
    return (

        <>
            <Button
                variant={"outlined"}
                onClick={() => googleLogin()}
                sx = {{mt: 4, p: 1.5, fontSize: 18}}
                disabled={isLoading}
                startIcon={<GoogleLoginIcon height={36} width={36}/>}
            >
                Войти через Google
            </Button>
            {isLoading && import.meta.env.VITE_ENV === "dev" &&(
                <Box display={"flex"} justifyContent={"center"} alignItems={"center"} mt={4} flexDirection={"column"}>
                    <Typography variant={"h3"}>Ожидаем загрузки сервера, это может занять до минуты. Пожалуйста подождите</Typography>
                    <CircularProgress/>

                </Box>
            )}
            {isLoading && import.meta.env.VITE_ENV === "prod" &&(
                <Box display={"flex"} justifyContent={"center"} alignItems={"center"} mt={4} flexDirection={"column"}>
                    <CircularProgress/>
                </Box>
            )}
        </>

    )
}