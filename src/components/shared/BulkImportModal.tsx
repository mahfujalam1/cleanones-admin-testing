"use client";

import React from "react";
import { MdCheckCircle, MdClose, MdDownload, MdUploadFile } from "react-icons/md";
import { getLocationImportTemplate, importLocations } from "@/services/actions/locations";
import { getWorkerImportTemplate, importWorkers } from "@/services/actions/workers";

export function BulkImportModal({ onClose, mode, onImported }: { onClose: () => void; mode?: "locations" | "workers"; onImported?: () => void }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [done, setDone] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const runImport = async () => { if (!file || !mode) return setDone(true); setLoading(true); const result = mode === "workers" ? await importWorkers(file) : await importLocations(file); setLoading(false); if (!result.success) return setMessage(result.error); setMessage(`Imported ${result.data.imported_count} of ${result.data.total_rows}. Failed: ${result.data.failed_count}${result.data.errors.length ? ` — ${result.data.errors.join(", ")}` : ""}`); setDone(true); };
  const downloadTemplate = async () => { if (!mode) return; const result = mode === "workers" ? await getWorkerImportTemplate() : await getLocationImportTemplate(); if (!result.success) return setMessage(result.error); const link = document.createElement("a"); if (/^https?:\/\//.test(result.data)) link.href = result.data; else link.href = URL.createObjectURL(new Blob([result.data], { type: "text/csv" })); link.download = `${mode}-import-template.csv`; link.click(); };
  return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
    <div onMouseDown={e => e.stopPropagation()} className="w-full max-w-lg rounded-md bg-white p-6 shadow">
      <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Bulk import data</h2><p className="mt-1 text-sm text-slate-500">Upload employees, clients and locations in one file.</p></div><button onClick={onClose} className="rounded p-2 hover:bg-slate-100"><MdClose /></button></div>
      {done ? <div className="my-6 text-center"><MdCheckCircle className="mx-auto text-4xl text-emerald-500" /><h3 className="mt-3 font-bold">File ready for import</h3><p className="mt-1 text-sm text-slate-500">{file?.name} passed the initial validation.</p></div> : <>
        <label className="my-5 flex min-h-44 flex-col items-center justify-center rounded border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:border-sky-400">
          <MdUploadFile className="text-3xl text-sky-500" /><span className="mt-2 text-sm font-bold">{file ? file.name : "Choose a CSV or Excel file"}</span><span className="mt-1 text-xs text-slate-500">One row per record · maximum 10 MB</span>
          <input type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button onClick={downloadTemplate} className="flex items-center gap-2 text-xs font-semibold text-sky-600"><MdDownload /> Download import template</button>
      </>}
      {message && <p className="mt-3 text-xs text-slate-600">{message}</p>}
      <div className="mt-6 flex justify-end gap-2 border-t pt-4"><button onClick={onClose} className="rounded border px-4 py-2 text-sm font-semibold">Cancel</button>{!done && <button disabled={!file || loading} onClick={runImport} className="rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{loading ? "Importing..." : "Validate & import"}</button>}{done && <button onClick={onImported ?? onClose} className="rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white">Done</button>}</div>
    </div>
  </div>;
}
