"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  MdAdd,
  MdBlock,
  MdCheckCircle,
  MdEdit,
  MdSearch,
  MdContentCopy,
  MdCheck,
  MdPerson,
  MdClose,
} from "react-icons/md";
import {
  useGetAllManagersQuery,
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useBlockManagerMutation,
  useUnblockManagerMutation,
  type CompanyManager,
  type CreateManagerRequest,
  type UpdateManagerRequest,
  managerPhoto,
} from "@/redux/api/endpoints/manager.api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { apiError } from "@/redux/api/apiError";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation, getUiTranslation } from "@/lib/translations";

const LIMIT = 10;

export default function ManagersPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);
  const tm = t.managers || {
    title: "Managers",
    subtitle: "Create, view and manage managers in your company.",
    addManager: "Add Manager",
    searchPlaceholder: "Search managers by name, email or phone...",
    failedToLoad: "Failed to load managers.",
    tryAgain: "Try Again",
    noManagersFound: "No managers found",
    noManagersMatch: "No managers matched your search query.",
    noManagersCompany: "You have not added any managers to your company yet.",
    createFirstManager: "Create your first manager",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    status: "Status",
    actions: "Actions",
    active: "Active",
    blocked: "Blocked",
    editManager: "Edit Manager",
    blockManager: "Block Manager",
    unblockManager: "Unblock Manager",
    addNewManager: "Add New Manager",
    nameRequired: "Name *",
    emailRequired: "Email *",
    phoneRequired: "Phone *",
    addressLabel: "Address",
    passwordRequired: "Password *",
    confirmPasswordRequired: "Confirm Password *",
    enterFullName: "Enter full name",
    enterEmail: "Enter email",
    enterPhone: "Enter phone",
    enterAddress: "Enter address",
    enterPassword: "Enter password (min 8 chars)",
    enterConfirmPassword: "Enter confirm password",
    cancel: "Cancel",
    createManager: "Create Manager",
    creating: "Creating...",
    emailReadOnly: "Email (Read-only)",
    saveChanges: "Save Changes",
    saving: "Saving...",
    createdSuccessfully: "Manager Created Successfully!",
    saveCredentialsNotice: "Save these login credentials now. Pass them to the manager to log in.",
    copyCredentials: "Copy Credentials",
    copied: "Copied",
    done: "Done",
    blockTitle: "Block Manager",
    blockDesc: "Are you sure you want to block {name}? They will no longer be able to log in, but their business records will remain preserved.",
    unblockTitle: "Unblock Manager",
    unblockDesc: "Are you sure you want to unblock {name}? They will regain access to their dashboard.",
    managerProfile: "Manager Profile",
    passwordMinLength: "Password must be at least 8 characters long.",
    passwordsDoNotMatch: "Passwords do not match.",
    failedToCreate: "Failed to create manager.",
    failedToUpdate: "Failed to update manager.",
    allManagers: "All Managers",
    filterByManager: "Filter by Manager",
    loadingManagers: "Loading managers...",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const { data, isLoading, isError, refetch } = useGetAllManagersQuery({
    page,
    limit: LIMIT,
    searchTerm: debouncedSearch || undefined,
  });

  const [createManager, { isLoading: isCreating }] = useCreateManagerMutation();
  const [updateManager, { isLoading: isUpdating }] = useUpdateManagerMutation();
  const [blockManager, { isLoading: isBlocking }] = useBlockManagerMutation();
  const [unblockManager, { isLoading: isUnblocking }] = useUnblockManagerMutation();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<CompanyManager | null>(null);
  const [blockingManager, setBlockingManager] = useState<CompanyManager | null>(null);
  const [unblockingManager, setUnblockingManager] = useState<CompanyManager | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; name: string } | null>(null);

  // Success credentials modal state
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateManagerRequest>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [editForm, setEditForm] = useState<UpdateManagerRequest>({
    id: "",
    name: "",
    phone: "",
    address: "",
  });

  const handleOpenCreate = () => {
    setFormError(null);
    setCreateForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (createForm.password.length < 8) {
      setFormError(tm.passwordMinLength);
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      setFormError(tm.passwordsDoNotMatch);
      return;
    }

    try {
      await createManager(createForm).unwrap();
      const savedCreds = { email: createForm.email, password: createForm.password };
      setIsCreateOpen(false);
      setCreatedCredentials(savedCreds);
    } catch (err: unknown) {
      setFormError(apiError(err) || tm.failedToCreate);
    }
  };

  const handleOpenEdit = (manager: CompanyManager) => {
    setFormError(null);
    setEditingManager(manager);
    setEditForm({
      id: manager._id,
      name: manager.name,
      phone: manager.phone,
      address: manager.address || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    setFormError(null);

    try {
      await updateManager(editForm).unwrap();
      setEditingManager(null);
    } catch (err: unknown) {
      setFormError(apiError(err) || tm.failedToUpdate);
    }
  };

  const handleConfirmBlock = async () => {
    if (!blockingManager) return;
    try {
      await blockManager(blockingManager._id).unwrap();
      setBlockingManager(null);
    } catch {
      // error handled by UI
    }
  };

  const handleConfirmUnblock = async () => {
    if (!unblockingManager) return;
    try {
      await unblockManager(unblockingManager._id).unwrap();
      setUnblockingManager(null);
    } catch {
      // error handled by UI
    }
  };

  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const managersList = data?.result || [];
  const totalItems = data?.meta?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{tm.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {tm.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <MdAdd className="text-lg" />
          <span>{tm.addManager}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder={tm.searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500">{tm.failedToLoad}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              {tm.tryAgain}
            </button>
          </div>
        ) : managersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <MdPerson className="text-2xl" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{tm.noManagersFound}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm
                ? tm.noManagersMatch
                : tm.noManagersCompany}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
              >
                <MdAdd className="text-lg" />
                <span>{tm.createFirstManager}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">{tm.name}</th>
                  <th scope="col" className="px-6 py-3.5">{tm.email}</th>
                  <th scope="col" className="px-6 py-3.5">{tm.phone}</th>
                  <th scope="col" className="px-6 py-3.5">{tm.address}</th>
                  <th scope="col" className="px-6 py-3.5">{tm.status}</th>
                  <th scope="col" className="px-6 py-3.5 text-right">{tm.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managersList.map((mgr) => {
                  const isBlocked = Boolean(mgr.user?.isBlocked);
                  return (
                    <tr key={mgr._id} className="transition-colors hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                        {(() => {
                          const photo = managerPhoto(mgr);
                          return (
                            <div className="flex items-center gap-3">
                              {photo ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewPhoto({ url: photo, name: mgr.name })}
                                  className="group/avatar shrink-0 cursor-pointer rounded-full transition hover:scale-105 hover:ring-2 hover:ring-primary/40 focus:outline-none"
                                  title={photo ? `${tm.editManager}: ${mgr.name}` : mgr.name}
                                >
                                  <img
                                    src={photo}
                                    alt={mgr.name}
                                    className="h-8 w-8 shrink-0 rounded-full border border-gray-200 object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/avatar-placeholder.svg";
                                    }}
                                  />
                                </button>
                              ) : (
                                <img
                                  src="/avatar-placeholder.svg"
                                  alt={mgr.name}
                                  className="h-8 w-8 shrink-0 rounded-full border border-gray-200 object-cover"
                                />
                              )}
                              <span>{mgr.name}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{mgr.email}</td>
                      <td className="whitespace-nowrap px-6 py-4">{mgr.phone}</td>
                      <td className="px-6 py-4">{mgr.address || "—"}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                            {tm.blocked}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            {tm.active}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(mgr)}
                            title={tm.editManager}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <MdEdit className="text-lg" />
                          </button>
                          {isBlocked ? (
                            <button
                              type="button"
                              onClick={() => setUnblockingManager(mgr)}
                              title={tm.unblockManager}
                              className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                            >
                              <MdCheckCircle className="text-lg" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBlockingManager(mgr)}
                              title={tm.blockManager}
                              className="rounded p-1.5 text-red-500 hover:bg-red-50"
                            >
                              <MdBlock className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalItems > LIMIT && (
          <div className="border-t border-slate-200 px-6 py-4">
            <BackendPagination
              page={page}
              limit={LIMIT}
              total={totalItems}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Create Manager Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">{tm.addNewManager}</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4 px-6 py-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.nameRequired}</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder={tm.enterFullName}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.emailRequired}</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder={tm.enterEmail}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.phoneRequired}</label>
                <input
                  type="tel"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder={tm.enterPhone}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.addressLabel}</label>
                <input
                  type="text"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  placeholder={tm.enterAddress}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">{tm.passwordRequired}</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder={tm.enterPassword}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">{tm.confirmPasswordRequired}</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={createForm.confirmPassword}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, confirmPassword: e.target.value })
                    }
                    placeholder={tm.enterConfirmPassword}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {ui.cancel || tm.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCreating ? tm.creating : tm.createManager}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Modal */}
      {editingManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">{tm.editManager}</h3>
              <button
                type="button"
                onClick={() => setEditingManager(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4 px-6 py-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.emailReadOnly}</label>
                <input
                  type="email"
                  disabled
                  value={editingManager.email}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.name}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder={tm.enterFullName}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.phone}</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder={tm.enterPhone}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">{tm.addressLabel}</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder={tm.enterAddress}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingManager(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {ui.cancel || tm.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUpdating ? tm.saving : tm.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Created Notification Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <MdCheckCircle className="text-2xl" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {tm.createdSuccessfully}
                </h3>
                <p className="text-xs text-slate-500">
                  {tm.saveCredentialsNotice}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{tm.email}:</span>
                <span className="font-mono text-slate-900">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{tm.passwordRequired.replace(" *", "")}:</span>
                <span className="font-mono text-slate-900">{createdCredentials.password}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={copyCredentials}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {copied ? <MdCheck className="text-emerald-600 text-base" /> : <MdContentCopy className="text-base" />}
                <span>{copied ? tm.copied : tm.copyCredentials}</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                {tm.done}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Dialog */}
      {blockingManager && (
        <ConfirmDialog
          title={tm.blockTitle}
          description={tm.blockDesc.replace("{name}", blockingManager?.name || "")}
          confirmText={tm.blockManager}
          destructive
          loading={isBlocking}
          onClose={() => setBlockingManager(null)}
          onConfirm={handleConfirmBlock}
        />
      )}

      {/* Unblock Confirmation Dialog */}
      {unblockingManager && (
        <ConfirmDialog
          title={tm.unblockTitle}
          description={tm.unblockDesc.replace("{name}", unblockingManager?.name || "")}
          confirmText={tm.unblockManager}
          destructive={false}
          loading={isUnblocking}
          onClose={() => setUnblockingManager(null)}
          onConfirm={handleConfirmUnblock}
        />
      )}

      {/* Profile Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative flex max-w-xs flex-col items-center rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <MdClose className="text-lg" />
            </button>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.name}
              className="h-40 w-40 rounded-full border-2 border-slate-200 object-cover shadow-xs"
            />
            <h3 className="mt-3.5 text-base font-semibold text-slate-900">{previewPhoto.name}</h3>
            <p className="text-xs text-slate-500">{tm.managerProfile}</p>
          </div>
        </div>
      )}
    </div>
  );
}
