import { configureStore } from '@reduxjs/toolkit'
import deviceReducer from "./slices/deviceSlice.ts"
import snackBarReducer from "./slices/snackBarSlice.ts"
import authReducer from "./slices/authSlice.ts"
import {baseApi} from "./apis/api.ts";
const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        device: deviceReducer,
        snackbar:snackBarReducer,
        auth: authReducer,

    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(baseApi.middleware)

})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;