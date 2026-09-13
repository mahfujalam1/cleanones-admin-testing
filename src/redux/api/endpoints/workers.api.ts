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

/**
 * Positions the API understands. Not collected by the worker form at the moment — kept here so
 * the list is ready if the field is put back. `position` is free text on the API, so extending
 * this list needs no backend change.
 */
export const WORKER_POSITIONS = [
  "Cleaner",
  "Senior Cleaner",
  "Team Leader",
  "Specialist Cleaner",
] as const;

/**
 * NOT ON THE API. The worker model has no status field, so a Zod schema that strips unknown keys
 * drops this and it reads back as undefined. The form keeps it because the UI is built around it;
 * persisting it needs `status` added to the worker model and its validation.
 */
export const WORKER_STATUSES = ["Active", "Inactive", "Suspended"] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];

/** Sort values the list endpoint accepts; anything else is ignored by the API. */
export const WORKER_SORTS = [
  "-created_at",
  "created_at",
  "email",
  "-email",
  "hourly_rate",
  "-hourly_rate",
] as const;
export type WorkerSort = (typeof WORKER_SORTS)[number];

export type Worker = {
  _id: string;
  /** Id of the linked user account, not the worker profile. */
  user?: string;
  /**
   * Optional on purpose: the swagger example shows a name, but records created before it was
   * collected come back without one. Read it through `workerName()` rather than directly.
   */
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
  /** Employee-type workers only; the API rejects it for freelancers. */
  working_days?: WorkingDay[];
  /** Stored as URLs — the API takes the string, it does not accept an upload. */
  id_card_front?: string;
  id_card_back?: string;
  employee_contract_pdf?: string;
  certificates?: string[];
  isagree_condition?: boolean;
  is_profile_completed?: boolean;
  /** See `WORKER_STATUSES` — sent by the form, not yet stored by the API. */
  status?: WorkerStatus;
  /** NOT ON THE API yet; the avatar uses it the moment the worker model carries one. */
  profile_photo?: string;
  isDeleted?: boolean;
  created_at?: string;
  updated_at?: string;
};

/** Creating a worker also creates its user account, so credentials are set here. */
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
  /** See `WORKER_STATUSES` — sent by the form, not yet stored by the API. */
  status?: WorkerStatus;
};

export type UpdateWorkerInput = Partial<Omit<CreateWorkerInput, "password" | "confirmPassword">>;

export type WorkerListParams = ListParams & { worker_type?: WorkerType };

/** A name to show for a worker that may not have one, so the UI never renders "undefined". */
export function workerName(worker: Pick<Worker, "name" | "email">): string {
  return worker.name?.trim() || worker.email?.split("@")[0] || "Unnamed worker";
}

/**
 * `working_days` is Employee-only — sending it for a freelancer is rejected outright, so it is
 * stripped here rather than left for the server to complain about.
 */
export function withWorkingDays<T extends { worker_type?: WorkerType; working_days?: WorkingDay[] }>(
  input: T,
): T {
  if (input.worker_type === "Employee") return input;
  const { working_days, ...rest } = input;
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

    /** Soft delete: the profile is hidden and its user account blocked. */
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
