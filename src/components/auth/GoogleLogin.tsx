import {Button} from "@mui/material";
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
            {isLoading && <h1> Loading...</h1>}
        </>
    )
}