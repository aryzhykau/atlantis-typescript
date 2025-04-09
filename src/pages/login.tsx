import {GoogleLoginBtn} from "../components/auth/GoogleLogin.tsx";
import {Container, Typography} from "@mui/material";



export function LoginPage() {
    return (
        <>
            <Container sx={{ display: "flex", flexDirection: "column",justifyContent: "center",  alignItems: "center", height: "100vh" }}>
                <Typography
                    variant={"h1"}
                    sx = {{
                        textAlign: "center"
                    }}
                >ATLANTIS</Typography>
                <GoogleLoginBtn/>
            </Container>
        </>
    )
}