import { baseApi } from "./api";
import { DashboardFilters, OwnerDashboardResponse } from "../../features/dashboard/models/dashboard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOwnerDashboard: build.query<OwnerDashboardResponse, DashboardFilters | undefined>({
      query: (params) => ({
        url: "/stats/owner-dashboard",
        params,
      }),
      providesTags: ["OwnerStats"],
    }),
  }),
});

export const { useGetOwnerDashboardQuery } = dashboardApi;
