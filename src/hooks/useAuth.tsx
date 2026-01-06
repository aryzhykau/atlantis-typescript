import {  useEffect, useCallback } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthenticateUserMutation } from "../store/apis/authApi.ts";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../store";
import {setCredentials} from "../store/slices/authSlice.ts";
import {IAuthResponse} from "../models/auth.ts";
import {logout} from "../store/slices/authSlice.ts";
import { baseApi } from "../store/apis/api";

export function useAuth() {
    const {accessToken, refreshToken, isAuthenticated} = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [authenticateUser, { isLoading, isError, data }] = useAuthenticateUserMutation();

    // Логика Google авторизации, преобразующая токен Google в серверный
    const googleLogin = useGoogleLogin({
        onSuccess: (response) => {
            const googleToken = response.access_token;
            authenticateUser(googleToken)// Отправляем Google токен на сервер для валидации
        },
    });

    // Обновляем токен после валидации на сервере
    useEffect(() => {
        if (data?.access_token && data?.refresh_token && !isLoading && !isError) {
            dispatch(setCredentials(data as IAuthResponse))
            // invalidate cached current user so role-aware UI refetches immediately
            try { dispatch(baseApi.util.invalidateTags(['User'] as any)); } catch (e) { /* noop */ }
        }
    }, [data, isLoading, isError]);

    // Логаут — очищаем токен
    const doLogout = useCallback(() => {

    dispatch(logout())
    // invalidate current user cache so UI updates immediately after logout
    try { dispatch(baseApi.util.invalidateTags(['User'] as any)); } catch (e) { /* noop */ }
    }, []);

    return {
        accessToken,
        refreshToken, // Валидированный токен (берется из состояния)
        googleLogin,    // Авторизация через Google
        doLogout,         // Логаут
        isAuthenticated, // Флаг аутентификации
        isLoading,      // Статус загрузки (валидация на сервере)
        isError,        // Статус ошибки
    };
}