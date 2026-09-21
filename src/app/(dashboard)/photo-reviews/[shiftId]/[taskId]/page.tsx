"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { PhotoReviewDetail } from "@/components/photoReviews/ReviewDetail";
import { useGetShiftPhotoReviewsQuery } from "@/redux/api/photoReviewsApi";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";
import { getScreenCopy } from "@/lib/screen-copy";

export default function PhotoReviewDetailsPage() {
  const params = useParams<{ shiftId: string; taskId: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocale(pathname);
  const copy = getScreenCopy(locale);
  const date = searchParams.get("date") ?? "";

  const { data: reviews = [], isLoading, error } = useGetShiftPhotoReviewsQuery({
    from: date || undefined,
    to: date || undefined,
    status: "all",
  });

  const review = reviews.find(
    (item) => item.shift_id === params.shiftId && item.task_id === params.taskId,
  );
  const goBack = () => router.push(localizePath("/photo-reviews", locale));

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
        {copy.loadingPhotoReview}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-700">{apiError(error)}</p>
        <button type="button" onClick={goBack} className="mt-3 text-xs font-semibold text-red-700 underline">
          {copy.backToPhotoReviews}
        </button>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-slate-700">{copy.photoReviewNotFound}</p>
        <button type="button" onClick={goBack} className="mt-3 text-xs font-semibold text-primary hover:underline">
          {copy.backToPhotoReviews}
        </button>
      </div>
    );
  }

  return <PhotoReviewDetail task={review} onClose={goBack} />;
}
