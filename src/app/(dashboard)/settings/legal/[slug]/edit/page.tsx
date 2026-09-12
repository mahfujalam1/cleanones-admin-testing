"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack, MdSave } from "react-icons/md";
import { isLegalSlug, legalDocuments, legalTypeForSlug } from "@/lib/legal-content";
import { RichTextEditor } from "@/components/legal/RichTextEditor";
import { getLegalDocument, updateLegalDocument } from "@/services/actions/manager";

export default function EditLegalDocumentPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const valid = isLegalSlug(slug);
  const fallback = valid ? legalDocuments[slug] : null;

  const [title, setTitle] = useState(fallback?.title ?? "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setTitle(result.data.title || legalDocuments[slug].title);
      } else {
        setError(result.error);
      }
    });
    return () => { active = false; };
  }, [slug, valid]);

  if (!fallback || !valid) return null;

  const update = async () => {
    if (!title.trim()) { setError("The document needs a title."); return; }
    setSaving(true);
    setError("");
    const result = await updateLegalDocument(legalTypeForSlug(slug), { title: title.trim(), content });
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    router.push(`/settings/legal/${slug}`);
  };

  return <div className="w-full space-y-4 pb-6">
    <header className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><button onClick={() => router.back()} className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-sky-600 cursor-pointer"><MdArrowBack /> Back to document</button><h1 className="text-xl font-semibold text-slate-800">Edit {fallback.title}</h1><p className="mt-1 text-xs text-slate-500">Format and update the published legal document.</p></div>
      <div className="rounded border border-sky-100 bg-sky-50 px-3 py-2 text-[10px] leading-4 text-sky-700"><b className="block text-[11px]">Draft editor</b>Changes publish when you select Update document.</div>
    </header>

    <section className="w-full space-y-3">
      <label className="block rounded border border-slate-200 bg-white p-3">
        <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">Document title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={loading}
          placeholder={fallback.title}
          className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
        />
      </label>

      {/* Quill is uncontrolled, so it must not mount before the saved document arrives -
          otherwise it keeps the empty first render and saving would wipe the document. */}
      {loading
        ? <div className="min-h-[560px] animate-pulse rounded border border-slate-200 bg-white" />
        : <RichTextEditor key={slug} initialContent={content} onChange={setContent} />}

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-3 flex flex-col gap-3 rounded border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[10px] text-slate-400">{content.replace(/<[^>]*>/g, "").length} characters · HTML formatting enabled</span>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/settings/legal/${slug}`)} className="h-9 rounded border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
          <button onClick={update} disabled={saving || loading} className="flex h-9 items-center gap-1.5 rounded bg-sky-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"><MdSave /> {saving ? "Updating..." : "Update document"}</button>
        </div>
      </div>
    </section>
  </div>;
}
