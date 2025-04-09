import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import store from "./store";
import {Provider} from "react-redux";
import {GoogleOAuthProvider} from "@react-oauth/google";

const googleClientId = "317287995854-hjm52r9lvi0sungac6v5vbv2h2qr9cut.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <GoogleOAuthProvider clientId={googleClientId}>
            <App/>
        </GoogleOAuthProvider>
    </Provider>
)
