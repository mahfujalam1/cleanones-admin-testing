"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack, MdEdit } from "react-icons/md";
import { isLegalSlug, legalDocuments, legalStorageKey } from "@/lib/legal-content";

export default function LegalDocumentPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const valid = isLegalSlug(slug);
  const document = valid ? legalDocuments[slug] : null;
  const [content, setContent] = useState(document?.content ?? "");
  const [updated, setUpdated] = useState(document?.updated ?? "");

  useEffect(() => {
    if (!valid) return;
    const saved = window.localStorage.getItem(legalStorageKey(slug));
    if (saved) {
      const parsed = JSON.parse(saved) as { content: string; updated: string };
      setContent(parsed.content);
      setUpdated(parsed.updated);
    }
  }, [slug, valid]);

  if (!document || !valid) return <div className="rounded border border-slate-200 bg-white p-6"><h1 className="text-lg font-semibold text-slate-800">Document not found</h1><Link href="/settings" className="mt-3 inline-block text-xs font-semibold text-sky-600">Back to settings</Link></div>;

  return <div className="w-full space-y-4 pb-10">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-600"><MdArrowBack /> Settings</Link><h1 className="text-xl font-semibold text-slate-800">{document.title}</h1><p className="mt-1 text-xs text-slate-500">{document.subtitle}</p></div>
      <Link href={`/settings/legal/${slug}/edit`} className="flex h-9 items-center justify-center gap-1.5 rounded border border-sky-500 bg-sky-500 px-4 text-xs font-semibold text-white hover:bg-sky-600"><MdEdit /> Edit</Link>
    </div>
    <article className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3 text-[10px] text-slate-500">Last updated: {updated}</div>
      {content.includes("<") ? <div className="legal-document-content px-5 py-5 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: content }} /> : <div className="whitespace-pre-wrap px-5 py-5 text-sm leading-7 text-slate-700">{content}</div>}
    </article>
  </div>;
}
