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
import { ClientPage } from "./features/clients/components/ClientPage/ClientPage.tsx";
import { StudentPage } from './features/students/components/StudentPage.tsx';
import { TrainerPage } from './features/trainers/components/TrainerPage';
import { TrainerMobileApp } from './features/trainer-mobile/components/TrainerMobileApp';
import { useGetCurrentUserQuery } from './store/apis/userApi';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import useMobile from "./hooks/useMobile.tsx";


function App() {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = prefersDarkMode ? darkTheme : lightTheme;

    const isMobile = useMobile();
    const {isAuthenticated} = useAuth();
    const {data: user} = useGetCurrentUserQuery(undefined, { skip: !isAuthenticated });
    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                      <BrowserRouter>
                          <Routes>
                              <Route path={"/"} element={!isAuthenticated ? <LoginPage/> : <Navigate to="/home"/>}/>
                              <Route path={"/home"} element={
                                  !isAuthenticated ? <Navigate to="/"/> : 
                                  (user?.role === 'TRAINER' ? <Navigate to="/trainer-mobile"/> : <HomePage />)
                              }>
                                  <Route index element={MenuItems[0].page}/>
                                  {
                                      MenuItems.map((item: IMenuItems): ReactNode => {
                                          if (item.link === "clients") {
                                              return (
                                                  <Route key={item.link} path={item.link}>
                                                      <Route index element={isMobile ? item.mobilePage : item.page} />
                                                      <Route path=":clientId" element={<ClientPage />} />
                                                  </Route>
                                              );
                                          }
                                          if (item.link === "students") {
                                              return (
                                                  <Route key={item.link} path={item.link}>
                                                      <Route index element={isMobile ? item.mobilePage : item.page} />
                                                      <Route path=":studentId" element={<StudentPage />} />
                                                  </Route>
                                              );
                                          }
                                          if (item.link === "trainers") {
                                              return (
                                                  <Route key={item.link} path={item.link}>
                                                      <Route index element={isMobile ? item.mobilePage : item.page} />
                                                      <Route path=":trainerId" element={<TrainerPage />} />
                                                  </Route>
                                              );
                                          }
                                          if (item.link === "admin-management") {
                                              return (
                                                  <Route key={item.link} path={item.link}>
                                                      <Route index element={isMobile ? item.mobilePage : item.page} />
                                                  </Route>
                                              );
                                          }
                                          return <Route key={item.link} path={item.link} element={isMobile ? item.mobilePage : item.page} />;
                                      })
                                  }
                              </Route>
                              <Route path="/trainer-mobile/*" element={
                                  !isAuthenticated ? <Navigate to="/"/> : 
                                  (user?.role === 'TRAINER' ? <TrainerMobileApp /> : <Navigate to="/home"/>)
                              } />
                          </Routes>
                      </BrowserRouter>
                  </LocalizationProvider>
        </ThemeProvider>
    )
}

export default App
