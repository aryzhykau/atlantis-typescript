export interface ISubscription {
    title: string;
    total_sessions: number;
    duration: number;
    price: number;
    active?: boolean;
}




export interface ISubscriptionGet extends ISubscription{
    id: number;
    created_at: string;
    updated_at: string;
}