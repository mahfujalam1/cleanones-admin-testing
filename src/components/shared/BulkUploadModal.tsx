"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MdOutlineClose,
  MdCloudUpload,
  MdDownload,
  MdCheckCircle,
  MdErrorOutline,
  MdInsertDriveFile,
  MdRefresh,
} from "react-icons/md";
import { useModalJump } from "@/hooks/useModalJump";
import { apiError } from "@/redux/api/apiError";
import type { BulkUploadResult } from "@/redux/api/endpoints/clients.api";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export type BulkUploadColumn = {
  name: string;
  required: boolean;
  notes?: string;
};

type BulkUploadModalProps = {
  title: string;
  entityName: string;
  columns: BulkUploadColumn[];
  sampleCsvFilename: string;
  sampleCsvContent: string;
  notes?: string[];
  onUpload: (formData: FormData) => Promise<BulkUploadResult>;
  onClose: () => void;
};

export function BulkUploadModal({
  title,
  entityName,
  columns,
  sampleCsvFilename,
  sampleCsvContent,
  notes,
  onUpload,
  onClose,
}: BulkUploadModalProps) {
  const { triggerJump, jumpClassName } = useModalJump();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !uploading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, uploading]);

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent.trim() + "\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sampleCsvFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateAndSelectFile = (file: File) => {
    setFileError("");
    setResult(null);

    const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
    if (!isCsv) {
      setFileError("Only .csv files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File is too large. Maximum allowed size is 2 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelectFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelectFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError("Please select a CSV file to upload.");
      return;
    }

    setFileError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await onUpload(formData);
      setResult(res);
    } catch (err) {
      setFileError(apiError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !uploading) triggerJump();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Import multiple {entityName.toLowerCase()} at once using a CSV file
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {result ? (
            /* Results View */
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 ${
                  result.failed_count === 0
                    ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                    : result.created_count > 0
                    ? "border-amber-200 bg-amber-50/70 text-amber-900"
                    : "border-red-200 bg-red-50/70 text-red-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {result.failed_count === 0 ? (
                    <MdCheckCircle className="text-2xl text-emerald-600 shrink-0" />
                  ) : (
                    <MdErrorOutline className="text-2xl text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">
                      {result.failed_count === 0
                        ? `All ${result.created_count} ${entityName.toLowerCase()} created successfully!`
                        : `${result.created_count} of ${result.total} ${entityName.toLowerCase()} created`}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {result.failed_count === 0
                        ? "Your roster has been updated."
                        : `${result.failed_count} row(s) encountered validation or duplication issues.`}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-3 text-center">
                  <div className="rounded-lg bg-white/80 p-2 shadow-2xs">
                    <p className="text-[11px] font-medium text-slate-500">Total Rows</p>
                    <p className="text-base font-bold text-slate-800">{result.total}</p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-2 shadow-2xs">
                    <p className="text-[11px] font-medium text-emerald-600">Created</p>
                    <p className="text-base font-bold text-emerald-700">{result.created_count}</p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-2 shadow-2xs">
                    <p className="text-[11px] font-medium text-red-600">Failed</p>
                    <p className="text-base font-bold text-red-700">{result.failed_count}</p>
                  </div>
                </div>
              </div>

              {/* Failed Rows Detail */}
              {result.failed.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Failed Rows ({result.failed.length})
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Row numbers correspond to your CSV (row 1 is header)
                    </span>
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 border-b border-slate-200 bg-slate-100 text-[11px] font-semibold text-slate-600">
                        <tr>
                          <th className="px-3 py-2 w-16">Row</th>
                          <th className="px-3 py-2 w-48">Email</th>
                          <th className="px-3 py-2">Error / Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {result.failed.map((fail, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono font-medium text-slate-700">
                              #{fail.row}
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-900 truncate max-w-[12rem]">
                              {fail.email || "—"}
                            </td>
                            <td className="px-3 py-2 text-red-600 font-medium">
                              {fail.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Tip: Correct the failed rows in your CSV and re-upload. Already created emails will fail as duplicates and won&apos;t be duplicated.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Upload Form View */
            <div className="space-y-4">
              {/* Sample Template & Guidelines */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-sky-100 bg-sky-50/60 p-3.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-sky-950">Need a CSV template?</p>
                  <p className="text-[11px] text-sky-700">
                    Download a ready-to-fill sample CSV with the required headers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-2xs hover:bg-sky-50 active:scale-[0.98]"
                >
                  <MdDownload className="text-base text-sky-600" /> Download Sample CSV
                </button>
              </div>

              {/* Drag & Drop File Zone */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : selectedFile
                      ? "border-emerald-400 bg-emerald-50/30"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <MdInsertDriveFile className="text-2xl" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate max-w-xs text-sm font-semibold text-slate-800">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        className="mt-1 text-xs font-medium text-slate-500 hover:text-red-600 underline"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <MdCloudUpload className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          Click to browse or drag and drop your CSV here
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          CSV files up to 2 MB (max 200 data rows)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Notice */}
              {fileError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  <MdErrorOutline className="text-base shrink-0 text-red-500" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Columns & Rules Reference */}
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 text-xs">
                <p className="font-semibold text-slate-800">CSV Columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {columns.map((col) => (
                    <span
                      key={col.name}
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono ${
                        col.required
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                      title={col.notes || (col.required ? "Required" : "Optional")}
                    >
                      {col.name}
                      {col.required && <span className="text-red-500">*</span>}
                    </span>
                  ))}
                </div>

                <div className="mt-2 space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <p>• <span className="font-semibold text-slate-700">Credentials:</span> No email is sent to created users. Hand the passwords from the CSV to them yourself.</p>
                  <p>• <span className="font-semibold text-slate-700">Limits:</span> Max 200 data rows per upload, max file size 2 MB.</p>
                  {notes?.map((note, idx) => (
                    <p key={idx}>• {note}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          {result ? (
            <>
              {result.failed_count > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <MdRefresh className="text-base" /> Upload Another File
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary/90"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading & Processing…
                  </>
                ) : (
                  <>
                    <MdCloudUpload className="text-base" />
                    Upload CSV
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
