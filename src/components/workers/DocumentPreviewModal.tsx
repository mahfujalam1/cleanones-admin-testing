"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdDescription, MdOutlineClose } from 'react-icons/md';
import type { WorkerDocumentFile } from '@/services/actions/workers';

/** Records created before real uploads existed hold placeholder text ("/uploads/string")
 *  rather than a fetchable file, so only absolute URLs are treated as viewable. */
export const isViewable = (url?: string | null) => Boolean(url && /^https?:\/\//i.test(url));
export const fileLabel = (url: string) => decodeURIComponent(url.split('/').pop() || url);
const isImage = (url: string) => /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);
const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

export function DocumentPreviewModal({ file, onClose }: { file: WorkerDocumentFile; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    // Portals still bubble through the React tree, so events are stopped here to keep the
    // dialog underneath this preview (worker sidebar or edit modal) from closing too.
    <div
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => { event.stopPropagation(); onClose(); }}
      className="modal-backdrop fixed inset-0 z-[95] flex items-center justify-center p-4"
    >
      <div onClick={(event) => event.stopPropagation()} className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-white shadow-xl">
        <header className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#e0f2fe] text-[#0ea5e9]">
            <MdDescription className="text-lg" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-gray-900">{file.name}</h3>
            <p className="truncate text-[11px] text-gray-400">{fileLabel(file.url)}</p>
          </div>
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
          >
            Open in new tab
          </a>
          <button type="button" onClick={onClose} className="shrink-0 p-1 text-gray-400 hover:text-gray-700 cursor-pointer" aria-label="Close preview">
            <MdOutlineClose className="text-xl" />
          </button>
        </header>
        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          {isImage(file.url) ? (
            <img src={file.url} alt={file.name} className="mx-auto max-h-[70vh] w-auto rounded border border-gray-200 bg-white object-contain" />
          ) : isPdf(file.url) ? (
            <iframe src={file.url} title={file.name} className="h-[70vh] w-full rounded border border-gray-200 bg-white" />
          ) : (
            <p className="py-16 text-center text-xs text-gray-500">
              This file type cannot be previewed here. Use &quot;Open in new tab&quot; to view it.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
