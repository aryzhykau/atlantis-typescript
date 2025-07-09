import Switch from "@mui/material/Switch";
import {GridRenderCellParams} from "@mui/x-data-grid";
import { useUpdateSubscriptionMutation } from "../../../store/apis/subscriptionsApi.ts";
import { ISubscriptionResponse, ISubscriptionUpdatePayload } from "../models/subscription.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";

interface ISubscriptionActiveCellProps {
    params: GridRenderCellParams<ISubscriptionResponse>;
}

const SubscriptionActiveCell: React.FC<ISubscriptionActiveCellProps> = ({params}) => {
    const [updateSubscription, {isLoading}] = useUpdateSubscriptionMutation();
    const {displaySnackbar} = useSnackbar();

    const subscription = params.row;

    return <Switch
        checked={Boolean(subscription.is_active)}
        disabled={isLoading}
        onChange={async (e) => {
            const isActive = e.target.checked;
            const payload: ISubscriptionUpdatePayload = { is_active: isActive };
            try {
                await updateSubscription({
                    id: subscription.id,
                    payload: payload
                }).unwrap();
                if(isActive) {
                    displaySnackbar("Статус абонемента обновлен: Активен", "success")
                }
                else {
                    displaySnackbar("Статус абонемента обновлен: Неактивен", "success");
                }
            }
            catch (err: unknown) {
                console.error("Ошибка при изменении статуса абонемента:", err);
                const errorDetail = (err as any)?.data?.detail || 'Ошибка при изменении статуса';
                displaySnackbar(String(errorDetail), "error");
            }
        }}
        color="primary"
    />
}

export default SubscriptionActiveCell;