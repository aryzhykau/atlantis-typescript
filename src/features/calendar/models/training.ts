import {Dayjs} from "dayjs";
import {IClientUserGet} from "../../clients/models/client.ts";

export interface ITrainingStudent {
    student_id: number | null;
    trial_training?: boolean;
}
export interface ITraining {
    trainer_id: number | null;
    training_date?: Dayjs | string| null | undefined;
    training_time?: Dayjs | string| null | undefined;
    training_type_id: string | null;
    students: ITrainingStudent[];
}



export interface ITrainingGet {
    id: number
    trainer_id: number
    created_at: Dayjs | string | null | undefined
    training_type_id: number
    training_datetime: string
    students: ITrainingStudentGet[]
}

export interface ITrainingStudentGet {
    trial_training: boolean
    invoice_id: number
    student: ITrainingStudentObject
}

export interface ITrainingStudentObject {
    first_name: string
    last_name: string
    email: string
    phone: string
    birth_date: string
    relative: IClientUserGet
}