import Switch from "@mui/material/Switch";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {useSubscriptions} from "../hooks/useSubscriptions.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";



interface ISubscriptionActiveCellProps {
    params: GridRenderCellParams;
}

const SubscriptionActiveCell: React.FC<ISubscriptionActiveCellProps> = ({params}) => {
    const {updateSubscription, refetchSubscriptions} = useSubscriptions();
    const {displaySnackbar} = useSnackbar();

    return <Switch
        checked={Boolean(params.row.active)}
        onChange={async (e) => {
            const isActive = e.target.checked;
            try {
                await updateSubscription({
                    subscriptionId: Number(params.row.id),
                    subscriptionData: {...params.row, active: isActive }
                }).unwrap();
                await refetchSubscriptions();
                if(isActive) {
                    displaySnackbar("Подписка доступна клиентам", "success")
                }
                else {
                    displaySnackbar("Подписка недоступна клиентам", "success");
                }
            }
            catch (e: unknown) {
                console.log(e)
                displaySnackbar(
                    "Ошибка при изменении состояния активности клиента",
                    "error"
                );
            }
        }}
        color="primary"
    />
}

export default SubscriptionActiveCell;