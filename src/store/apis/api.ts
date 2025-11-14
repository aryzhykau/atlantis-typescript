// services/baseApi.ts
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {FetchArgs, FetchBaseQueryError, BaseQueryFn} from '@reduxjs/toolkit/query';
import {RootState} from '../index.ts';
import {setCredentials, logout} from '../slices/authSlice';
import {API_BASE_URL} from "../../globalConstants/settings.ts";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth?.accessToken;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        const refreshToken = (api.getState() as RootState).auth?.refreshToken;
        if (refreshToken) {
            const refreshResult = await rawBaseQuery(
                {
                    url: '/auth/refresh-token',
                    method: 'POST',
                    body: { refresh_token: refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                console.log("refresh data",refreshResult.data)
                api.dispatch(setCredentials(refreshResult.data as { access_token: string; refresh_token: string }));
                const newToken = (api.getState() as RootState).auth?.accessToken;
                if (newToken) {
                    console.log("new token", newToken)
                    result = await rawBaseQuery(args, api, extraOptions);
                }
            } else {
                api.dispatch(logout());
            }
        }
    }

    return result;
};

// Создаём базовое API без endpoints
export const baseApi = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
    tagTypes: [
        'Client', 
        'Trainer', 
        'User', 
        'Subscription', 
        'StudentSubscriptions', 
        'Students', 
        'TrainingType',
        'TrainingTemplateV2',
        'TrainingStudentTemplateV2',
        'RealTrainingV2',
        'Payment',
        'TrainerStats',
        'Expenses',
        'TrainerSalary',
        'Admin',
        'AdminStats',
        'OwnerStats',
        'Invoice',
    ],
});
