// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
}

const initialState: AuthState = {
    isAuthenticated: localStorage.getItem('accessToken') !== null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                access_token: string;
                refresh_token: string;
            }>
        ) => {
            const {  access_token, refresh_token } = action.payload;
            state.accessToken = access_token;
            state.refreshToken = refresh_token;
            state.isAuthenticated = true;

            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
