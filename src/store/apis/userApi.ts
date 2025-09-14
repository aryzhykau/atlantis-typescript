import {IUser} from "../../models/user.ts";
import {baseApi} from "./api.ts";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentUser: builder.query<IUser, void>({
            query: () => ({
                url: '/users/me',
                method: 'GET',
            }),
            // provide a tag so we can invalidate the cached current user when auth changes
            providesTags: ['User'],
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