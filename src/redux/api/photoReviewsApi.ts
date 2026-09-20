import { baseApi } from "./baseApi";

export type PhotoAiStatus = "pending" | "passed" | "failed" | "review" | "error" | "skipped";

export type PhotoAiCheck = {
  item: string;
  passed: boolean | null;
  note?: string | null;
};

/** One uploaded photo against a task's photo requirement. AI fields are optional for old records. */
export type UploadedPhoto = {
  title: string;
  photo_url: string;
  description?: string | null;
  reference_image_url?: string | null;
  ai_status?: PhotoAiStatus | null;
  ai_score?: number | null;
  ai_confidence?: number | null;
  ai_reason?: string | null;
  ai_checks?: PhotoAiCheck[] | null;
  ai_subject_matches?: boolean | null;
  ai_requirement_met?: boolean | null;
  forced_accept?: boolean;
  audit_sampled?: boolean;
  attempt_count?: number | null;
  gate_status?: string | null;
  gate_reason?: string | null;
  ai_evaluated_at?: string | null;
  manager_verdict?: "approved" | "rejected" | null;
  manager_verdict_at?: string | null;
  manager_note?: string | null;
  escalated_at?: string | null;
  auto_accepted?: boolean;
};

/** A single shift task instance that has photos uploaded against it. */
export type PhotoReviewTask = {
  shift_id?: string;
  plan_id?: string;
  task_id?: string;
  cleaning_name: string;
  room_name: string;
  task_name: string;
  duration_minutes: number;
  shift_date: string;
  location_name: string;
  address: string;
  review_priority?: number;
  needs_review?: boolean;
  uploaded_photos: UploadedPhoto[];
};

export const photoReviewsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /**
     * GET /shift/photo-review — manager-only, system wide. One row per shift task instance
     * that has at least one uploaded photo; tasks with no photo requirement, or none uploaded
     * yet, are left out entirely. Defaults to the last 30 days when no range is given.
     */
    getShiftPhotoReviews: builder.query<
      PhotoReviewTask[],
      { from?: string; to?: string; planId?: string; locationId?: string; status?: "pending" | "decided" | "all" } | void
    >({
      query: (input) => {
        const q = new URLSearchParams();
        if (input?.from) q.set("from", input.from);
        if (input?.to) q.set("to", input.to);
        if (input?.planId) q.set("planId", input.planId);
        if (input?.locationId) q.set("locationId", input.locationId);
        if (input?.status) q.set("status", input.status);
        const qs = q.toString();
        return `/shift/photo-review${qs ? `?${qs}` : ""}`;
      },
      // A malformed payload would otherwise crash every `.map` downstream.
      transformResponse: (response: PhotoReviewTask[] | null) =>
        Array.isArray(response) ? response : [],
      providesTags: ["photoReviews" as never],
    }),

    recordPhotoVerdict: builder.mutation<
      unknown,
      {
        planId: string;
        date: string;
        taskId: string;
        title: string;
        verdict: "approved" | "rejected";
        note?: string;
      }
    >({
      query: ({ planId, date, taskId, ...body }) => ({
        url: `/shift/${encodeURIComponent(planId)}/${encodeURIComponent(date)}/tasks/${encodeURIComponent(taskId)}/photo-verdict`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["photoReviews" as never],
    }),
  }),
});

export const {
  useGetShiftPhotoReviewsQuery,
  useRecordPhotoVerdictMutation,
} = photoReviewsApi;
