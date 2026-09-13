"use client";

import { useState } from "react";
import { FormModal } from "@/components/shared/FormModal";
import { DateField, SelectField, TextField } from "@/components/shared/Field";
import { apiError } from "@/redux/api/apiError";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import {
  CONTRACT_STATUSES,
  useCreateClientMutation,
  clientLabel,
  useUpdateClientMutation,
  type Client,
  type ContractStatus,
} from "@/redux/api/endpoints/clients.api";

/** `2026-09-12T09:00:00.000Z` → `2026-09-12`, which is what a date input wants. */
const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

type Draft = {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  licence_expiration_date: string;
  contract_status: ContractStatus | "";
  password: string;
  confirmPassword: string;
};

const emptyDraft: Draft = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  licence_expiration_date: "",
  contract_status: "",
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
  contract_status: client.contract_status ?? "",
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
    company_name: draft.company_name.trim() || undefined,
    // A date input gives `YYYY-MM-DD`; the API stores a full timestamp.
    licence_expiration_date: draft.licence_expiration_date
      ? new Date(draft.licence_expiration_date).toISOString()
      : undefined,
    contract_status: draft.contract_status || undefined,
  };

  const submit = async () => {
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
      <TextField label="Company name" value={draft.company_name} onChange={set("company_name")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" type="email" value={draft.email} onChange={set("email")} required />
        <TextField label="Phone" type="tel" value={draft.phone} onChange={set("phone")} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Contract status"
          value={draft.contract_status}
          options={CONTRACT_STATUSES}
          onChange={set("contract_status")}
        />
        <DateField
          label="Licence expiry"
          value={draft.licence_expiration_date}
          onChange={set("licence_expiration_date")}
        />
      </div>

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
