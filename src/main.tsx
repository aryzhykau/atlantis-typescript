import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import store from "./store";
import {Provider} from "react-redux";
import {GoogleOAuthProvider} from "@react-oauth/google";
import { ThemeModeProvider } from './theme/ThemeModeProvider';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID


createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <GoogleOAuthProvider clientId={googleClientId}>
            <ThemeModeProvider>
                <App/>
            </ThemeModeProvider>
        </GoogleOAuthProvider>
    </Provider>
)
