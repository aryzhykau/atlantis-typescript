import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import store from "./store";
import {Provider} from "react-redux";
import {GoogleOAuthProvider} from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID


createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <GoogleOAuthProvider clientId={googleClientId}>
            <App/>
        </GoogleOAuthProvider>
    </Provider>
)
