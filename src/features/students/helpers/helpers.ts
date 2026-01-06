import dayjs from "dayjs";
import { IStudentSubscriptionView } from "../../subscriptions/models/subscription";

export const calculateAge = (dateOfBirth: string): number => {
    return dayjs().diff(dayjs(dateOfBirth), 'year');
};

export const getTotalSessions = (subscriptions: IStudentSubscriptionView[]) => {
    return subscriptions.filter(sub => sub.status === 'active') // Считаем только активные сессии
        .reduce((sum, sub) => sum + (sub.sessions_left || 0), 0);
}