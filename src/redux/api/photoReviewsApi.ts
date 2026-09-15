import { baseApi } from "./baseApi";

/** One uploaded photo against a task's photo requirement. */
export type UploadedPhoto = { title: string; photo_url: string };

/** A single shift task instance that has photos uploaded against it. */
export type PhotoReviewTask = {
  cleaning_name: string;
  room_name: string;
  task_name: string;
  duration_minutes: number;
  shift_date: string;
  location_name: string;
  address: string;
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
      { from?: string; to?: string; planId?: string; locationId?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams();
        if (input?.from) q.set("from", input.from);
        if (input?.to) q.set("to", input.to);
        if (input?.planId) q.set("planId", input.planId);
        if (input?.locationId) q.set("locationId", input.locationId);
        const qs = q.toString();
        return `/shift/photo-review${qs ? `?${qs}` : ""}`;
      },
      // A malformed payload would otherwise crash every `.map` downstream.
      transformResponse: (response: PhotoReviewTask[] | null) =>
        Array.isArray(response) ? response : [],
      providesTags: ["photoReviews" as never],
    }),

  }),
});

export const {
  useGetShiftPhotoReviewsQuery,
} = photoReviewsApi;
