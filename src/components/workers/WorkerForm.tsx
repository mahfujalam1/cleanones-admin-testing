"use client";

import { useId, useState } from "react";
import { FormModal } from "@/components/shared/FormModal";
import { FieldLabel, SelectField, TextField } from "@/components/shared/Field";
import { PlaceSearchSelect } from "@/components/ui/place-search";
import { WorkerLanguagesSelector } from "./WorkerLanguagesSelector";
import { apiError } from "@/redux/api/apiError";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import {
  WORKER_TYPES,
  WORKING_DAYS,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  type Worker,
  type WorkerType,
  type WorkingDay,
  workerName,
} from "@/redux/api/endpoints/workers.api";

const DAY_LABELS: Record<WorkingDay, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const toggle = <T,>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

function WeeklyAvailability({
  selected,
  onToggle,
}: {
  selected: WorkingDay[];
  onToggle: (day: WorkingDay) => void;
}) {
  return (
    <fieldset>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <legend className="text-xs font-semibold text-slate-700">Weekly Availability</legend>
        <span className="text-[11px] text-slate-400">Select Working Days for Employee</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {WORKING_DAYS.map((day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(day)}
              className={`h-9 cursor-pointer rounded-md border text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function WorkerForm({ worker, onClose }: { worker?: Worker; onClose: () => void }) {
  const isEdit = worker !== undefined;
  const locationId = useId();

  const [name, setName] = useState(worker?.name ?? "");
  const [workerType, setWorkerType] = useState<WorkerType>(worker?.worker_type ?? "Employee");
  const [email, setEmail] = useState(worker?.email ?? "");
  const [phone, setPhone] = useState(worker?.phone ?? "");
  const [hourlyRate, setHourlyRate] = useState(worker?.hourly_rate?.toString() ?? "25");
  const [baseLocation, setBaseLocation] = useState(worker?.base_location ?? "");
  const [languages, setLanguages] = useState<string[]>(worker?.languages ?? []);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(worker?.working_days ?? []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- "More details" block, parked until it is wanted again. -------------------------------
  // Restore by uncommenting this state, the matching lines in `shared` below, and the <details>
  // section at the end of the form. It also needs `CheckboxField` and `DateField` added back to
  // the Field import, and `toDateInput` above.
  // const [address, setAddress] = useState(worker?.address ?? "");
  // const [nationality, setNationality] = useState(worker?.nationality ?? "");
  // const [dob, setDob] = useState(toDateInput(worker?.dob));
  // const [nationalId, setNationalId] = useState(worker?.national_id ?? "");
  // const [idCardFront, setIdCardFront] = useState(worker?.id_card_front ?? "");
  // const [idCardBack, setIdCardBack] = useState(worker?.id_card_back ?? "");
  // const [contractPdf, setContractPdf] = useState(worker?.employee_contract_pdf ?? "");
  // const [agreed, setAgreed] = useState(worker?.isagree_condition ?? false);
  // ------------------------------------------------------------------------------------------

  const [error, setError] = useState("");

  const [createWorker, { isLoading: creating }] = useCreateWorkerMutation();
  const [updateWorker, { isLoading: updating }] = useUpdateWorkerMutation();

  const submit = async () => {
    if (!baseLocation.trim()) {
      setError("Base Location is required.");
      return;
    }

    if (languages.length === 0) {
      setError("Pick at least one language.");
      return;
    }

    const shared = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      worker_type: workerType,
      base_location: baseLocation.trim(),
      hourly_rate: hourlyRate.trim() ? Number(hourlyRate) : undefined,
      languages,
      // Stripped for freelancers by `withWorkingDays` in the endpoint.
      working_days: workingDays.length ? workingDays : undefined,
    };

    try {
      if (isEdit) {
        await updateWorker({ id: worker._id, body: shared }).unwrap();
      } else {
        if (password.length < MIN_PASSWORD_LENGTH) {
          setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await createWorker({ ...shared, password, confirmPassword }).unwrap();
      }
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <FormModal
      title={isEdit ? "Edit Worker" : "Add Worker"}
      subtitle={isEdit ? workerName(worker) : "Workers"}
      submitLabel={isEdit ? "Save Changes" : "Add Worker"}
      saving={creating || updating}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" placeholder="Enter Name" value={name} onChange={setName} required />
        <SelectField label="Role" value={workerType} options={WORKER_TYPES} onChange={setWorkerType} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" placeholder="Enter Email" type="email" value={email} onChange={setEmail} required />
        <TextField label="Phone Number" placeholder="Enter Phone Number" type="tel" value={phone} onChange={setPhone} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Hourly Rate (€/hr)"
          placeholder="25"
          type="number"
          min={0}
          value={hourlyRate}
          onChange={setHourlyRate}
          required
        />
        <div>
          {/* Base Location is required */}
          <FieldLabel htmlFor={locationId} label="Base Location" required />
          <PlaceSearchSelect value={baseLocation} onValueChange={setBaseLocation} placeholder="Search Base Location…" />
        </div>
      </div>

      <WorkerLanguagesSelector
        selectedLanguages={languages}
        onToggleLanguage={(language) => {
          setLanguages((current) => toggle(current, language));
          setError("");
        }}
      />

      {/* The API rejects working days for freelancers, so the picker only appears for employees. */}
      {workerType === "Employee" && (
        <WeeklyAvailability
          selected={workingDays}
          onToggle={(day) => setWorkingDays((current) => toggle(current, day))}
        />
      )}

      {!isEdit && (
        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <TextField label="Password" placeholder="Enter Password" type="password" value={password} onChange={setPassword} required />
          <TextField
            label="Confirm Password"
            placeholder="Enter Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />
        </div>
      )}

      {/* Parked: the "More details" fields. See the note beside their state above.
      <details className="border-t border-slate-100 pt-4">
        <summary className="cursor-pointer list-none text-xs font-semibold text-slate-600 hover:text-slate-900">
          More details
        </summary>
        <div className="mt-4 space-y-4">
          <TextField label="Address" value={address} onChange={setAddress} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Nationality" value={nationality} onChange={setNationality} />
            <DateField label="Date of birth" value={dob} onChange={setDob} />
          </div>
          <TextField label="National ID" value={nationalId} onChange={setNationalId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="ID card front" value={idCardFront} onChange={setIdCardFront} placeholder="https://…" />
            <TextField label="ID card back" value={idCardBack} onChange={setIdCardBack} placeholder="https://…" />
          </div>
          <TextField label="Contract PDF" value={contractPdf} onChange={setContractPdf} placeholder="https://…" />
          <p className="text-[11px] text-slate-400">
            Documents are stored as links — the API takes a URL, not a file upload.
          </p>
          <CheckboxField label="Terms and conditions accepted" checked={agreed} onChange={setAgreed} />
        </div>
      </details>
      */}

    </FormModal>
  );
}
