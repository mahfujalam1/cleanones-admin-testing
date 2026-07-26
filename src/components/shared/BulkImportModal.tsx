"use client";

import React from "react";
import { MdCheckCircle, MdClose, MdDownload, MdUploadFile } from "react-icons/md";

export function BulkImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [done, setDone] = React.useState(false);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={onClose}>
    <div onMouseDown={e => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Bulk import data</h2><p className="mt-1 text-sm text-slate-500">Upload employees, clients and locations in one file.</p></div><button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><MdClose /></button></div>
      {done ? <div className="my-8 text-center"><MdCheckCircle className="mx-auto text-5xl text-emerald-500" /><h3 className="mt-3 font-bold">File ready for import</h3><p className="mt-1 text-sm text-slate-500">{file?.name} passed the initial validation.</p></div> : <>
        <label className="my-5 flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:border-sky-400">
          <MdUploadFile className="text-4xl text-sky-500" /><span className="mt-2 text-sm font-bold">{file ? file.name : "Choose a CSV or Excel file"}</span><span className="mt-1 text-xs text-slate-500">One row per record · maximum 10 MB</span>
          <input type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button className="flex items-center gap-2 text-xs font-semibold text-sky-600"><MdDownload /> Download import template</button>
      </>}
      <div className="mt-6 flex justify-end gap-2 border-t pt-4"><button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancel</button>{!done && <button disabled={!file} onClick={() => setDone(true)} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Validate & import</button>}{done && <button onClick={onClose} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white">Done</button>}</div>
    </div>
  </div>;
}
