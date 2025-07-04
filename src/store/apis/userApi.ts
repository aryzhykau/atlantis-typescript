import {IUser} from "../../models/user.ts";
import {baseApi} from "./api.ts";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentUser: builder.query<IUser, void>({
            query: () => ({
                url: '/users/me',
                method: 'GET',
            }),
        }),
        getUsers: builder.query<IUser[], void>({
            query: () => ({
                url: '/users',
                method: 'GET',
            }),
        }),
    }),
});

export const { useGetCurrentUserQuery, useGetUsersQuery } = userApi;