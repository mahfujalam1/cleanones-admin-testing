"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack, MdEdit } from "react-icons/md";
import { isLegalSlug, legalDocuments, legalTypeForSlug } from "@/lib/legal-content";
import { getLegalDocument } from "@/services/actions/manager";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";

const formatUpdated = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export default function LegalDocumentPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const valid = isLegalSlug(slug);
  const fallback = valid ? legalDocuments[slug] : null;

  const [title, setTitle] = useState(fallback?.title ?? "");
  const [content, setContent] = useState("");
  const [updated, setUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!valid) return;
    let active = true;
    setLoading(true);
    void getLegalDocument(legalTypeForSlug(slug)).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.success) {
        setContent(result.data.content ?? "");
        setUpdated(result.data.updated_at ?? "");
        setTitle(result.data.title || legalDocuments[slug].title);
        setError("");
      } else {
        setError(result.error);
      }
    });
    return () => { active = false; };
  }, [slug, valid]);

  if (!fallback || !valid) return <div className="rounded border border-slate-200 bg-white p-6"><h1 className="text-lg font-semibold text-slate-800">Document not found</h1><Link href="/settings" className="mt-3 inline-block text-xs font-semibold text-sky-600">Back to settings</Link></div>;

  return <div className="w-full space-y-4 pb-10">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-600"><MdArrowBack /> Settings</Link><h1 className="text-xl font-semibold text-slate-800">{title || fallback.title}</h1><p className="mt-1 text-xs text-slate-500">{fallback.subtitle}</p></div>
      <Link href={`/settings/legal/${slug}/edit`} className="flex h-9 items-center justify-center gap-1.5 rounded border border-sky-500 bg-sky-500 px-4 text-xs font-semibold text-white hover:bg-sky-600"><MdEdit /> Edit</Link>
    </div>

    {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}

    <article className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3 text-[10px] text-slate-500">
        Last updated: {formatUpdated(updated) || "Never"}
      </div>
      {loading ? (
        <div className="p-5"><DetailSkeleton blocks={8} /></div>
      ) : !content.trim() ? (
        <p className="px-5 py-16 text-center text-xs text-slate-400">
          This document is empty. Use Edit to write it.
        </p>
      ) : content.includes("<") ? (
        <div className="legal-document-content px-5 py-5 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="whitespace-pre-wrap px-5 py-5 text-sm leading-7 text-slate-700">{content}</div>
      )}
    </article>
  </div>;
}
