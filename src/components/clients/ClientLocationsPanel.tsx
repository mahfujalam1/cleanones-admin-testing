"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { AddressAutocompleteInput } from "@/components/locations/AddressAutocompleteInput";
import {
  MdAdd,
  MdArrowBack,
  MdChecklist,
  MdClose,
  MdDelete,
  MdEdit,
  MdLocationOn,
  MdOutlineClose,
} from "react-icons/md";
import {
  TbBuilding,
  TbClock,
  TbDoor,
  TbPhoto,
  TbPlus,
  TbTrash,
  TbRefresh,
  TbUsers,
  TbClipboardList,
  TbPencil,
  TbUser,
  TbMapPin,
} from "react-icons/tb";
import {
  deleteCleaningPlan,
  getCleaningPlans,
  type PlanSummary,
} from "@/services/actions/cleaningPlans";
import { CreatePlanModal } from "@/components/cleaningPlans/CreatePlanModal";
import { WorkerAssignmentModal } from "@/components/cleaningPlans/WorkerAssignmentModal";
import { PlanDetailSidebar } from "@/components/cleaningPlans/PlanDetailsSidebar";
import { type CleaningPlan } from "@/components/cleaningPlans/types";
import {
  createClientLocation,
  deleteLocation,
  getLocation,
  getLocations,
  updateLocation,
  type LocationGridItem,
  type LocationInput,
} from "@/services/actions/locations";
import {
  deleteRoom,
  getRoom,
  getRooms,
  updateRoom,
  type RoomDetails,
  type RoomGridItem,
  type RoomTaskInput,
} from "@/services/actions/rooms";
import { CardGridSkeleton } from "@/components/shared/SkeletonLoader";
import { ClientRoomModal } from "./ClientRoomModal";

const emptyLocation: LocationInput = {
  name: "",
  type: "office",
  address: "",
  floor: 1,
  description: "",
  latitude: undefined,
  longitude: undefined,
};

const blankTask = (): RoomTaskInput => ({
  name: "",
  frequency_type: "daily",
  is_photo_req: false,
  photo: [],
  days_of_week: ["Tue", "Sat"],
  days_of_month: [1, 15],
});

export const taskModalTranslations: Record<
  string,
  {
    addTask: string;
    editTask: string;
    taskName: string;
    addTaskPlaceholder: string;
    frequencyType: string;
    daily: string;
    weekly: string;
    monthly: string;
    everyVisit: string;
    durationMin: string;
    durationPlaceholder: string;
    weekDays: string;
    datesOfMonth: string;
    photoRequired: string;
    requiredPhotoNamePlaceholder: string;
    remove: string;
    addPhoto: string;
    cancel: string;
    saveTask: string;
    saveRoom: string;
    tasksTitle: string;
    roomsTitle: string;
    addRoom: string;
    noTasks: string;
    weeklyPrefix: string;
    monthlyPrefix: string;
    days: Record<string, string>;
    locationsBreadcrumb: string;
    editRoom: string;
    photoRequiredBadge: string;
    duration: string;
    photos: string;
    tasks: string;
    locationCardTitle: string;
    cleaningPlanCardTitle: string;
  }
> = {
  en: {
    addTask: "Add Task",
    editTask: "Edit Task",
    taskName: "Task Name *",
    addTaskPlaceholder: "Add task name",
    frequencyType: "Frequency Type *",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    everyVisit: "Every visit",
    durationMin: "Duration (min)",
    durationPlaceholder: "e.g. 15",
    weekDays: "Week days *",
    datesOfMonth: "Dates of the month *",
    photoRequired: "Photo required",
    requiredPhotoNamePlaceholder: "Required photo name",
    remove: "Remove",
    addPhoto: "+ Add Photo",
    cancel: "Cancel",
    saveTask: "Save task",
    saveRoom: "Save Room",
    tasksTitle: "Tasks",
    roomsTitle: "Rooms",
    addRoom: "Add Room",
    noTasks: "No tasks defined for this room. Click \"+ Add Task\" above.",
    weeklyPrefix: "Weekly: ",
    monthlyPrefix: "Monthly: ",
    days: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },
    locationsBreadcrumb: "Locations",
    editRoom: "Edit room",
    photoRequiredBadge: "📷 Photo Required",
    duration: "Duration",
    photos: "Photos",
    tasks: "Tasks",
    locationCardTitle: "LOCATION",
    cleaningPlanCardTitle: "CLEANING PLAN",
  },
  nl: {
    addTask: "Taak Toevoegen",
    editTask: "Taak Bewerken",
    taskName: "Taaknaam *",
    addTaskPlaceholder: "Taaknaam toevoegen",
    frequencyType: "Frequentietype *",
    daily: "Dagelijks",
    weekly: "Wekelijks",
    monthly: "Maandelijks",
    everyVisit: "Elk bezoek",
    durationMin: "Duur (min)",
    durationPlaceholder: "bijv. 15",
    weekDays: "Weekdagen *",
    datesOfMonth: "Dagen van de maand *",
    photoRequired: "Foto vereist",
    requiredPhotoNamePlaceholder: "Vereiste fotonaam",
    remove: "Verwijderen",
    addPhoto: "+ Foto toevoegen",
    cancel: "Annuleren",
    saveTask: "Taak opslaan",
    saveRoom: "Kamer opslaan",
    tasksTitle: "Taken",
    roomsTitle: "Kamers",
    addRoom: "Kamer toevoegen",
    noTasks: "Geen taken gedefinieerd voor deze kamer. Klik hierboven op \"+ Taak Toevoegen\".",
    weeklyPrefix: "Wekelijks: ",
    monthlyPrefix: "Maandelijks: ",
    days: { Mon: "Ma", Tue: "Di", Wed: "Wo", Thu: "Do", Fri: "Vr", Sat: "Za", Sun: "Zo" },
    locationsBreadcrumb: "Locaties",
    editRoom: "Kamer bewerken",
    photoRequiredBadge: "📷 Foto Vereist",
    duration: "Duur",
    photos: "Foto's",
    tasks: "Taken",
    locationCardTitle: "LOCATIE",
    cleaningPlanCardTitle: "SCHOONMAAKPLAN",
  },
  pl: {
    addTask: "Dodaj Zadanie",
    editTask: "Edytuj Zadanie",
    taskName: "Nazwa Zadania *",
    addTaskPlaceholder: "Dodaj nazwę zadania",
    frequencyType: "Typ Częstotliwości *",
    daily: "Codziennie",
    weekly: "Tygodniowo",
    monthly: "Miesięcznie",
    everyVisit: "Każda wizyta",
    durationMin: "Czas trwania (min)",
    durationPlaceholder: "np. 15",
    weekDays: "Dni tygodnia *",
    datesOfMonth: "Dni miesiąca *",
    photoRequired: "Wymagane zdjęcie",
    requiredPhotoNamePlaceholder: "Nazwa wymaganego zdjęcia",
    remove: "Usuń",
    addPhoto: "+ Dodaj zdjęcie",
    cancel: "Anuluj",
    saveTask: "Zapisz zadanie",
    saveRoom: "Zapisz pokój",
    tasksTitle: "Zadania",
    roomsTitle: "Pokoje",
    addRoom: "Dodaj pokój",
    noTasks: "Brak zdefiniowanych zadań dla tego pokoju. Kliknij \"+ Dodaj Zadanie\" powyżej.",
    weeklyPrefix: "Tygodniowo: ",
    monthlyPrefix: "Miesięcznie: ",
    days: { Mon: "Pon", Tue: "Wt", Wed: "Śr", Thu: "Czw", Fri: "Pt", Sat: "Sob", Sun: "Ndz" },
    locationsBreadcrumb: "Lokalizacje",
    editRoom: "Edytuj pokój",
    photoRequiredBadge: "📷 Wymagane zdjęcie",
    duration: "Czas trwania",
    photos: "Zdjęcia",
    tasks: "Zadania",
    locationCardTitle: "LOKALIZACJA",
    cleaningPlanCardTitle: "PLAN SPRZĄTANIA",
  },
  uk: {
    addTask: "Додати Завдання",
    editTask: "Редагувати Завдання",
    taskName: "Назва Завдання *",
    addTaskPlaceholder: "Введіть назву завдання",
    frequencyType: "Тип Періодичності *",
    daily: "Щодня",
    weekly: "Щотижня",
    monthly: "Щомісяця",
    everyVisit: "Кожен візит",
    durationMin: "Тривалість (хв)",
    durationPlaceholder: "напр., 15",
    weekDays: "Дні тижня *",
    datesOfMonth: "Дні місяця *",
    photoRequired: "Потрібне фото",
    requiredPhotoNamePlaceholder: "Назва необхідного фото",
    remove: "Видалити",
    addPhoto: "+ Додати фото",
    cancel: "Скасувати",
    saveTask: "Зберегти завдання",
    saveRoom: "Зберегти кімнату",
    tasksTitle: "Завдання",
    roomsTitle: "Кімнати",
    addRoom: "Додати кімнату",
    noTasks: "Для цієї кімнати не визначено завдань. Натисніть \"+ Додати Завдання\" вище.",
    weeklyPrefix: "Щотижня: ",
    monthlyPrefix: "Щомісяця: ",
    days: { Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб", Sun: "Нд" },
    locationsBreadcrumb: "Локації",
    editRoom: "Редагувати кімнату",
    photoRequiredBadge: "📷 Потрібне фото",
    duration: "Тривалість",
    photos: "Фото",
    tasks: "Завдання",
    locationCardTitle: "ЛОКАЦІЯ",
    cleaningPlanCardTitle: "ПЛАН ПРИБИРАННЯ",
  },
  pt: {
    addTask: "Adicionar Tarefa",
    editTask: "Editar Tarefa",
    taskName: "Nome da Tarefa *",
    addTaskPlaceholder: "Adicionar nome da tarefa",
    frequencyType: "Tipo de Frequência *",
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
    everyVisit: "Cada visita",
    durationMin: "Duração (min)",
    durationPlaceholder: "ex.: 15",
    weekDays: "Dias da semana *",
    datesOfMonth: "Dias do mês *",
    photoRequired: "Foto obrigatória",
    requiredPhotoNamePlaceholder: "Nome da foto obrigatória",
    remove: "Remover",
    addPhoto: "+ Adicionar Foto",
    cancel: "Cancelar",
    saveTask: "Guardar tarefa",
    saveRoom: "Guardar divisão",
    tasksTitle: "Tarefas",
    roomsTitle: "Divisões",
    addRoom: "Adicionar divisão",
    noTasks: "Nenhuma tarefa definida para esta divisão. Clique em \"+ Adicionar Tarefa\" acima.",
    weeklyPrefix: "Semanal: ",
    monthlyPrefix: "Mensal: ",
    days: { Mon: "Seg", Tue: "Ter", Wed: "Qua", Thu: "Qui", Fri: "Sex", Sat: "Sáb", Sun: "Dom" },
    locationsBreadcrumb: "Localizações",
    editRoom: "Editar divisão",
    photoRequiredBadge: "📷 Foto Obrigatória",
    duration: "Duração",
    photos: "Fotos",
    tasks: "Tarefas",
    locationCardTitle: "LOCALIZAÇÃO",
    cleaningPlanCardTitle: "PLANO DE LIMPEZA",
  },
  ar: {
    addTask: "إضافة مهمة",
    editTask: "تعديل المهمة",
    taskName: "اسم المهمة *",
    addTaskPlaceholder: "أدخل اسم المهمة",
    frequencyType: "نوع التكرار *",
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    everyVisit: "كل زيارة",
    durationMin: "المدة (بالدقائق)",
    durationPlaceholder: "مثلاً: 15",
    weekDays: "أيام الأسبوع *",
    datesOfMonth: "أيام الشهر *",
    photoRequired: "الصورة مطلوبة",
    requiredPhotoNamePlaceholder: "اسم الصورة المطلوبة",
    remove: "حذف",
    addPhoto: "+ إضافة صورة",
    cancel: "إلغاء",
    saveTask: "حفظ المهمة",
    saveRoom: "حفظ الغرفة",
    tasksTitle: "المهام",
    roomsTitle: "الغرف",
    addRoom: "إضافة غرفة",
    noTasks: "لم يتم تحديد مهام لهذه الغرفة. انقر فوق \"+ إضافة مهمة\" أعلاه.",
    weeklyPrefix: "أسبوعي: ",
    monthlyPrefix: "شهري: ",
    days: { Mon: "الإثنين", Tue: "الثلاثاء", Wed: "الأربعاء", Thu: "الخميس", Fri: "الجمعة", Sat: "السبت", Sun: "الأحد" },
    locationsBreadcrumb: "المواقع",
    editRoom: "تعديل الغرفة",
    photoRequiredBadge: "📷 الصورة مطلوبة",
    duration: "المدة",
    photos: "الصور",
    tasks: "المهام",
    locationCardTitle: "الموقع",
    cleaningPlanCardTitle: "خطة التنظيف",
  },
  fr: {
    addTask: "Ajouter une Tâche",
    editTask: "Modifier la Tâche",
    taskName: "Nom de la Tâche *",
    addTaskPlaceholder: "Ajouter le nom de la tâche",
    frequencyType: "Type de Fréquence *",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    everyVisit: "À chaque visite",
    durationMin: "Durée (min)",
    durationPlaceholder: "ex. 15",
    weekDays: "Jours de la semaine *",
    datesOfMonth: "Jours du mois *",
    photoRequired: "Photo requise",
    requiredPhotoNamePlaceholder: "Nom de la photo requise",
    remove: "Supprimer",
    addPhoto: "+ Ajouter une photo",
    cancel: "Annuler",
    saveTask: "Enregistrer la tâche",
    saveRoom: "Enregistrer la pièce",
    tasksTitle: "Tâches",
    roomsTitle: "Pièces",
    addRoom: "Ajouter une pièce",
    noTasks: "Aucune tâche définie pour cette pièce. Cliquez sur \"+ Ajouter une Tâche\" ci-dessus.",
    weeklyPrefix: "Hebdomadaire : ",
    monthlyPrefix: "Mensuel : ",
    days: { Mon: "Lun", Tue: "Mar", Wed: "Mer", Thu: "Jeu", Fri: "Ven", Sat: "Sam", Sun: "Dim" },
    locationsBreadcrumb: "Emplacements",
    editRoom: "Modifier la pièce",
    photoRequiredBadge: "📷 Photo Requise",
    duration: "Durée",
    photos: "Photos",
    tasks: "Tâches",
    locationCardTitle: "EMPLACEMENT",
    cleaningPlanCardTitle: "PLAN DE NETTOYAGE",
  },
  es: {
    addTask: "Agregar Tarea",
    editTask: "Editar Tarea",
    taskName: "Nombre de la Tarea *",
    addTaskPlaceholder: "Agregar nombre de la tarea",
    frequencyType: "Tipo de Frecuencia *",
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    everyVisit: "Cada visita",
    durationMin: "Duración (min)",
    durationPlaceholder: "ej. 15",
    weekDays: "Días de la semana *",
    datesOfMonth: "Días del mes *",
    photoRequired: "Foto requerida",
    requiredPhotoNamePlaceholder: "Nombre de la foto requerida",
    remove: "Eliminar",
    addPhoto: "+ Agregar foto",
    cancel: "Cancelar",
    saveTask: "Guardar tarea",
    saveRoom: "Guardar habitación",
    tasksTitle: "Tareas",
    roomsTitle: "Habitaciones",
    addRoom: "Agregar habitación",
    noTasks: "No hay tareas definidas para esta habitación. Haga clic en \"+ Agregar Tarea\" arriba.",
    weeklyPrefix: "Semanal: ",
    monthlyPrefix: "Mensual: ",
    days: { Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue", Fri: "Vie", Sat: "Sáb", Sun: "Dom" },
    locationsBreadcrumb: "Ubicaciones",
    editRoom: "Editar habitación",
    photoRequiredBadge: "📷 Foto Requerida",
    duration: "Duración",
    photos: "Fotos",
    tasks: "Tareas",
    locationCardTitle: "UBICACIÓN",
    cleaningPlanCardTitle: "PLAN DE LIMPIEZA",
  },
};

export function ClientLocationsPanel({
  clientId,
  onError,
}: {
  clientId: string;
  onError: (value: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = getLocale(pathname);
  const tModal = taskModalTranslations[currentLocale] || taskModalTranslations.en;

  const urlLocId = searchParams.get("locationId");
  const urlRoomId = searchParams.get("roomId");

  const [locations, setLocations] = useState<LocationGridItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down level state
  const [activeLocation, setActiveLocation] = useState<LocationGridItem | null>(null);
  const [activeLocationSubTab, setActiveLocationSubTab] = useState<"Overview" | "Rooms" | "Cleaning plans">("Rooms");
  const [activeRoom, setActiveRoom] = useState<RoomDetails | null>(null);

  // Rooms list for active location
  const [locationRooms, setLocationRooms] = useState<RoomGridItem[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomDetailLoading, setRoomDetailLoading] = useState(false);
  const [roomDetailError, setRoomDetailError] = useState("");
  const [roomDetailName, setRoomDetailName] = useState("");

  // Cleaning plans state for active location
  const [locationPlans, setLocationPlans] = useState<PlanSummary[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // Cleaning plan modal states
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<CleaningPlan | null>(null);
  const [assigningPlan, setAssigningPlan] = useState<CleaningPlan | null>(null);

  // Load cleaning plans for active location
  const loadLocationPlans = async (locId: string) => {
    setPlansLoading(true);
    const res = await getCleaningPlans({ locationId: locId, limit: 100 });
    setPlansLoading(false);
    if (res.success) {
      setLocationPlans(res.data.plans || []);
    } else {
      onError(res.error);
    }
  };

  // Location modal
  const [locationForm, setLocationForm] = useState<LocationInput | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [deleteTargetLocation, setDeleteTargetLocation] = useState<LocationGridItem | null>(null);

  // Room modal
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [editingRoomData, setEditingRoomData] = useState<RoomDetails | null>(null);
  const [deleteTargetRoom, setDeleteTargetRoom] = useState<RoomGridItem | null>(null);

  // Edit Task modal state
  const [taskModalIndex, setTaskModalIndex] = useState<number | null>(null);
  const [isNewTaskModal, setIsNewTaskModal] = useState(false);

  const [saving, setSaving] = useState(false);

  // Helper to update URL search parameters for navigation & deep linking
  const updateUrlParams = (locId: string | null, roomId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (locId) params.set("locationId", locId);
    else params.delete("locationId");

    if (roomId) params.set("roomId", roomId);
    else params.delete("roomId");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Load locations
  const loadLocations = async () => {
    setLoading(true);
    const r = await getLocations({ clientId, page: 1, limit: 100 });
    setLoading(false);
    if (r.success) {
      setLocations(r.data.locations);
    } else {
      onError(r.error);
    }
  };

  useEffect(() => {
    void loadLocations();
  }, [clientId]);

  // Load rooms when active location changes
  const loadRooms = async (locId: string) => {
    setRoomsLoading(true);
    const res = await getRooms({ locationId: locId, limit: 100 });
    setRoomsLoading(false);
    if (res.success) {
      setLocationRooms(res.data.rooms);
    } else {
      onError(res.error);
    }
  };

  // Sync state from URL params on load/change
  useEffect(() => {
    if (!urlLocId) {
      setActiveLocation(null);
      setActiveRoom(null);
      setLocationPlans([]);
    } else if (locations.length > 0 && (!activeLocation || activeLocation.location_id !== urlLocId)) {
      const found = locations.find((l) => l.location_id === urlLocId);
      if (found) {
        setActiveLocation(found);
        void loadRooms(found.location_id);
        void loadLocationPlans(found.location_id);
      }
    }
  }, [locations, urlLocId]);

  const handleSelectLocation = (loc: LocationGridItem) => {
    setActiveLocation(loc);
    setActiveRoom(null);
    setActiveLocationSubTab("Rooms");
    void loadRooms(loc.location_id);
    void loadLocationPlans(loc.location_id);
    updateUrlParams(loc.location_id, null);
  };

  const handleSelectRoom = async (roomItem: RoomGridItem) => {
    setRoomDetailName(roomItem.room_name);
    setRoomDetailError("");
    setRoomDetailLoading(true);
    setActiveRoom(null);
    const res = await getRoom(roomItem.room_id);
    setRoomDetailLoading(false);
    if (!res.success) {
      setRoomDetailError(`${roomItem.room_name} not found`);
      return;
    }
    setActiveRoom(res.data);
    updateUrlParams(roomItem.location_id || activeLocation?.location_id || null, roomItem.room_id);
  };

  const handleBackToLocations = () => {
    setActiveLocation(null);
    setActiveRoom(null);
    updateUrlParams(null, null);
  };

  const handleBackToRooms = () => {
    setActiveRoom(null);
    setRoomDetailError("");
    setRoomDetailName("");
    if (activeLocation) {
      updateUrlParams(activeLocation.location_id, null);
    } else {
      updateUrlParams(null, null);
    }
  };

  const editLocation = async (item: LocationGridItem) => {
    const r = await getLocation(item.location_id);
    if (!r.success) return onError(r.error);
    const x = r.data;
    setEditingLocationId(x.id);
    setLocationForm({
      name: x.name,
      type: x.type,
      address: x.address,
      floor: x.floor,
      description: x.description,
      latitude: x.latitude ?? undefined,
      longitude: x.longitude ?? undefined,
    });
  };

  const saveLocation = async () => {
    if (!locationForm || !locationForm.name.trim() || !locationForm.address.trim()) return;
    // Required by the backend on create (geofenced worker check-in needs coordinates from the
    // start) — optional on update, so an older location missing them can still be edited.
    if (!editingLocationId && (locationForm.latitude === undefined || locationForm.longitude === undefined)) {
      return onError("Pick the address from the suggestion list so its coordinates are captured — required for geofenced worker check-in.");
    }
    setSaving(true);
    const r = editingLocationId
      ? await updateLocation(editingLocationId, locationForm)
      : await createClientLocation(clientId, locationForm);
    setSaving(false);
    if (!r.success) return onError(r.error);
    setLocationForm(null);
    setEditingLocationId(null);
    await loadLocations();
  };

  const removeLocation = async () => {
    if (!deleteTargetLocation) return;
    setSaving(true);
    const r = await deleteLocation(deleteTargetLocation.location_id);
    setSaving(false);
    if (!r.success) return onError(r.error);
    setDeleteTargetLocation(null);
    if (activeLocation?.location_id === deleteTargetLocation.location_id) {
      setActiveLocation(null);
      setActiveRoom(null);
    }
    await loadLocations();
  };

  const removeRoom = async () => {
    if (!deleteTargetRoom) return;
    setSaving(true);
    const locId = deleteTargetRoom.location_id;
    const r = await deleteRoom(deleteTargetRoom.room_id);
    setSaving(false);
    if (!r.success) return onError(r.error);
    setDeleteTargetRoom(null);
    if (activeRoom?.id === deleteTargetRoom.room_id) {
      setActiveRoom(null);
    }
    if (locId) void loadRooms(locId);
    await loadLocations();
  };

  // Helper for formatting frequency display
  const formatFrequencyLabel = (task: RoomTaskInput) => {
    const freq = (task.frequency_type || "daily").toLowerCase();
    if (freq === "weekly") {
      const days = task.days_of_week || [];
      const normalizedDays = days.map((day) => {
        const value = String(day).toLowerCase();
        return value.charAt(0).toUpperCase() + value.slice(1);
      });
      const localizedDays = normalizedDays.length
        ? normalizedDays.map((day) => tModal.days[day] || day)
        : [tModal.days.Mon, tModal.days.Tue];
      return `${tModal.weeklyPrefix}${localizedDays.join(", ")}`;
    }
    if (freq === "monthly") {
      const dates = (task.days_of_month || []).join(", ") || "1, 15";
      return `${tModal.monthlyPrefix}${dates}`;
    }
    if (freq === "every_visit") return tModal.everyVisit;
    return tModal.daily;
  };

  return (
    <div className="space-y-4">
      {/* BREADCRUMB NAVIGATION BAR (Image 3 & 4) */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          type="button"
          onClick={handleBackToLocations}
          className={`hover:text-sky-600 cursor-pointer ${!activeLocation ? "text-sky-600 font-bold" : ""
            }`}
        >
          {tModal.locationsBreadcrumb}
        </button>
        {activeLocation && (
          <>
            <span>›</span>
            <button
              type="button"
              onClick={handleBackToRooms}
              className={`hover:text-sky-600 cursor-pointer ${!activeRoom ? "text-sky-600 font-bold" : ""
                }`}
            >
              {activeLocation.location_name}
            </button>
          </>
        )}
        {activeRoom && (
          <>
            <span>›</span>
            <span className="text-slate-900 font-bold">{activeRoom.room_name}</span>
          </>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* LEVEL 1: LOCATIONS LIST VIEW (Image 2) */}
      {/* ========================================================================= */}
      {!activeLocation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setEditingLocationId(null);
                setLocationForm(emptyLocation);
              }}
              className="flex items-center gap-1.5 rounded bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 shadow-sm cursor-pointer"
            >
              <MdAdd className="text-base" /> {tModal.locationsBreadcrumb}
            </button>
          </div>

          {loading ? (
            <CardGridSkeleton cards={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {locations.map((loc) => (
                <div
                  key={loc.location_id}
                  onClick={() => handleSelectLocation(loc)}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors shrink-0">
                      <MdLocationOn className="text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors truncate">
                        {loc.location_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{loc.address}</p>
                      <div className="mt-3 flex items-center gap-2.5 text-xs font-medium text-slate-500 flex-wrap">
                        <span>{loc.floors} {tModal.locationCardTitle}</span>
                        <span>•</span>
                        <span>{loc.rooms} {tModal.tasks}</span>
                        <span>•</span>
                        <span>{loc.required_hours_label || "0h"}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => void editLocation(loc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                      title={tModal.editRoom}
                    >
                      <MdEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetLocation(loc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title={tModal.remove}
                    >
                      <MdDelete className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}

              {!locations.length && (
                <div className="col-span-full py-16 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-white">
                  {tModal.noTasks}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: LOCATION DETAIL & ROOMS VIEW (Image 3) */}
      {/* ========================================================================= */}
      {activeLocation && !activeRoom && !roomDetailLoading && !roomDetailError && (
        <div className="space-y-5">
          {/* Location Summary Header Banner matching screenshot */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={handleBackToLocations}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-500 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                title={tModal.locationsBreadcrumb}
                aria-label={tModal.locationsBreadcrumb}
              >
                <MdArrowBack className="text-xl" />
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500 border border-sky-100 shrink-0">
                <TbBuilding className="text-2xl" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 truncate">{activeLocation.location_name}</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{activeLocation.address}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackToLocations}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              {tModal.locationsBreadcrumb}
            </button>
          </div>

          {/* Sub-tabs under Location */}
          <div className="flex border-b border-slate-200 gap-6">
            {([{ value: "Overview", label: "Overview" }, { value: "Rooms", label: tModal.roomsTitle }, { value: "Cleaning plans", label: tModal.cleaningPlanCardTitle }] as const).map(({ value: subTab, label }) => (
              <button
                key={subTab}
                onClick={() => setActiveLocationSubTab(subTab)}
                className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${activeLocationSubTab === subTab
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {label}{" "}
                {subTab === "Rooms"
                  ? `(${locationRooms.length})`
                  : subTab === "Cleaning plans"
                    ? `(${locationPlans.length})`
                    : ""}
              </button>
            ))}
          </div>

          {/* Rooms List Content under Rooms Sub-Tab */}
          {activeLocationSubTab === "Rooms" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingRoomData(null);
                    setAddRoomOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 shadow-sm cursor-pointer"
                >
                  <MdAdd className="text-base" /> {tModal.addRoom}
                </button>
              </div>

              {roomsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">{tModal.tasksTitle}</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {locationRooms.map((room) => (
                    <div
                      key={room.room_id}
                      onClick={() => void handleSelectRoom(room)}
                      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Header: Door icon + Name */}
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                            <TbDoor className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                              {room.room_name}
                            </h4>
                            <p className="text-xs text-amber-600 font-medium capitalize mt-0.5">
                              {room.room_type || "Suite"}
                            </p>
                          </div>
                        </div>

                        {/* 3 Metric Columns */}
                        <div className="mt-5 grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-4">
                          <div>
                            {/* Was showing `monthly_cleaning_frequency` (how many times/month
                                the room is cleaned) mislabeled as "Duration" — the room's actual
                                total minutes is a separate sibling field, `duration`. */}
                            <p className="text-xs font-bold text-slate-800">{room.duration || 0}m</p>
                            <p className="text-[10px] text-slate-400">{tModal.duration}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{room.photo_number || room.total_photos_required || 0}</p>
                            <p className="text-[10px] text-slate-400">{tModal.photos}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{room.task_number || 0}</p>
                            <p className="text-[10px] text-slate-400">{tModal.tasks}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
                          {room.clean_type || "Custom"}
                        </span>
                        <span className="text-xs font-semibold text-sky-600 group-hover:underline">
                          {tModal.editRoom} →
                        </span>
                      </div>
                    </div>
                  ))}

                  {!locationRooms.length && (
                    <div className="col-span-full py-16 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-white">
                      {tModal.noTasks}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeLocationSubTab === "Overview" && (
            <div className="space-y-4">
              {/* Card 1: ADDRESS */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm max-w-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-500">
                  <MdLocationOn className="text-base" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ADDRESS
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {activeLocation.address || "No address provided"}
                </p>
              </div>

              {/* Card 2: 3 Metrics Row (Floors, Rooms, Required / month) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                  <p className="text-base font-bold text-slate-900">
                    {activeLocation.floors || 1}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Floors</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                  <p className="text-base font-bold text-slate-900">
                    {activeLocation.rooms || locationRooms.length || 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Rooms</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                  <p className="text-base font-bold text-slate-900">
                    {activeLocation.required_hours_label || "0h"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Required / month</p>
                </div>
              </div>

              {/* Card 3: Assigned employees */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TbUsers className="text-sky-500 text-xl" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Assigned employees</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Default team for this location
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">0</span>
                </div>

                <div className="border-t border-slate-100 pt-6 pb-4 text-center">
                  <p className="text-xs text-slate-400">No employees assigned yet.</p>
                </div>
              </div>

              {/* Card 4: COVERAGE */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm max-w-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-500">
                  <TbClock className="text-base" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    COVERAGE
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {activeLocation.required_hours_label || "0h"} required hours per month
                </p>
              </div>
            </div>
          )}

          {activeLocationSubTab === "Cleaning plans" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setAddPlanOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 shadow-sm cursor-pointer"
                >
                  <TbPlus className="text-base" /> Add plan
                </button>
              </div>

              {plansLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading cleaning plans...</div>
              ) : !locationPlans.length ? (
                <div className="col-span-full py-16 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-white space-y-1">
                  <TbClipboardList className="mx-auto text-3xl text-slate-300 mb-1" />
                  <p className="font-semibold text-slate-600">No cleaning plans created for this location yet.</p>
                  <p className="text-slate-400">Click &quot;+ Add plan&quot; above to create a new plan.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {locationPlans.map((plan) => {
                    const planObj: CleaningPlan = {
                      id: plan.id,
                      name: plan.title,
                      client: (plan.client_names ?? []).join(", ") || activeLocation.location_name,
                      location: (plan.location_names ?? []).join(", ") || plan.location_name || activeLocation.location_name,
                      rooms: plan.room_names ?? [],
                      duration: plan.duration_minutes,
                      photos: plan.total_photos_count,
                      tasks: plan.total_tasks_count,
                      aiValid: plan.is_active,
                      checklistTasks: [],
                      photoRequirements: [],
                    };

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(planObj)}
                        className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="space-y-3">
                          {/* Header: Clipboard Icon + Title + Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors shrink-0">
                                <TbClipboardList className="text-xl" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors truncate">
                                  {plan.title}
                                </h4>
                                <span
                                  className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${plan.is_active
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                  {plan.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-1 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setEditingPlanId(plan.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                                title="Edit Plan"
                              >
                                <TbPencil className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm(`Delete cleaning plan "${plan.title}"?`)) return;
                                  const r = await deleteCleaningPlan(plan.id);
                                  if (!r.success) return onError(r.error);
                                  if (activeLocation) void loadLocationPlans(activeLocation.location_id);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                title="Delete Plan"
                              >
                                <TbTrash className="text-xs" />
                              </button>
                            </div>
                          </div>

                          {/* Schedule / Time Info */}
                          <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-1.5">
                              <TbClock className="text-slate-400 text-sm shrink-0" />
                              <span className="truncate">
                                {plan.date || "Scheduled"} · {plan.start_time || "08:00 AM"}
                              </span>
                            </div>
                            {plan.repeat_shift && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span>Repeat: <b>{plan.repeat_shift}</b></span>
                              </div>
                            )}
                          </div>

                          {/* Rooms list */}
                          {(plan.room_names || []).length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs">
                              <TbDoor className="text-slate-400 text-sm shrink-0 mt-0.5" />
                              <div className="flex flex-wrap gap-1">
                                {(plan.room_names || []).slice(0, 3).map((rName, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-600 border border-sky-100 truncate max-w-[120px]"
                                  >
                                    {rName}
                                  </span>
                                ))}
                                {(plan.room_names || []).length > 3 && (
                                  <span className="text-[10px] font-medium text-slate-400">
                                    +{(plan.room_names || []).length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Metrics Bar */}
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{plan.duration_minutes || 0}m</p>
                              <p className="text-[10px] text-slate-400">Duration</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{plan.total_photos_count || 0}</p>
                              <p className="text-[10px] text-slate-400">Photos</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{plan.total_tasks_count || 0}</p>
                              <p className="text-[10px] text-slate-400">Tasks</p>
                            </div>
                          </div>

                          {/* Assign Workers Button */}
                          <div
                            className="mt-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setAssigningPlan(planObj)}
                              className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-600 hover:bg-sky-100 hover:border-sky-300 transition-colors cursor-pointer"
                            >
                              <TbUser className="text-sm" /> Assign Workers ({plan.workers_count || 0})
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeLocation && !activeRoom && (roomDetailLoading || roomDetailError) && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={handleBackToRooms}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-500 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
              title={tModal.locationsBreadcrumb}
              aria-label={tModal.locationsBreadcrumb}
            >
              <MdArrowBack className="text-xl" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          {roomDetailLoading ? (
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="space-y-4 lg:col-span-3 rounded-xl border border-slate-200 bg-white p-6">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
              {roomDetailError || `${roomDetailName} not found`}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: ROOM DETAIL & TASKS VIEW (Image 4 & Latest Screenshot) */}
      {/* ========================================================================= */}
      {activeLocation && activeRoom && (
        <div className="space-y-6">
          {/* Top Full-Width Room Banner Card with Left Back Arrow */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBackToRooms}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors cursor-pointer shrink-0"
                title="Back to Rooms"
              >
                <MdArrowBack className="text-xl" />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                <TbDoor className="text-2xl" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 truncate">{activeRoom.room_name}</h2>
                <p className="text-xs text-amber-600 font-semibold capitalize mt-0.5">{activeRoom.room_type || "Suite"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditingRoomData(activeRoom);
                  setAddRoomOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 transition-colors cursor-pointer shadow-sm"
              >
                <MdEdit className="text-sm" /> {tModal.editRoom}
              </button>
            </div>
          </div>

          {/* 2-Column Section: Left Tasks (75%), Right Metrics (25%) */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Left: Tasks Card with 2-Column Grid of Task Cards */}
            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {tModal.tasksTitle} ({(activeRoom.tasks || []).length})
                </h3>
                <button
                  onClick={() => {
                    setIsNewTaskModal(true);
                    setTaskModalIndex((activeRoom.tasks || []).length);
                  }}
                  className="flex items-center gap-1 rounded bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 transition-colors cursor-pointer"
                >
                  <MdAdd className="text-base" /> {tModal.addTask}
                </button>
              </div>

              {!(activeRoom.tasks || []).length ? (
                <p className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                  {tModal.noTasks}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(activeRoom.tasks || []).map((task, index) => (
                    <div
                      key={task.id || index}
                      onClick={() => {
                        setIsNewTaskModal(false);
                        setTaskModalIndex(index);
                      }}
                      className="group flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                          {task.name}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {/* Tasks fetched from the backend only ever carry `duration_minutes`
                                (never `duration`), so `task.duration` was always undefined here —
                                every task showed the same hardcoded 15m fallback regardless of
                                its real value. */}
                            {task.duration_minutes ?? task.duration ?? 15}m
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsNewTaskModal(false);
                              setTaskModalIndex(index);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                            title={tModal.editTask}
                          >
                            <MdEdit className="text-sm" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600 border border-sky-100">
                          <TbRefresh className="text-xs" />
                          {formatFrequencyLabel(task)}
                        </span>

                        {task.is_photo_req && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                            {tModal.photoRequiredBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Metrics Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* 3 Metrics Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-center">
                  <TbClock className="mx-auto text-lg text-slate-400 mb-0.5" />
                  <p className="text-xs font-bold text-slate-900">{activeRoom.duration || 116}m</p>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">{tModal.duration}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-center">
                  <TbPhoto className="mx-auto text-lg text-slate-400 mb-0.5" />
                  <p className="text-xs font-bold text-slate-900">{activeRoom.photo_number || 0}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">{tModal.photos}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-center">
                  <MdChecklist className="mx-auto text-lg text-slate-400 mb-0.5" />
                  <p className="text-xs font-bold text-slate-900">
                    {activeRoom.tasks?.length || activeRoom.task_number || 0}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">{tModal.tasks}</p>
                </div>
              </div>

              {/* Location Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MdLocationOn className="text-sky-500" /> {tModal.locationCardTitle}
                </p>
                <p className="text-xs font-bold text-slate-800 truncate">{activeRoom.location_name}</p>
              </div>

              {/* Cleaning Plan Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <TbRefresh className="text-sky-500" /> {tModal.cleaningPlanCardTitle}
                </p>
                <p className="text-xs font-bold text-slate-800 capitalize">{activeRoom.clean_type || "custom"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Location Add/Edit Modal */}
      {locationForm && (
        <LocationModal
          form={locationForm}
          setForm={setLocationForm}
          editing={Boolean(editingLocationId)}
          saving={saving}
          onClose={() => setLocationForm(null)}
          onSave={() => void saveLocation()}
        />
      )}

      {/* 2. Room Add/Edit Modal (Image 5) */}
      {addRoomOpen && activeLocation && (
        <ClientRoomModal
          locationId={activeLocation.location_id}
          locationName={activeLocation.location_name}
          initialData={editingRoomData}
          onClose={() => {
            setAddRoomOpen(false);
            setEditingRoomData(null);
          }}
          onSaved={(updatedRoom) => {
            if (activeLocation) void loadRooms(activeLocation.location_id);
            if (updatedRoom && activeRoom?.id === updatedRoom.id) {
              setActiveRoom(updatedRoom);
            } else if (activeRoom) {
              void getRoom(activeRoom.id).then((res) => {
                if (res.success) setActiveRoom(res.data);
              });
            }
            void loadLocations();
          }}
          onError={onError}
        />
      )}

      {/* 3. Single Task Edit/Add Modal (Image 4 Overlay) */}
      {taskModalIndex !== null && activeRoom && (
        isNewTaskModal || activeRoom.tasks[taskModalIndex] ? (
          <TaskEditModal
            task={
              isNewTaskModal
                ? blankTask()
                : activeRoom.tasks[taskModalIndex]
            }
            isNew={isNewTaskModal}
            locale={currentLocale}
            onClose={() => setTaskModalIndex(null)}
            onSave={async (updatedTask) => {
              const nextTasks: RoomTaskInput[] = (activeRoom.tasks || []).map((t) => ({ ...t }));
              if (isNewTaskModal) {
                nextTasks.push(updatedTask);
              } else {
                if (taskModalIndex !== null) {
                  nextTasks[taskModalIndex] = updatedTask;
                }
              }

              const formattedTasks = nextTasks.map((t) => {
                const freq =
                  t.frequency_type === "daily"
                    ? "every_visit"
                    : t.frequency_type || "every_visit";
                const isPhotoReq = Boolean(t.is_photo_req);
                const photo = isPhotoReq
                  ? (t.photo || [])
                    .filter((p) => p.name.trim() !== "")
                    .map((p) => ({ ...(p.id ? { id: p.id } : {}), name: p.name.trim() }))
                  : [];

                // Untouched sibling tasks come straight from the fetched room (which only ever
                // carries `duration_minutes`, never `duration`) — falling back to `t.duration`
                // alone here sent `duration_minutes: 0` for every task except the one actually
                // being edited in this session, since only that one had `duration` set.
                const durationMinutes = Number(t.duration_minutes ?? t.duration) || 0;
                const taskObj: RoomTaskInput = {
                  ...(t.id ? { id: t.id } : {}),
                  name: t.name.trim(),
                  frequency_type: freq,
                  is_photo_req: isPhotoReq,
                  duration: durationMinutes || 15,
                  duration_minutes: durationMinutes,
                  photo,
                };

                if (freq === "weekly") {
                  const days = (t.days_of_week || ["Mon", "Fri"]).map((d) =>
                    d.toLowerCase()
                  );
                  taskObj.days_of_week = Array.from(new Set(days));
                } else if (freq === "monthly") {
                  const dates = (t.days_of_month || [1, 15]).map(Number);
                  taskObj.days_of_month = Array.from(new Set(dates)).sort((a, b) => a - b);
                }

                return taskObj;
              });

              const calculatedDuration = formattedTasks.reduce(
                (acc, t) => acc + (Number(t.duration) || 0),
                0
              );

              setSaving(true);
              const res = await updateRoom(activeRoom.id, {
                room_name: activeRoom.room_name,
                room_type: activeRoom.room_type,
                clean_type: activeRoom.clean_type,
                floor: activeRoom.floor || 1,
                duration: calculatedDuration || activeRoom.duration,
                monthly_cleaning_frequency: activeRoom.monthly_cleaning_frequency,
                tasks: formattedTasks,
              });
              setSaving(false);

              if (!res.success) return onError(res.error);
              setActiveRoom(res.data);
              if (activeLocation) void loadRooms(activeLocation.location_id);
              setTaskModalIndex(null);
            }}
          />
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl">
              <p className="text-sm font-semibold text-red-600">
                {`${tModal.tasksTitle} ${taskModalIndex + 1} not found`}
              </p>
              <button
                type="button"
                onClick={() => setTaskModalIndex(null)}
                className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
              >
                {tModal.cancel}
              </button>
            </div>
          </div>
        )
      )}

      {/* Delete Location Confirm */}
      {deleteTargetLocation && (
        <Confirm
          title="Delete Location?"
          description={`Are you sure you want to delete ${deleteTargetLocation.location_name}? All rooms and tasks under it will be removed.`}
          saving={saving}
          onClose={() => !saving && setDeleteTargetLocation(null)}
          onConfirm={() => void removeLocation()}
        />
      )}

      {/* Delete Room Confirm */}
      {deleteTargetRoom && (
        <Confirm
          title="Delete Room?"
          description={`Are you sure you want to delete room "${deleteTargetRoom.room_name}"?`}
          saving={saving}
          onClose={() => !saving && setDeleteTargetRoom(null)}
          onConfirm={() => void removeRoom()}
        />
      )}

      {/* 4. Cleaning Plan Add/Edit Modal */}
      {(addPlanOpen || editingPlanId) && (
        <CreatePlanModal
          planId={editingPlanId || undefined}
          onClose={() => {
            setAddPlanOpen(false);
            setEditingPlanId(null);
          }}
          onAdd={() => {
            setAddPlanOpen(false);
            setEditingPlanId(null);
            if (activeLocation) {
              void loadLocationPlans(activeLocation.location_id);
            }
          }}
        />
      )}

      {/* 5. Worker Assignment Modal */}
      {assigningPlan && (
        <WorkerAssignmentModal
          planId={assigningPlan.id}
          planTitle={assigningPlan.name}
          onClose={() => setAssigningPlan(null)}
          onAssigned={() => {
            setAssigningPlan(null);
            if (activeLocation) {
              void loadLocationPlans(activeLocation.location_id);
            }
          }}
        />
      )}

      {/* 6. Plan Details Sidebar */}
      {selectedPlan && (
        <PlanDetailSidebar
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onEdit={() => {
            setEditingPlanId(selectedPlan.id);
            setSelectedPlan(null);
          }}
          onAssign={() => {
            setAssigningPlan(selectedPlan);
            setSelectedPlan(null);
          }}
          onDelete={async (id) => {
            const r = await deleteCleaningPlan(id);
            if (!r.success) return onError(r.error);
            setSelectedPlan(null);
            if (activeLocation) {
              void loadLocationPlans(activeLocation.location_id);
            }
          }}
        />
      )}
    </div>
  );
}

{/* ========================================================================= */ }
{/* TASK EDIT MODAL COMPONENT (Image 4) */ }
{/* ========================================================================= */ }
function TaskEditModal({
  task: initialTask,
  isNew,
  locale = "en",
  onClose,
  onSave,
}: {
  task: RoomTaskInput;
  isNew?: boolean;
  locale?: string;
  onClose: () => void;
  onSave: (task: RoomTaskInput) => void;
}) {
  const t = taskModalTranslations[locale] || taskModalTranslations.en;

  const [task, setTask] = useState<RoomTaskInput>(() => {
    const freq =
      initialTask.frequency_type === "every_visit"
        ? "daily"
        : initialTask.frequency_type || "daily";

    const rawWeekly = initialTask.days_of_week || ["mon", "fri"];
    const weeklyDaysFormatted = rawWeekly.map((d: string) => {
      const s = String(d).toLowerCase();
      return s.charAt(0).toUpperCase() + s.slice(1);
    });

    const rawMonthly = initialTask.days_of_month || [1, 15];

    return {
      ...initialTask,
      frequency_type: freq,
      duration: initialTask.duration_minutes ?? initialTask.duration ?? 15,
      days_of_week: weeklyDaysFormatted,
      days_of_month: rawMonthly,
      is_photo_req: Boolean(initialTask.is_photo_req || initialTask.photo?.length),
      photo: (initialTask.photo || []).map((p: any) => ({
        id: p.id,
        name: typeof p === "string" ? p : p.name || "",
      })),
    };
  });

  const controlClass =
    "h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

  return (
    <div
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">{isNew ? t.addTask : t.editTask}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(task);
          }}
          className="space-y-4 p-6 text-xs"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {t.taskName}
            </label>
            <input
              required
              value={task.name}
              onChange={(e) => setTask({ ...task, name: e.target.value })}
              placeholder={t.addTaskPlaceholder}
              className={`mt-1 ${controlClass}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.frequencyType}
              </label>
              <select
                value={task.frequency_type}
                onChange={(e) => setTask({ ...task, frequency_type: e.target.value })}
                className={`mt-1 ${controlClass}`}
              >
                <option value="daily">{t.daily}</option>
                <option value="weekly">{t.weekly}</option>
                <option value="monthly">{t.monthly}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.durationMin}
              </label>
              <input
                type="number"
                min={1}
                value={task.duration ?? ""}
                onChange={(e) =>
                  setTask({
                    ...task,
                    duration: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder={t.durationPlaceholder}
                className={`mt-1 ${controlClass}`}
              />
            </div>
          </div>

          {/* Conditional Weekdays selection grid for Weekly frequency */}
          {task.frequency_type === "weekly" && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-600">
                {t.weekDays}
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {[
                  { value: "Mon", label: "Mon" },
                  { value: "Tue", label: "Tue" },
                  { value: "Wed", label: "Wed" },
                  { value: "Thu", label: "Thu" },
                  { value: "Fri", label: "Fri" },
                  { value: "Sat", label: "Sat" },
                  { value: "Sun", label: "Sun" },
                ].map((day) => {
                  const isSelected = (task.days_of_week || []).includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const current = task.days_of_week || [];
                        const next = current.includes(day.value)
                          ? current.filter((d) => d !== day.value)
                          : [...current, day.value];
                        setTask({ ...task, days_of_week: next });
                      }}
                      className={`h-9 rounded border text-xs font-semibold transition-colors cursor-pointer ${isSelected
                        ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                        : "border-gray-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {t.days[day.value] || day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditional Month Dates selection grid for Monthly frequency */}
          {task.frequency_type === "monthly" && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-600">
                {t.datesOfMonth}
              </label>
              <div className="grid grid-cols-9 gap-1.5">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dateNum) => {
                  const isSelected = (task.days_of_month || []).includes(dateNum);
                  return (
                    <button
                      key={dateNum}
                      type="button"
                      onClick={() => {
                        const current = task.days_of_month || [];
                        const next = current.includes(dateNum)
                          ? current.filter((d) => d !== dateNum)
                          : [...current, dateNum];
                        setTask({ ...task, days_of_month: next });
                      }}
                      className={`h-8 rounded border text-xs font-semibold transition-colors cursor-pointer ${isSelected
                        ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                        : "border-gray-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {dateNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo Required Checkbox + Inputs matching latest screenshot */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={task.is_photo_req}
                onChange={(e) =>
                  setTask({
                    ...task,
                    is_photo_req: e.target.checked,
                    photo: e.target.checked
                      ? (task.photo && task.photo.length ? task.photo : [{ name: "" }])
                      : [],
                  })
                }
                className="h-4 w-4 accent-sky-500 rounded"
              />
              {t.photoRequired}
            </label>

            {task.is_photo_req && (
              <div className="space-y-2 border-l-2 border-sky-400 pl-3 pt-1">
                {(task.photo || []).map((photoItem, photoIdx) => (
                  <div key={photoIdx} className="flex items-center gap-2">
                    <input
                      required
                      value={photoItem.name}
                      onChange={(e) => {
                        const nextPhotos = (task.photo || []).map((p, i) =>
                          i === photoIdx ? { ...p, name: e.target.value } : p
                        );
                        setTask({ ...task, photo: nextPhotos });
                      }}
                      placeholder={t.requiredPhotoNamePlaceholder}
                      className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextPhotos = (task.photo || []).filter((_, i) => i !== photoIdx);
                        setTask({ ...task, photo: nextPhotos });
                      }}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                    >
                      {t.remove}
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const nextPhotos = [...(task.photo || []), { name: "" }];
                    setTask({ ...task, photo: nextPhotos });
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline cursor-pointer pt-1"
                >
                  {t.addPhoto}
                </button>
              </div>
            )}
          </div>

          <footer className="flex justify-end gap-2 border-t pt-4 bg-slate-50 -mx-6 -mb-6 p-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="rounded bg-sky-500 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-600 shadow-sm cursor-pointer"
            >
              {t.saveTask}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function LocationModal({
  form,
  setForm,
  editing,
  saving,
  onClose,
  onSave,
}: {
  form: LocationInput;
  setForm: (x: LocationInput) => void;
  editing: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl space-y-4"
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="font-bold text-slate-900 text-base">{editing ? "Edit" : "Add"} Location</h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <MdClose className="text-xl" />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 text-xs">
          <Field label="Location Name *" value={form.name} set={(v) => setForm({ ...form, name: v })} />
          <label className="block font-semibold text-slate-600">
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 h-10 w-full rounded border px-3 bg-white text-slate-800 outline-none"
            >
              <option value="office">Office</option>
              <option value="hotel">Hotel</option>
              <option value="school">School</option>
              <option value="hospital">Hospital</option>
              <option value="other">Other</option>
            </select>
          </label>
          {/* Address — Google Places Autocomplete; picking a suggestion captures lat/lng
              automatically, no separate coordinate fields needed. */}
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-600">Address *</label>
            <AddressAutocompleteInput
              required
              value={form.address}
              onChange={(address) => setForm({ ...form, address })}
              onPlaceSelect={({ address, latitude, longitude }) => setForm({ ...form, address, latitude, longitude })}
              placeholder="Start typing an address..."
              className="mt-1 h-10 w-full rounded border px-3 text-sm outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              {form.latitude !== undefined && form.longitude !== undefined
                ? `Coordinates set: ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)} — workers must be within 50m to check in.`
                : "Pick a suggestion from the list to capture coordinates for geofenced worker check-in."}
            </p>
          </div>
          <label className="block font-semibold text-slate-600">
            Floors
            <input
              type="number"
              min={1}
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
              className="mt-1 h-10 w-full rounded border px-3 outline-none"
            />
          </label>
          <label className="block font-semibold text-slate-600 md:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 min-h-20 w-full rounded border p-3 outline-none"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t pt-3">
          <button type="button" onClick={onClose} className="rounded border px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button disabled={saving} className="rounded bg-sky-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 shadow-sm">
            {saving ? "Saving..." : "Save Location"}
          </button>
        </div>
      </form>
    </div>
  );
}

const Field = ({ label, value, set }: { label: string; value: string; set: (v: string) => void }) => (
  <label className="block font-semibold text-slate-600">
    {label}
    <input required value={value} onChange={(e) => set(e.target.value)} className="mt-1 h-10 w-full rounded border px-3 outline-none" />
  </label>
);

function Confirm({
  title,
  description,
  saving,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">{title}</h2>
        <p className="text-xs leading-5 text-slate-500">{description}</p>
        <div className="flex justify-end gap-2 border-t pt-3">
          <button disabled={saving} onClick={onClose} className="rounded border px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button disabled={saving} onClick={onConfirm} className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            {saving ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
