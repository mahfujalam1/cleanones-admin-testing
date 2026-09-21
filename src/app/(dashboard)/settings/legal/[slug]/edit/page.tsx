"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdArrowBack, MdCheckCircle, MdHistory, MdSave, MdWarningAmber } from "react-icons/md";
import { isLegalSlug, legalDocuments, legalLabelKeys, legalStorageKey } from "@/lib/legal-content";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import { usePathname } from "next/navigation";
import { RichTextEditor } from "@/components/legal/RichTextEditor";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetLegalDocumentQuery,
  useSaveLegalDocumentMutation,
} from "@/redux/api/endpoints/legal.api";
import { apiError } from "@/redux/api/apiError";


function documentStats(html: string) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  return {
    words,
    characters: text.length,
    
    minutes: Math.max(1, Math.round(words / 220)),
    empty: text.length === 0,
  };
}

const formatTime = (value: number) => new Date(value).toLocaleString();

export default function EditLegalDocumentPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const valid = isLegalSlug(slug);
  const fallback = valid ? legalDocuments[slug] : null;
  const ui = getUiTranslation(getLocale(usePathname()));
  const labels = valid ? legalLabelKeys[slug] : null;

  const [content, setContent] = useState("");
  
  const [documentId, setDocumentId] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(0);
  const [recoverable, setRecoverable] = useState<{ html: string; savedAt: number } | null>(null);
  
  const [editorKey, setEditorKey] = useState(0);

  
  const publishedRef = useRef("");
  const storageKey = valid ? legalStorageKey(slug) : "";

  const {
    data: document,
    isLoading: loading,
    error: loadError,
  } = useGetLegalDocumentQuery(valid ? slug : skipToken);
  const [saveLegalDocument, { isLoading: saving }] = useSaveLegalDocumentMutation();

  useEffect(() => {
    if (loadError) setError(apiError(loadError));
  }, [loadError]);

  useEffect(() => {
    if (!document) return;
    setContent(document.content);
    setDocumentId(document.id);
    publishedRef.current = document.content;

    
    try {
      const stored = storageKey ? localStorage.getItem(storageKey) : null;
      if (stored) {
        const draft = JSON.parse(stored) as { html?: string; savedAt?: number };
        if (draft.html && draft.html !== document.content) {
          setRecoverable({ html: draft.html, savedAt: draft.savedAt ?? 0 });
        } else if (storageKey) {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      
    }
  }, [document, storageKey]);

  const onEditorChange = useCallback((html: string) => {
    setContent(html);
    setDirty(html !== publishedRef.current);
  }, []);

  
  useEffect(() => {
    if (!dirty || !storageKey) return;
    const timer = window.setTimeout(() => {
      try {
        const savedAt = Date.now();
        localStorage.setItem(storageKey, JSON.stringify({ html: content, savedAt }));
        setDraftSavedAt(savedAt);
      } catch {
        
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [content, dirty, storageKey]);

  
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const stats = useMemo(() => documentStats(content), [content]);

  const update = useCallback(async () => {
    if (saving || loading || !valid) return;
    if (documentStats(content).empty) {
      setError(ui.documentIsEmpty);
      return;
    }
    setError("");
    try {
      await saveLegalDocument({ slug, id: documentId || undefined, content }).unwrap();
    } catch (cause) {
      setError(apiError(cause));
      return;
    }
    publishedRef.current = content;
    setDirty(false);
    try {
      if (storageKey) localStorage.removeItem(storageKey);
    } catch {}
    router.push(`/settings/legal/${slug}`);
  }, [content, documentId, loading, router, saveLegalDocument, saving, slug, storageKey, valid, ui.documentIsEmpty]);

  
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void update();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [update]);

  const leave = () => {
    if (dirty && !window.confirm(ui.leaveWithoutPublishing)) return;
    router.push(`/settings/legal/${slug}`);
  };

  if (!fallback || !valid) return null;

  return (
    <div className="w-full space-y-3 pb-6">
      <header className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <button
            onClick={leave}
            className="mb-2 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-slate-500 transition-colors hover:text-sky-600"
          >
            <MdArrowBack /> {ui.backToDocument}
          </button>
          <h1 className="text-xl font-semibold text-slate-800">{ui.editDocument} — {labels ? ui[labels.title] : ""}</h1>
          <p className="mt-1 text-xs text-slate-500">{labels ? ui[labels.subtitle] : ""}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {dirty ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
              <MdWarningAmber className="text-sm" /> {ui.unsavedChanges}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              <MdCheckCircle className="text-sm" /> {ui.publishedVersion}
            </span>
          )}
        </div>
      </header>

      {recoverable && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900">
          <span className="inline-flex items-center gap-2">
            <MdHistory className="text-base text-sky-600" />
            {ui.draftFound} ({formatTime(recoverable.savedAt)})
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                try {
                  if (storageKey) localStorage.removeItem(storageKey);
                } catch {}
                setRecoverable(null);
              }}
              className="cursor-pointer rounded border border-sky-200 bg-white px-3 py-1 font-semibold text-sky-700 transition-colors hover:bg-sky-100/60"
            >
              {ui.discard}
            </button>
            <button
              onClick={() => {
                const draft = recoverable.html;
                setContent(draft);
                setDirty(draft !== publishedRef.current);
                setEditorKey((current) => current + 1);
                setRecoverable(null);
              }}
              className="cursor-pointer rounded bg-sky-600 px-3 py-1 font-semibold text-white transition-colors hover:bg-sky-700"
            >
              {ui.restoreDraft}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <section className="w-full space-y-3">


        {loading ? (
          <div className="min-h-[560px] animate-pulse rounded-lg border border-slate-200 bg-white" />
        ) : (
          <RichTextEditor
            key={`${slug}-${editorKey}`}
            initialContent={content}
            onChange={onEditorChange}
          />
        )}

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">{stats.words.toLocaleString()} {ui.words}</span>
            <span className="text-slate-300">•</span>
            <span>{stats.characters.toLocaleString()} {ui.characters}</span>
            <span className="text-slate-300">•</span>
            <span>~{stats.minutes} {ui.minRead}</span>
            {draftSavedAt > 0 && dirty && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">Draft kept on this device at {formatTime(draftSavedAt)}</span>
              </>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={leave}
              className="h-9 cursor-pointer rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              {ui.cancel}
            </button>
            <button
              onClick={() => void update()}
              disabled={saving || loading || !dirty}
              title="Ctrl + S"
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdSave /> {saving ? ui.publishing : ui.publishChanges}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
