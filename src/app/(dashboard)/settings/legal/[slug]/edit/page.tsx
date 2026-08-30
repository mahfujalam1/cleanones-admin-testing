"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack, MdSave } from "react-icons/md";
import { isLegalSlug, legalDocuments } from "@/lib/legal-content";
import { RichTextEditor } from "@/components/legal/RichTextEditor";
import { getLegalDocument, updateLegalDocument } from "@/services/actions/manager";

export default function EditLegalDocumentPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const valid = isLegalSlug(slug);
  const document = valid ? legalDocuments[slug] : null;
  const [content, setContent] = useState(document?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!valid) return;
    const type = slug === "privacy-policy" ? "privacy_policy" : "terms_and_conditions";
    void getLegalDocument(type).then((result) => { if (result.success) setContent(result.data.content); else setError(result.error); });
  }, [slug, valid]);

  if (!document || !valid) return null;
  const update = async () => {
    setSaving(true); setError("");
    const type = slug === "privacy-policy" ? "privacy_policy" : "terms_and_conditions";
    const result = await updateLegalDocument(type, { title: document.title, content });
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    router.push(`/settings/legal/${slug}`);
  };

  return <div className="w-full space-y-4 pb-6">
    <header className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><button onClick={() => router.back()} className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-sky-600"><MdArrowBack /> Back to document</button><h1 className="text-xl font-semibold text-slate-800">Edit {document.title}</h1><p className="mt-1 text-xs text-slate-500">Format and update the published legal document.</p></div>
      <div className="rounded border border-sky-100 bg-sky-50 px-3 py-2 text-[10px] leading-4 text-sky-700"><b className="block text-[11px]">Draft editor</b>Changes publish when you select Update document.</div>
    </header>
    <section className="w-full">
      <RichTextEditor initialContent={content} onChange={setContent} />
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      <div className="mt-3 flex flex-col gap-3 rounded border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[10px] text-slate-400">{content.replace(/<[^>]*>/g, "").length} characters · HTML formatting enabled</span>
        <div className="flex gap-2">
        <button onClick={() => router.push(`/settings/legal/${slug}`)} className="h-9 rounded border border-slate-200 px-4 text-xs font-semibold text-slate-600">Cancel</button>
        <button onClick={update} disabled={saving} className="flex h-9 items-center gap-1.5 rounded bg-sky-500 px-4 text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-60"><MdSave /> {saving ? "Updating..." : "Update document"}</button>
        </div>
      </div>
    </section>
  </div>;
}
