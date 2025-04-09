export interface ITrainingType {
    title: string;
    price: number;
    require_subscription: boolean;
}


export interface ITrainingTypeGet extends ITrainingType{
    id: number;
    created_at: string;
    updated_at: string;
}