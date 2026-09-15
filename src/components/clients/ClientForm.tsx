"use client";

import { useState } from "react";
import { FormModal } from "@/components/shared/FormModal";
import { DateField, TextField } from "@/components/shared/Field";
import { apiError } from "@/redux/api/apiError";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import {
  useCreateClientMutation,
  clientLabel,
  useUpdateClientMutation,
  type Client,
} from "@/redux/api/endpoints/clients.api";

/** `2026-09-12T09:00:00.000Z` → `2026-09-12`, which is what a date input wants. */
const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

type Draft = {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  licence_expiration_date: string;
  password: string;
  confirmPassword: string;
};

const emptyDraft: Draft = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  licence_expiration_date: "",
  password: "",
  confirmPassword: "",
};

const draftFrom = (client: Client): Draft => ({
  ...emptyDraft,
  name: client.name ?? "",
  email: client.email,
  phone: client.phone,
  company_name: client.company_name ?? "",
  licence_expiration_date: toDateInput(client.licence_expiration_date),
});

/**
 * One form for both creating and editing a client.
 *
 * Creating also provisions the client's login and emails the credentials, so a password is
 * collected then and only then — the update endpoint does not accept one.
 */
export function ClientForm({ client, onClose }: { client?: Client; onClose: () => void }) {
  const isEdit = client !== undefined;
  const [draft, setDraft] = useState<Draft>(() => (client ? draftFrom(client) : emptyDraft));
  const [error, setError] = useState("");

  const [createClient, { isLoading: creating }] = useCreateClientMutation();
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation();

  const set = <K extends keyof Draft>(key: K) => (value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const shared = {
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    company_name: draft.company_name.trim(),
    // A date input gives `YYYY-MM-DD`; the API stores a full timestamp.
    licence_expiration_date: draft.licence_expiration_date
      ? new Date(draft.licence_expiration_date).toISOString()
      : undefined,
  };

  const submit = async () => {
    if (!shared.name) {
      setError("Client name is required.");
      return;
    }
    if (!shared.company_name) {
      setError("Company name is required.");
      return;
    }
    if (!draft.licence_expiration_date) {
      setError("Licence expiry is required.");
      return;
    }

    try {
      if (isEdit) {
        await updateClient({ id: client._id, body: shared }).unwrap();
      } else {
        if (draft.password.length < MIN_PASSWORD_LENGTH) {
          setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
          return;
        }
        if (draft.password !== draft.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await createClient({
          ...shared,
          password: draft.password,
          confirmPassword: draft.confirmPassword,
        }).unwrap();
      }
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <FormModal
      title={isEdit ? "Edit client" : "Add client"}
      subtitle={isEdit ? clientLabel(client) : "Creates the account and emails the login details"}
      submitLabel={isEdit ? "Save changes" : "Add client"}
      saving={creating || updating}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <TextField label="Client name" value={draft.name} onChange={set("name")} required />
      <TextField label="Company name" value={draft.company_name} onChange={set("company_name")} required />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" type="email" value={draft.email} onChange={set("email")} required />
        <TextField label="Phone" type="tel" value={draft.phone} onChange={set("phone")} required />
      </div>

      <DateField
        label="Licence expiry"
        value={draft.licence_expiration_date}
        onChange={set("licence_expiration_date")}
        required
      />

      {!isEdit && (
        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <TextField label="Password" type="password" value={draft.password} onChange={set("password")} required />
          <TextField
            label="Confirm password"
            type="password"
            value={draft.confirmPassword}
            onChange={set("confirmPassword")}
            required
          />
        </div>
      )}
    </FormModal>
  );
}
