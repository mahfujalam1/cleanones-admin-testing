import { baseApi } from "../baseApi";
import { listQuery, type ListParams, type Paginated } from "../types";
import { tagTypes } from "../../tagTypes";

export const WORKER_TYPES = ["Employee", "Freelancer"] as const;
export type WorkerType = (typeof WORKER_TYPES)[number];

export const WORKING_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type WorkingDay = (typeof WORKING_DAYS)[number];



export const WORKER_POSITIONS = [
  "Cleaner",
  "Senior Cleaner",
  "Team Leader",
  "Specialist Cleaner",
] as const;



export const WORKER_STATUSES = ["Active", "Inactive", "Suspended"] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];


export const WORKER_SORTS = [
  "-createdAt",
  "createdAt",
  "email",
  "-email",
  "hourly_rate",
  "-hourly_rate",
] as const;
export type WorkerSort = (typeof WORKER_SORTS)[number];

export type Worker = {
  _id: string;
  
  user?: string;


  name?: string;
  email: string;
  phone: string;
  worker_type: WorkerType;
  position?: string;
  address?: string;
  base_location?: string;
  nationality?: string;
  dob?: string;
  languages?: string[];
  hourly_rate?: number;
  national_id?: string;
  
  working_days?: WorkingDay[];
  
  id_card_front?: string;
  id_card_back?: string;
  employee_contract_pdf?: string;
  certificates?: string[];
  isagree_condition?: boolean;
  is_profile_completed?: boolean;
  
  status?: WorkerStatus;
  
  profile_photo?: string;
  profile_image?: string | null;
  isDeleted?: boolean;
  worked_hours?: number;
  total_completed_work_hours?: number | string;
  total_shift?: number;
  total_late_check_ins?: number;
  total_on_time_check_ins?: number;
  total_absent?: number;
  total_earning?: number;
  total_paid?: number;
  pending_amount?: number;
  createdAt?: string;
  updatedAt?: string;
};


export type CreateWorkerInput = {
  name: string;
  email: string;
  phone: string;
  worker_type: WorkerType;
  password: string;
  confirmPassword: string;
  address?: string;
  position?: string;
  base_location?: string;
  nationality?: string;
  dob?: string;
  languages?: string[];
  hourly_rate?: number;
  national_id?: string;
  working_days?: WorkingDay[];
  id_card_front?: string;
  id_card_back?: string;
  employee_contract_pdf?: string;
  certificates?: string[];
  isagree_condition?: boolean;
  is_profile_completed?: boolean;
  
  status?: WorkerStatus;
};

export type UpdateWorkerInput = Partial<Omit<CreateWorkerInput, "password" | "confirmPassword">>;

export type WorkerListParams = ListParams & { worker_type?: WorkerType };


export function workerName(worker: Pick<Worker, "name" | "email">): string {
  return worker.name?.trim() || worker.email?.split("@")[0] || "Unnamed worker";
}


export function workerPhoto(worker?: Pick<Worker, "profile_image" | "profile_photo"> | null): string | undefined {
  const src = worker?.profile_image || worker?.profile_photo;
  return src?.trim() || undefined;
}



export function withWorkingDays<T extends { worker_type?: WorkerType; working_days?: WorkingDay[] }>(
  input: T,
): T {
  if (input.worker_type === "Employee") return input;
  const { working_days: _omitted, ...rest } = input;
  return rest as T;
}

export const workersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkerList: builder.query<Paginated<Worker>, WorkerListParams | void>({
      query: (params) => {
        const query = listQuery(params ?? {});
        const type = params?.worker_type;
        return `/worker/all-workers?${query}${type ? `&worker_type=${type}` : ""}`;
      },
      providesTags: (response) => [
        { type: tagTypes.workers, id: "LIST" },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.workers, id: _id })),
      ],
    }),

    getWorker: builder.query<Worker, string>({
      query: (id) => `/worker/single-worker/${encodeURIComponent(id)}`,
      providesTags: (_response, _error, id) => [{ type: tagTypes.workers, id }],
    }),

    createWorker: builder.mutation<Worker, CreateWorkerInput>({
      query: (body) => ({ url: "/worker/create-worker", method: "POST", body: withWorkingDays(body) }),
      invalidatesTags: [{ type: tagTypes.workers, id: "LIST" }],
    }),

    updateWorker: builder.mutation<Worker, { id: string; body: UpdateWorkerInput }>({
      query: ({ id, body }) => ({
        url: `/worker/update-worker/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: withWorkingDays(body),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.workers, id },
        { type: tagTypes.workers, id: "LIST" },
      ],
    }),

    
    deleteWorker: builder.mutation<null, string>({
      query: (id) => ({ url: `/worker/delete-worker/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: tagTypes.workers, id },
        { type: tagTypes.workers, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetWorkerListQuery,
  useGetWorkerQuery,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
} = workersApi;
