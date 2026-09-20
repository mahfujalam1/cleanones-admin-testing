"use client";

import React from "react";
import { X, Info, Check, CheckCircle2, XCircle, MinusCircle, LoaderCircle, AlertTriangle } from "lucide-react";
import { MdArrowBack } from "react-icons/md";
import { CleanerAvatar } from "./CleanerAvatar";
import { PhotoReview } from "./types";
import { ScoreBar } from "./Aiscorebar";
import { imgUrl } from "@/utils/baseUrl";
import type { PhotoReviewTask, UploadedPhoto } from "@/redux/api/photoReviewsApi";

interface ReviewDetailProps {
    review: PhotoReview;
    onClose: () => void;
    onApprove: (review: PhotoReview) => void;
    onReject: (review: PhotoReview) => void;
}

const SCORE_ROWS = [
    { label: "Quality Score", key: "qualityScore" as const },
    { label: "Coverage Score", key: "coverageScore" as const },
    { label: "Image Quality Score", key: "imageQualityScore" as const },
    { label: "Brightness Score", key: "brightnessScore" as const },
];

const SUGGESTION_COLOR: Record<string, string> = {
    Approve: "text-emerald-500",
    Reject: "text-red-500",
    Review: "text-amber-500",
};

const apiPhotoStatus = (photo: UploadedPhoto) => {
  if (photo.ai_subject_matches === false) return { label: "Wrong subject", tone: "border-red-200 bg-red-50 text-red-700" };
  if (photo.audit_sampled) return { label: "Spot check", tone: "border-violet-200 bg-violet-50 text-violet-700" };
  if (photo.ai_status === "pending") return { label: "Checking…", tone: "border-sky-200 bg-sky-50 text-sky-700" };
  if (photo.ai_status === "passed") return { label: "Looks good", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (photo.ai_status === "failed") return { label: "Problem found", tone: "border-red-200 bg-red-50 text-red-700" };
  if (photo.ai_status === "review") return { label: "Needs review", tone: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Not checked", tone: "border-slate-200 bg-slate-50 text-slate-600" };
};

export function ReviewDetail({ review, onClose, onApprove, onReject }: ReviewDetailProps) {
    const ai = review.aiAnalysis;

    const displayPhotos = review.photos && review.photos.length > 0
        ? review.photos
        : [
            { label: "Before Cleaning", url: review.beforeImage || null },
            { label: "After Cleaning", url: review.afterImage || null }
        ];

    const isApproved = review.status === "Approved";
    const isRejected = review.status === "Rejected";
    const isProcessed = isApproved || isRejected;

    const STATUS_BADGE_STYLE: Record<string, { bg: string; dot: string }> = {
        "Pending Review": { bg: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
        Approved: { bg: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
        Rejected: { bg: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500" },
    };

    const statusStyle = STATUS_BADGE_STYLE[review.status] ?? STATUS_BADGE_STYLE["Pending Review"];

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Top bar */}
            <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 shrink-0">
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded px-3 py-1.5 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                    Close
                </button>
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-900 truncate">
                        {review.id} — {review.room}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                        {review.client} · {review.location}
                        {review.shiftId && ` · Shift ${review.shiftId}`}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusStyle.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                        {review.status}
                    </span>
                    <span className="hidden sm:block text-xs text-gray-400">{review.dateSubmitted}</span>
                </div>
            </header>

            {/* Body */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left panel */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* Section A — Photo Comparison */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Section A</p>
                            <h3 className="text-base font-bold text-gray-900">Photo Comparison</h3>
                        </div>
                        <div className={`grid gap-4 ${displayPhotos.length === 1 ? "grid-cols-1 max-w-lg mx-auto" : "grid-cols-1 sm:grid-cols-2"}`}>
                            {displayPhotos.map((photo, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    {photo.url ? (
                                        <img
                                            src={photo.url}
                                            alt={photo.label}
                                            className="w-full h-52 sm:h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-full h-52 sm:h-64 bg-slate-50 rounded-lg border border-gray-200 border-dashed flex flex-col items-center justify-center text-slate-400 text-xs">
                                            <span>No image uploaded</span>
                                        </div>
                                    )}
                                    <p className="text-center text-xs font-bold text-slate-700 mt-2 bg-slate-100 px-3 py-1 rounded-full">{photo.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section C — Service Quality Verification */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Section C</p>
                            <h3 className="text-base font-bold text-gray-900">Service Quality Verification</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isApproved
                                    ? "This review has been approved. No further action can be taken."
                                    : isRejected
                                    ? "This review has been rejected. No further action can be taken."
                                    : "Review the photos and AI analysis, then verify the service quality below."}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                disabled={isProcessed}
                                onClick={() => onApprove(review)}
                                className={`flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-sm ${
                                    isApproved
                                        ? "bg-emerald-600/70 text-white cursor-not-allowed opacity-80"
                                        : isRejected
                                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                }`}
                            >
                                <Check className="w-4 h-4" />
                                {isApproved ? "Approved" : "Approve Review"}
                            </button>
                            <button
                                disabled={isProcessed}
                                onClick={() => onReject(review)}
                                className={`flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                                    isRejected
                                        ? "bg-red-600/70 text-white cursor-not-allowed opacity-80"
                                        : isApproved
                                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                        : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer"
                                }`}
                            >
                                <X className="w-4 h-4" />
                                {isRejected ? "Rejected" : "Reject Review"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right panel — AI Analysis */}
                {ai && (
                    <aside className="w-full lg:w-80 xl:w-96 bg-white shadow-sm overflow-y-auto p-5 space-y-5 shrink-0 lg:border-l border-gray-200">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Section B</p>
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-base font-bold text-gray-900">AI Analysis</h3>
                                <Info className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Overall score */}
                        <div className="bg-sky-50/70 border border-sky-100 rounded-lg p-5 text-center">
                            <p className="text-4xl font-extrabold text-[#0ea5e9]">{ai.overallScore}%</p>
                            <p className="text-xs font-semibold text-slate-600 mt-1">Overall Quality Score</p>
                            <p className={`text-xs font-bold mt-2 ${SUGGESTION_COLOR[ai.suggestion] ?? "text-gray-600"}`}>
                                AI suggests: {ai.suggestion}
                            </p>
                        </div>

                        {/* Score breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Score Breakdown</h4>
                            {ai.breakdown && ai.breakdown.length > 0 ? (
                                ai.breakdown.map((item, idx) => (
                                    <ScoreBar key={idx} label={item.label} value={item.score} />
                                ))
                            ) : (
                                SCORE_ROWS.map(({ label, key }) => (
                                    <ScoreBar key={key} label={label} value={ai[key]} />
                                ))
                            )}
                        </div>

                        {/* AI notes */}
                        {ai.notes && ai.notes.length > 0 && (
                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <p className="text-xs font-bold text-slate-700">AI Notes</p>
                                <ul className="space-y-1.5">
                                    {ai.notes.map((note, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                                            &ldquo;{note}&rdquo;
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Submitted by */}
                        <div className="pt-3 border-t border-gray-100">
                            <CleanerAvatar name={review.cleaner.name} />
                            <p className="text-[11px] text-gray-400 mt-1 ml-9">{review.dateSubmitted}</p>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

/**
 * Detail view for a `/shift/photo-review` row: the task's context plus every photo the
 * worker uploaded against its requirements. The endpoint carries no decision or AI data,
 * so this is a read-only gallery.
 */
export function PhotoReviewDetail({
  task,
  onClose,
}: {
  task: PhotoReviewTask;
  onClose: () => void;
}) {
  const photos = task.uploaded_photos ?? [];
  const shiftDate = new Date(task.shift_date);

  return (
    <div className="space-y-4">
      <button
        onClick={onClose}
        className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-sky-600"
      >
        <MdArrowBack /> Back to photo reviews
      </button>

      <header className="rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="text-lg font-bold text-slate-900">{task.task_name}</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {task.room_name} · {task.cleaning_name}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{task.location_name}</dd>
            {task.address && <dd className="text-[11px] text-slate-400">{task.address}</dd>}
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Shift date</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">
              {Number.isNaN(shiftDate.getTime()) ? "—" : shiftDate.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Duration</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{task.duration_minutes}m</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Photos</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{photos.length}</dd>
          </div>
        </dl>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Uploaded photos</h2>
        {photos.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">No photos uploaded for this task.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => {
              const url = photo.photo_url ? imgUrl(photo.photo_url) : null;
              const status = apiPhotoStatus(photo);
              const expandedChecks = photo.ai_status === "failed" || photo.ai_status === "review";
              return (
                <figure
                  key={`${photo.title}-${index}`}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  {photo.forced_accept ? (
                    <div className="flex items-center gap-1.5 border-b border-orange-200 bg-orange-50 px-3 py-2 text-[10px] font-semibold text-orange-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Accepted after 3 retries — look closely
                    </div>
                  ) : null}
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={photo.title}
                        className="h-48 w-full bg-white object-cover transition-opacity hover:opacity-90"
                      />
                    </a>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                  <figcaption className="space-y-3 border-t border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">{photo.title}</span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${status.tone}`}>
                        {status.label}
                      </span>
                    </div>

                    {photo.ai_status === "pending" ? (
                      <p className="flex items-center gap-1.5 text-xs text-sky-700">
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Automatic check in progress
                      </p>
                    ) : null}

                    {photo.ai_status === "error" ? (
                      <p className="text-xs text-slate-500">Automatic check unavailable. Judge this photo manually.</p>
                    ) : null}

                    {photo.ai_score != null || photo.ai_reason ? (
                      <div className="rounded-md bg-slate-50 p-2.5">
                        {photo.ai_score != null ? (
                          <p className="text-lg font-bold text-slate-900">
                            {photo.ai_score}<span className="text-xs font-medium text-slate-400">/100</span>
                          </p>
                        ) : null}
                        {photo.ai_reason ? (
                          <p className={`text-xs leading-5 ${photo.ai_status === "failed" ? "font-semibold text-red-700" : "text-slate-600"}`}>
                            {photo.ai_reason}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {photo.ai_checks?.length ? (
                      <details open={expandedChecks} className="group">
                        <summary className="cursor-pointer list-none text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Verification checks
                        </summary>
                        <ul className="mt-2 space-y-1.5">
                          {photo.ai_checks.map((check, checkIndex) => (
                            <li key={`${check.item}-${checkIndex}`} className="flex items-start gap-2 text-[11px] text-slate-600">
                              {check.passed === true ? (
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              ) : check.passed === false ? (
                                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                              ) : (
                                <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                              )}
                              <span>
                                {check.item}
                                {check.passed === null ? <em className="ml-1 not-italic text-slate-400">— not visible in photo</em> : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}

                    {photo.attempt_count != null || photo.ai_confidence != null ? (
                      <div className="flex items-center gap-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                        {photo.attempt_count != null ? <span>{photo.attempt_count} attempt{photo.attempt_count === 1 ? "" : "s"}</span> : null}
                        {photo.ai_confidence != null ? <span>{Math.round(photo.ai_confidence * 100)}% confidence</span> : null}
                      </div>
                    ) : null}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
