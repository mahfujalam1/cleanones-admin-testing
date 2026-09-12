"use client";
import { use, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdAdd, MdArrowBack, MdDelete } from "react-icons/md";
import { AddContactModal } from "@/components/clients/AddContactModal";
import { ClientLocationsPanel } from "@/components/clients/ClientLocationsPanel";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { getLocale, localizePath } from "@/lib/locale";
import {
  addClientContact,
  getClient,
  getClientContacts,
  getClientOverview,
  removeClientContact,
  updateClient,
  type ClientContact,
  type ClientDetails,
} from "@/services/actions/clients";

type Tab = "Overview" | "Contacts" | "Locations";

const clientDetailTranslations: Record<
  string,
  {
    clientNotFound: string;
    editClient: string;
    cancelEdit: string;
    overview: string;
    contacts: string;
    locations: string;
    addContact: string;
    deleteContactConfirm: string;
  }
> = {
  en: {
    clientNotFound: "Client not found",
    editClient: "Edit client",
    cancelEdit: "Cancel edit",
    overview: "Overview",
    contacts: "Contacts",
    locations: "Locations",
    addContact: "Add contact",
    deleteContactConfirm: "Delete contact?",
  },
  nl: {
    clientNotFound: "Klant niet gevonden",
    editClient: "Klant bewerken",
    cancelEdit: "Bewerken annuleren",
    overview: "Overzicht",
    contacts: "Contacten",
    locations: "Locaties",
    addContact: "Contact toevoegen",
    deleteContactConfirm: "Contact verwijderen?",
  },
  pl: {
    clientNotFound: "Nie znaleziono klienta",
    editClient: "Edytuj klienta",
    cancelEdit: "Anuluj edycję",
    overview: "Przegląd",
    contacts: "Kontakty",
    locations: "Lokalizacje",
    addContact: "Dodaj kontakt",
    deleteContactConfirm: "Usunąć kontakt?",
  },
  uk: {
    clientNotFound: "Клієнта не знайдено",
    editClient: "Редагувати клієнта",
    cancelEdit: "Скасувати редагування",
    overview: "Огляд",
    contacts: "Контакти",
    locations: "Локації",
    addContact: "Додати контакт",
    deleteContactConfirm: "Видалити контакт?",
  },
  pt: {
    clientNotFound: "Cliente não encontrado",
    editClient: "Editar cliente",
    cancelEdit: "Cancelar edição",
    overview: "Visão geral",
    contacts: "Contactos",
    locations: "Localizações",
    addContact: "Adicionar contacto",
    deleteContactConfirm: "Eliminar contacto?",
  },
  ar: {
    clientNotFound: "لم يتم العثور على العميل",
    editClient: "تعديل العميل",
    cancelEdit: "إلغاء التعديل",
    overview: "نظرة عامة",
    contacts: "جهات الاتصال",
    locations: "المواقع",
    addContact: "إضافة جهة اتصال",
    deleteContactConfirm: "هل تريد حذف جهة الاتصال؟",
  },
  fr: {
    clientNotFound: "Client non trouvé",
    editClient: "Modifier le client",
    cancelEdit: "Annuler modification",
    overview: "Aperçu",
    contacts: "Contacts",
    locations: "Emplacements",
    addContact: "Ajouter un contact",
    deleteContactConfirm: "Supprimer le contact ?",
  },
  es: {
    clientNotFound: "Cliente no encontrado",
    editClient: "Editar cliente",
    cancelEdit: "Cancelar edición",
    overview: "Resumen",
    contacts: "Contactos",
    locations: "Ubicaciones",
    addContact: "Agregar contacto",
    deleteContactConfirm: "¿Eliminar contacto?",
  },
};

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = clientDetailTranslations[locale] || clientDetailTranslations.en;

  const tabLabels: Record<Tab, string> = {
    Overview: t.overview,
    Contacts: t.contacts,
    Locations: t.locations,
  };

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [tab, setTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadBase = async () => {
    setLoading(true);
    const result = await getClient(id);
    setLoading(false);
    if (!result.success) return setError(result.error);
    setClient(result.data);
  };

  useEffect(() => {
    void loadBase();
  }, [id]);

  useEffect(() => {
    if (tab === "Overview")
      void getClientOverview(id).then((r) =>
        r.success ? setOverview(r.data as Record<string, unknown>) : setError(r.error)
      );
    if (tab === "Contacts")
      void getClientContacts(id).then((r) =>
        r.success ? setContacts(r.data.contacts) : setError(r.error)
      );
  }, [tab, id]);

  if (loading) return <DetailSkeleton blocks={8} />;
  if (!client)
    return <p className="rounded bg-red-50 p-4 text-red-700">{error || t.clientNotFound}</p>;

  return (
    <div className="space-y-5 pb-10">
      <header className="flex flex-wrap items-center gap-3">
        <button onClick={() => router.push(localizePath("/clients", locale))} className="rounded border p-2">
          <MdArrowBack />
        </button>
        <div>
          <h1 className="text-xl font-bold">{client.company_name}</h1>
          <p className="text-xs text-slate-500">
            {client.industry} · {client.status}
          </p>
        </div>
        <button
          onClick={() => setEditing((value) => !value)}
          className="ml-auto rounded bg-sky-500 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
        >
          {editing ? t.cancelEdit : t.editClient}
        </button>
      </header>

      {error && <p className="rounded bg-red-50 p-3 text-xs text-red-700">{error}</p>}

      <nav className="flex overflow-x-auto border-b">
        {(["Overview", "Contacts", "Locations"] as const).map((item) => (
          <button
            key={item}
            onClick={() => {
              if (item === "Locations" || tab !== item) {
                router.replace(pathname, { scroll: false });
              }
              setTab(item);
            }}
            className={`border-b-2 px-5 py-3 text-xs font-semibold cursor-pointer ${
              tab === item ? "border-sky-500 text-sky-600" : "border-transparent text-slate-400"
            }`}
          >
            {tabLabels[item]}
          </button>
        ))}
      </nav>

      {editing && (
        <EditClient
          client={client}
          onSaved={(value) => {
            setClient(value);
            setEditing(false);
          }}
          onError={setError}
        />
      )}

      {!editing && tab === "Overview" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(overview ?? {})
            .filter(([, value]) => ["string", "number"].includes(typeof value))
            .map(([key, value]) => (
              <Info key={key} label={key} value={String(value)} />
            ))}
        </div>
      )}

      {!editing && tab === "Contacts" && (
        <div className="space-y-4">
          <button
            onClick={() => setContactOpen(true)}
            className="flex items-center gap-1 rounded bg-sky-500 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            <MdAdd />
            {t.addContact}
          </button>
          <div className="grid gap-3 md:grid-cols-2">
            {contacts.map((item) => (
              <div key={item.id} className="dashboard-card p-5">
                <div className="flex justify-between">
                  <div>
                    <b>{item.name}</b>
                    <p className="text-xs text-sky-600">{item.role}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm(t.deleteContactConfirm)) return;
                      const result = await removeClientContact(id, item.id);
                      if (!result.success) return setError(result.error);
                      setContacts((current) => current.filter((contact) => contact.id !== item.id));
                    }}
                    className="text-red-500"
                  >
                    <MdDelete />
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {item.email}
                  <br />
                  {item.phone}
                </p>
              </div>
            ))}
          </div>
          {contactOpen && (
            <AddContactModal
              onClose={() => setContactOpen(false)}
              onSave={async (input) => {
                const result = await addClientContact(id, input);
                if (!result.success) return setError(result.error);
                setContacts((current) => [...current, result.data]);
                setContactOpen(false);
              }}
            />
          )}
        </div>
      )}

      {!editing && tab === "Locations" && (
        <ClientLocationsPanel clientId={id} onError={setError} />
      )}
    </div>
  );
}

function EditClient({
  client,
  onSaved,
  onError,
}: {
  client: ClientDetails;
  onSaved: (value: ClientDetails) => void;
  onError: (value: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: client.company_name,
    email: client.email,
    industry: client.industry,
    phone: client.phone,
    primary_contact_name: client.primary_contact_name,
    is_signup: client.is_signup,
    status: client.status,
  });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = await updateClient(client.id, form);
        setSaving(false);
        if (result.success) onSaved(result.data);
        else onError(result.error);
      }}
      className="grid gap-3 rounded border bg-white p-5 md:grid-cols-2"
    >
      {(["company_name", "email", "industry", "phone", "primary_contact_name"] as const).map(
        (key) => (
          <label key={key} className="text-xs capitalize text-slate-500">
            {key.replaceAll("_", " ")}
            <input
              required
              value={String(form[key])}
              onChange={(e) =>
                setForm((current) => ({ ...current, [key]: e.target.value }))
              }
              className="mt-1 h-10 w-full rounded border px-3 text-sm text-slate-800"
            />
          </label>
        )
      )}
      <label className="text-xs capitalize text-slate-500">
        Status
        <select
          value={form.status}
          onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
          className="mt-1 h-10 w-full rounded border px-3 text-sm text-slate-800"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </label>
      <button
        disabled={saving}
        className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-white md:col-span-2 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-slate-50 p-4">
      <p className="text-[10px] uppercase text-slate-400">{label.replaceAll("_", " ")}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
