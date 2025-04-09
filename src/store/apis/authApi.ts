import {IAuthResponse} from "../../models/auth.ts";
import {baseApi} from "./api.ts";


export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        authenticateUser: builder.mutation<IAuthResponse, string>({
            query: (token: string) => ({
                url: '/auth/google',
                method: 'GET',
                headers:  { "Authorization": "Bearer " + token },  // отправляешь токен Google на сервер
            }),
        }),


    }),


});

export const { useAuthenticateUserMutation } = authApi;