import {Dayjs} from "dayjs";

export interface ICalendarDay {
  date: Dayjs;
  day_name: string;
  isToday: boolean;
}