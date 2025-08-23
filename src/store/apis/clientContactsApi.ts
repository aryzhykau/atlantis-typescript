import { baseApi } from './api';

export type ClientContactReason = 'NEW_CLIENT' | 'RETURNED';
export type ClientContactStatus = 'PENDING' | 'DONE';

export interface ClientContactTask {
  id: number;
  client_id: number;
  reason: ClientContactReason;
  status: ClientContactStatus;
  created_at: string;
  done_at?: string | null;
  assigned_to_id?: number | null;
  note?: string | null;
  last_activity_at?: string | null;
}

export interface CreateClientContactTaskDto {
  client_id: number;
  reason: ClientContactReason;
  note?: string;
  assigned_to_id?: number;
  last_activity_at?: string;
}

export interface UpdateClientContactTaskDto {
  status?: ClientContactStatus;
  note?: string;
  assigned_to_id?: number;
}

export const clientContactsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listClientContacts: build.query<ClientContactTask[], { status?: ClientContactStatus; reason?: ClientContactReason; assigned_to_id?: number; limit?: number; offset?: number } | undefined>({
      query: (params) => ({ url: '/client-contacts/', params }),
      providesTags: ['Client'],
    }),
    createClientContact: build.mutation<ClientContactTask, CreateClientContactTaskDto>({
      query: (body) => ({ url: '/client-contacts/', method: 'POST', body }),
      invalidatesTags: ['Client'],
    }),
    updateClientContact: build.mutation<ClientContactTask, { task_id: number; data: UpdateClientContactTaskDto }>({
      query: ({ task_id, data }) => ({ url: `/client-contacts/${task_id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Client'],
    }),
  }),
});

export const { useListClientContactsQuery, useCreateClientContactMutation, useUpdateClientContactMutation } = clientContactsApi;



