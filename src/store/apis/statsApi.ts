import { baseApi } from './api';

export interface OverviewStatsResponse {
  total_clients: number;
  total_students: number;
  new_clients_month: number;
  trainings_in_month: number;
  trainings_in_year: number;
  revenue_by_month: number[];
  expense_by_month: number[];
  trainings_by_month: number[];
}

export const statsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOverviewStats: build.query<OverviewStatsResponse, { year?: number } | void>({
      query: (params) => ({ url: '/stats/overview', params }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetOverviewStatsQuery } = statsApi;


