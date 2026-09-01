"use client";

import React, { useState, useEffect } from 'react';
import {
  MdOutlineClose,
  MdCheckCircle,
  MdCancel,
  MdSearch,
  MdEmail,
  MdPhone,
  MdAttachMoney,
  MdInsertDriveFile,
  MdOpenInNew,
  MdHourglassTop,
} from 'react-icons/md';
import {
  getWorkerApprovals,
  approveWorker,
  rejectWorker,
  type PendingApprovalApi,
} from '@/services/actions/workers';

interface PendingApprovalsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_REJECTION_REASONS = [
  'Incomplete documentation or identity verification failed',
  'Invalid phone number or contact information',
  'Duplicate worker registration',
  'Does not meet required qualifications or minimum rate',
];

export function PendingApprovalsModal({ onClose, onSuccess }: PendingApprovalsModalProps) {
  const [approvals, setApprovals] = useState<PendingApprovalApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Approval / Rejection sub-state
  const [actionWorker, setActionWorker] = useState<PendingApprovalApi | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Approve form state
  const [workerType, setWorkerType] = useState<'employee' | 'freelancer'>('freelancer');
  const [position, setPosition] = useState('Cleaner');
  const [baseLocation, setBaseLocation] = useState('Amsterdam-Centrum');
  const [hourlyRate, setHourlyRate] = useState<number>(25);

  // Reject form state
  const [rejectReason, setRejectReason] = useState(PRESET_REJECTION_REASONS[0]);

  // Expanded worker details for viewing files/documents
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError('');
    const res = await getWorkerApprovals(page, 10, 'pending', search || undefined);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to fetch pending approvals');
      return;
    }
    setApprovals(res.data.pending_approvals || []);
    setTotalCount(res.data.total_count || 0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchApprovals();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !actionType) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, actionType]);

  const openApproveDialog = (worker: PendingApprovalApi) => {
    setActionWorker(worker);
    setActionType('approve');
    setWorkerType(worker.worker_type?.toLowerCase() === 'employee' ? 'employee' : 'freelancer');
    setPosition('Cleaner');
    setBaseLocation('Amsterdam-Centrum');
    setHourlyRate(worker.hourly_rate || 25);
    setError('');
  };

  const openRejectDialog = (worker: PendingApprovalApi) => {
    setActionWorker(worker);
    setActionType('reject');
    setRejectReason(PRESET_REJECTION_REASONS[0]);
    setError('');
  };

  const closeActionDialog = () => {
    setActionWorker(null);
    setActionType(null);
  };

  const handleConfirmApprove = async () => {
    if (!actionWorker) return;
    setSubmitting(true);
    setError('');
    const result = await approveWorker(actionWorker.id, {
      worker_type: workerType,
      position: position.trim() || 'Cleaner',
      base_location: baseLocation.trim() || 'Amsterdam-Centrum',
      hourly_rate: Number(hourlyRate) > 0 ? Number(hourlyRate) : 25,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setToastMessage(`Worker "${actionWorker.full_name}" approved successfully!`);
    closeActionDialog();
    void fetchApprovals();
    onSuccess();
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmReject = async () => {
    if (!actionWorker) return;
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await rejectWorker(actionWorker.id, rejectReason.trim());
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setToastMessage(`Worker registration rejected.`);
    closeActionDialog();
    void fetchApprovals();
    onSuccess();
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getInitials = (name: string) => {
    if (!name) return 'W';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
              <MdHourglassTop className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">Pending Worker Approvals</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  {totalCount} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Review and process worker registrations awaiting verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
            <MdCheckCircle className="text-lg text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Error Alert */}
        {error && !actionType && (
          <div className="mx-6 mt-4 flex items-center justify-between rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-800 border border-rose-200">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-600 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter bar inside modal */}
        <div className="flex items-center justify-between gap-4 px-6 pt-4">
          <div className="relative flex-1 max-w-sm">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="text"
              placeholder="Search pending by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={fetchApprovals}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Pending Worker List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
              <p className="text-xs font-medium">Loading pending registrations...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <MdCheckCircle className="text-3xl text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No Pending Approvals</p>
              <p className="text-xs text-slate-500 max-w-xs">
                All worker registration requests have been processed.
              </p>
            </div>
          ) : (
            approvals.map((worker) => (
              <div
                key={worker.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                {/* Worker summary header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {worker.profile_photo ? (
                      <img
                        src={worker.profile_photo}
                        alt={worker.full_name}
                        className="h-12 w-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 font-semibold text-white shadow-sm text-sm">
                        {getInitials(worker.full_name)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{worker.full_name}</h3>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${
                            worker.worker_type === 'employee'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {worker.worker_type || 'Freelancer'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MdEmail className="text-slate-400 text-sm" />
                          {worker.email}
                        </span>
                        {worker.phone && (
                          <span className="flex items-center gap-1">
                            <MdPhone className="text-slate-400 text-sm" />
                            {worker.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MdAttachMoney className="text-slate-400 text-sm" />
                          €{worker.hourly_rate}/hr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() =>
                        setExpandedWorkerId(expandedWorkerId === worker.id ? null : worker.id)
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      {expandedWorkerId === worker.id ? 'Hide Details' : 'View Details'}
                    </button>
                    <button
                      onClick={() => openRejectDialog(worker)}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      <MdCancel className="text-sm" />
                      Reject
                    </button>
                    <button
                      onClick={() => openApproveDialog(worker)}
                      className="flex items-center gap-1 rounded-lg bg-[#0ea5e9] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0284c7] transition-colors"
                    >
                      <MdCheckCircle className="text-sm" />
                      Approve
                    </button>
                  </div>
                </div>

                {/* Expanded Details section */}
                {expandedWorkerId === worker.id && (
                  <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600 space-y-3 bg-slate-50/50 rounded-lg p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Registered On
                        </span>
                        <span className="font-medium text-slate-800">
                          {new Date(worker.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Nationality
                        </span>
                        <span className="font-medium text-slate-800">
                          {worker.nationality || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Date of Birth
                        </span>
                        <span className="font-medium text-slate-800">
                          {worker.dob || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Status
                        </span>
                        <span className="font-medium text-amber-600 capitalize">
                          {worker.approval_status}
                        </span>
                      </div>
                    </div>

                    {/* Documents & Identification */}
                    <div className="pt-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-2">
                        Attached Documents & Verification
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {worker.id_card_front ? (
                          <a
                            href={worker.id_card_front}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-sky-600 font-medium hover:border-sky-300"
                          >
                            <MdInsertDriveFile className="text-sm" />
                            ID Front
                            <MdOpenInNew className="text-xs text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No ID Front uploaded</span>
                        )}

                        {worker.id_card_back && (
                          <a
                            href={worker.id_card_back}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-sky-600 font-medium hover:border-sky-300"
                          >
                            <MdInsertDriveFile className="text-sm" />
                            ID Back
                            <MdOpenInNew className="text-xs text-slate-400" />
                          </a>
                        )}

                        {worker.certificates && worker.certificates.length > 0
                          ? worker.certificates.map((cert, idx) => (
                              <a
                                key={idx}
                                href={cert}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-sky-600 font-medium hover:border-sky-300"
                              >
                                <MdInsertDriveFile className="text-sm" />
                                Cert {idx + 1}
                                <MdOpenInNew className="text-xs text-slate-400" />
                              </a>
                            ))
                          : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {approvals.length} of {totalCount} requests
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Approve Sub-Dialog */}
      {actionType === 'approve' && actionWorker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MdCheckCircle className="text-emerald-500 text-xl" />
                Approve Worker Registration
              </h3>
              <button onClick={closeActionDialog} className="text-slate-400 hover:text-slate-600">
                <MdOutlineClose className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Set details for <span className="font-bold text-slate-900">{actionWorker.full_name}</span> before approving into the system:
            </p>

            {error && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Worker Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkerType('employee')}
                    className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                      workerType === 'employee'
                        ? 'border-sky-500 bg-sky-50 text-sky-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerType('freelancer')}
                    className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                      workerType === 'freelancer'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Freelancer
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Position Title</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Cleaner, Specialist Cleaner"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Location</label>
                <input
                  type="text"
                  value={baseLocation}
                  onChange={(e) => setBaseLocation(e.target.value)}
                  placeholder="e.g. Amsterdam-Centrum"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hourly Rate (€/hr)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="1000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={closeActionDialog}
                disabled={submitting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-[#0ea5e9] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0284c7] disabled:opacity-50"
              >
                {submitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Sub-Dialog */}
      {actionType === 'reject' && actionWorker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-rose-600">
                <MdCancel className="text-rose-500 text-xl" />
                Reject Worker Registration
              </h3>
              <button onClick={closeActionDialog} className="text-slate-400 hover:text-slate-600">
                <MdOutlineClose className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide a reason for rejecting <span className="font-bold text-slate-900">{actionWorker.full_name}</span>:
            </p>

            {error && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Preset Reason</label>
                <div className="space-y-1.5">
                  {PRESET_REJECTION_REASONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className={`w-full text-left rounded-lg border p-2 text-xs transition-all ${
                        rejectReason === preset
                          ? 'border-rose-300 bg-rose-50 text-rose-800 font-medium'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or enter custom reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason details..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={closeActionDialog}
                disabled={submitting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
