"use client";
import { use, useState } from "react";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import {
  useGetClientContactsQuery,
  useDeleteClientContactMutation,
} from "@/redux/api/endpoints/clients.api";
import { ClientContactForm } from "@/components/clients/ClientContactForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CardGridSkeleton, ErrorNotice } from "@/components/shared/ListStates";
import { apiError } from "@/redux/api/apiError";

export default function ClientContacts({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading, error } = useGetClientContactsQuery({ clientId: id });
  const [deleteContact, { isLoading: deleting }] = useDeleteClientContactMutation();

  const contacts = data ?? [];

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContact({ clientId: id, contactId: deleteTarget }).unwrap();
      setDeleteTarget(null);
    } catch {
      // RTK Error Notice toast will handle it
    }
  };

  if (isLoading) return <CardGridSkeleton />;
  if (error) return <ErrorNotice message={apiError(error)} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <MdAdd className="text-lg" /> Add contact
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <div key={contact._id} className="relative rounded border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="pr-8">
              <h3 className="font-semibold text-slate-900">{contact.name}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{contact.role}</p>
              <div className="mt-3 space-y-1 text-sm text-slate-500">
                {contact.email && <p>{contact.email}</p>}
                {contact.phone && <p>{contact.phone}</p>}
              </div>
            </div>
            <button
              onClick={() => setDeleteTarget(contact._id)}
              className="absolute right-3 top-3 rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
              title="Remove contact"
            >
              <MdDeleteOutline className="text-lg" />
            </button>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-slate-300 py-10 text-center text-slate-500">
            No contacts found for this client.
          </div>
        )}
      </div>

      {creating && (
        <ClientContactForm clientId={id} onClose={() => setCreating(false)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Contact"
          description="Are you sure you want to remove this contact?"
          confirmText="Remove"
          destructive
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
