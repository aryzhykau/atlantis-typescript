import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { showSnackbar, closeSnackbar } from "../store/slices/snackBarSlice.ts";

export function useSnackbar() {
    const dispatch = useDispatch();
    const snackbar = useSelector((state: RootState) => state.snackbar);

    const displaySnackbar = useCallback(
        (message: string, severity: "success" | "error" | "info" | "warning") => {
            dispatch(showSnackbar({ message, severity }));
        },
        [dispatch]
    );

    const hideSnackbar = useCallback(() => {
        dispatch(closeSnackbar());
    }, [dispatch]);

    return {
        snackbar,
        displaySnackbar,
        hideSnackbar,
    };
}