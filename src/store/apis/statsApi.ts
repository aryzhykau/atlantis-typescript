import { baseApi } from './api';

export interface OverviewStatsResponse {
  total_clients: number;
  total_students: number;
  new_clients_month: number;
  trainings_in_month: number;
  trainings_in_year: number;
  labels: string[];
  revenue_series: number[];
  expense_series: number[];
  trainings_series: number[];
}

export const statsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOverviewStats: build.query<OverviewStatsResponse, { start_date?: string; end_date?: string; interval?: 'day'|'week'|'month' } | undefined>({
      query: (params) => ({ url: '/stats/overview', params }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetOverviewStatsQuery } = statsApi;


