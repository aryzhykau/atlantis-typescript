import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SnackbarState {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
}

const initialState: SnackbarState = {
    open: false,
    message: "",
    severity: "info",
};

const snackbarSlice = createSlice({
    name: "snackbar",
    initialState,
    reducers: {
        showSnackbar: (state, action: PayloadAction<Omit<SnackbarState, "open">>) => {
            state.open = true;
            state.message = action.payload.message;
            state.severity = action.payload.severity;
        },
        closeSnackbar: (state) => {
            state.open = false;
        },
    },
});

export const { showSnackbar, closeSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;