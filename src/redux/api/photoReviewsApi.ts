import { baseApi } from "./baseApi";
import type { PhotoReviewApi } from "@/services/actions/photoReviews";

export const photoReviewsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPhotoReviews: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; pending_reviews_count: number; reviews: PhotoReviewApi[] },
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 100),
        });
        if (input?.status) q.set("status_filter", input.status);
        if (input?.search) q.set("search", input.search);
        return `/manager/photo-reviews?${q.toString()}`;
      },
      providesTags: ["photoReviews" as never],
    }),
    getPhotoReview: builder.query<PhotoReviewApi, string>({
      query: (reviewId) => `/manager/photo-reviews/${encodeURIComponent(reviewId)}`,
      providesTags: (_res, _err, id) => [{ type: "photoReviews" as never, id }],
    }),
    approvePhotoReview: builder.mutation<string, string>({
      query: (reviewId) => ({
        url: `/manager/photo-reviews/${encodeURIComponent(reviewId)}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["photoReviews" as never],
    }),
    rejectPhotoReview: builder.mutation<string, { reviewId: string; reason: string }>({
      query: ({ reviewId, reason }) => ({
        url: `/manager/photo-reviews/${encodeURIComponent(reviewId)}/reject`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { reason },
      }),
      invalidatesTags: ["photoReviews" as never],
    }),
  }),
});

export const {
  useGetPhotoReviewsQuery,
  useGetPhotoReviewQuery,
  useApprovePhotoReviewMutation,
  useRejectPhotoReviewMutation,
} = photoReviewsApi;
