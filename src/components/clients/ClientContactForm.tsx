"use client";

import { useState } from "react";
import { FormModal } from "@/components/shared/FormModal";
import { TextField, SelectField } from "@/components/shared/Field";
import { apiError } from "@/redux/api/apiError";
import { useCreateClientContactMutation } from "@/redux/api/endpoints/clients.api";

const ROLE_OPTIONS = [
  "Operations Contact",
  "Facility Manager",
  "Operations Manager",
  "Admin",
  "Other",
];

export function ClientContactForm({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [createContact, { isLoading }] = useCreateClientContactMutation();

  const submit = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone is required.");
      return;
    }

    try {
      await createContact({
        clientId,
        body: {
          name: name.trim(),
          role,
          phone: phone.trim(),
          email: email.trim(),
        },
      }).unwrap();
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <FormModal
      title="Add New Contact"
      subtitle="Add a contact person for this client."
      submitLabel="+ Add Contact"
      saving={isLoading}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <div className="space-y-4">
        <TextField label="Full Name" value={name} onChange={setName} required />
        <SelectField
          label="Role"
          value={role}
          options={ROLE_OPTIONS}
          onChange={setRole}
          required
        />
        <TextField label="Phone" type="tel" value={phone} onChange={setPhone} required />
        <TextField label="Email" type="email" value={email} onChange={setEmail} />
      </div>
    </FormModal>
  );
}
