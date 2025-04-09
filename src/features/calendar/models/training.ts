import {Dayjs} from "dayjs";

export interface ITrainingClient {
    client_id: number;
    covered_by_subscription: boolean;
    trial_training: boolean;
}
export interface ITraining {
    trainer_id: number | null;
    training_date?: Dayjs | string| null | undefined;
    training_time?: Dayjs | string| null | undefined;
    training_type_id: string | null;
    clients: ITrainingClient[];
}



export interface ITrainingGet extends ITraining {
    id: string;
    created_at: string;
    updated_at: string;
}