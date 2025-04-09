
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/login.tsx";
import {useAuth} from "./hooks/useAuth.tsx";
import {HomePage} from "./pages/home.tsx";
import { ThemeProvider, useMediaQuery, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme/ai-theme';
import {MenuItems} from "./globalConstants/mainMenu.tsx";
import {IMenuItems} from "./models/mainMenu.ts";
import {ReactNode} from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import "dayjs/locale/ru";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import useMobile from "./hooks/useMobile.tsx";


function App() {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = prefersDarkMode ? darkTheme : lightTheme;

    const isMobile = useMobile();
    const {isAuthenticated} = useAuth();
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                      <BrowserRouter>
                          <Routes>
                              <Route path={"/"} element={!isAuthenticated ? <LoginPage/> : <Navigate to="/home"/>}/>
                              <Route path={"/home"} element={!isAuthenticated ? <Navigate to="/"/> : <HomePage />}>
                                  <Route index element={MenuItems[0].page}/>
                                  {
                                      MenuItems.map((item: IMenuItems): ReactNode => <Route key={item.link} path={item.link} element={isMobile? item.mobilePage : item.page}/>)
                                  }
                              </Route>
                          </Routes>
                      </BrowserRouter>
                  </LocalizationProvider>
        </ThemeProvider>
    )
}

export default App
