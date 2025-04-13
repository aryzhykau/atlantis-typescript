import {Dayjs} from "dayjs";

export interface ITrainingClient {
    client_id: number | null;
    trial_training?: boolean;
}
export interface ITraining {
    trainer_id: number | null;
    training_date?: Dayjs | string| null | undefined;
    training_time?: Dayjs | string| null | undefined;
    training_type_id: string | null;
    clients: ITrainingClient[];
}



export interface ITrainingGet {
    id: number
    trainer_id: number
    training_type_id: number
    training_datetime: string
    clients: ITrainingClientGet[]
}

export interface ITrainingClientGet {
    trial_training: boolean
    invoice_id: number
    client: ITrainingClientObject
}

export interface ITrainingClientObject {
    first_name: string
    last_name: string
    email: string
    phone: string
    birth_date: string
}