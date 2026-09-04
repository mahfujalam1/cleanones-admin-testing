export interface DashboardTranslationDict {
  nav: {
    dashboard: string; roster: string; shiftMonitoring: string; workers: string;
    clients: string; chat: string; locations: string; rooms: string; cleaningPlans: string;
    extraServices: string; qualityControl: string; photoReviews: string;
    escalations: string; reports: string; notifications: string; settings: string;
    administration: string; managerAccess: string; signOut: string;
  };
  topbar: {
    notifications: string; viewAll: string; noNotifications: string;
    profile: string; helpCenter: string; liveChat: string; emailSupport: string;
    faq: string; getSupport: string;
  };
  common: {
    search: string; allClients: string; allLocations: string; allRooms: string;
    allWorkers: string; active: string; inactive: string; assignWorkers: string;
    bulkImport: string; noDataFound: string; adjustFilters: string;
    duration: string; photos: string; tasks: string; rooms: string; floors: string;
    required: string; previous: string; next: string; showing: string; of: string;
    total: string; cancel: string; save: string; delete: string; edit: string; status: string;
    actions: string;
  };
  plans: {
    title: string; addPlan: string; searchPlaceholder: string; noPlansFound: string;
  };
  rooms: {
    title: string; addRoom: string; searchPlaceholder: string; noRoomsFound: string;
  };
  locations: {
    title: string; addLocation: string; searchPlaceholder: string; noLocationsFound: string;
  };
  workers: {
    title: string; addWorker: string; searchPlaceholder: string; totalWorkers: string;
    employees: string; freelancers: string; pendingApprovals: string;
  };
  clients: {
    title: string; addClient: string; searchPlaceholder: string; noClientsFound: string;
  };
  dashboard: {
    overview: string; totalClients: string; totalLocations: string; totalRooms: string;
    activeWorkers: string; inProgressShifts: string; workerAttendance: string;
    createOrAdd: string; createShift: string; addClientOrLocation: string;
    bulkImportData: string; peopleNeedAttention: string; allOnTime: string;
    noWorkersRequireAttention: string; allShiftsOnSchedule: string;
    fallingBehindSchedule: string; alerts: string; allActiveShiftsProgressing: string;
    shiftNearlyOver: string; activeShifts: string; workersOnSite: string;
    lateNoShow: string; reviewsPending: string; liveOperationsByClient: string;
    locationsFirst: string; all: string; onTime: string; late: string;
    noShow: string; openEscalations: string; allEscalationsResolved: string;
    attendanceAlert: string; callEmployee: string;
    goodMorning: string; goodAfternoon: string; goodEvening: string;
  };
  shiftMonitoring: {
    title: string; shiftsCount: string; onTimeCount: string; lateCount: string;
    missingCount: string; searchPlaceholder: string; allStatuses: string;
    onTime: string; late: string; missing: string; noLiveShifts: string;
    employeeDetails: string; hoursWorked: string; totalShifts: string;
    lateDays: string; avgDuration: string; freelancer: string; employee: string;
  };
  extraServices: {
    title: string; searchPlaceholder: string; allStatuses: string; underReview: string;
    approved: string; inProgress: string; completed: string; rejected: string;
    noRequests: string; requestId: string; description: string; client: string;
    location: string; room: string; preferredDate: string; priority: string;
    status: string; assignedWorkers: string; assignWorker: string; reject: string;
    complete: string; rejectionReason: string;
  };
  photoReviews: {
    title: string; searchPlaceholder: string; allStatuses: string; pending: string;
    approved: string; rejected: string; noReviews: string; reviewDetails: string;
    score: string; feedback: string; approve: string; reject: string;
    reviewId: string; aiConfidence: string; actions: string;
  };
  escalations: {
    title: string; searchPlaceholder: string; allStatuses: string; open: string;
    resolved: string; closed: string; noEscalations: string; priority: string;
    resolve: string;
  };
  reports: {
    title: string; exportPdf: string; exportCsv: string; generate: string;
    cleaningSummary: string; workerPerformance: string; clientSatisfaction: string;
    week: string; month: string; quarter: string; year: string; pdf: string;
    exporting: string; totalShifts: string; totalPhotosApproved: string; escalations: string;
    shiftTrends: string; photoQualityDistribution: string; approved: string; pending: string; rejected: string;
  };
  notifications: {
    title: string; markAllRead: string; noNotifications: string; unread: string;
    notificationCenter: string; newNotifications: string; marking: string;
  };
  settings: {
    title: string; companyProfile: string; notifications: string; security: string;
    language: string; theme: string; saveChanges: string; changePassword: string;
    legal: string; companyName: string; companyEmail: string; phoneNumber: string;
    address: string; website: string; currentPassword: string; newPassword: string;
    confirmPassword: string; updatePassword: string; updating: string; saving: string;
    privacyPolicy: string; privacyPolicySubtitle: string; termsAndConditions: string;
    termsAndConditionsSubtitle: string;
  };
  roster: {
    title: string; addShift: string; searchPlaceholder: string; worker: string;
    location: string; room: string; startTime: string; endTime: string;
    date: string; createShift: string; weekView: string; dayView: string; noShifts: string;
  };
  managerAccess: {
    title: string; addManager: string; name: string; email: string; role: string;
    permissions: string; activeManagers: string; noManagers: string;
  };
  chat: {
    title: string; typeMessage: string; send: string; noMessages: string; activeChats: string;
  };
}

export const translations: Record<string, DashboardTranslationDict> = {
  en: {
    nav: {
      dashboard: "Dashboard", roster: "Roster", shiftMonitoring: "Shift Monitoring", workers: "Workers",
      clients: "Clients", chat: "Chat", locations: "Locations", rooms: "Rooms", cleaningPlans: "Cleaning Plans",
      extraServices: "Extra Services", qualityControl: "Quality Control", photoReviews: "Photo Reviews",
      escalations: "Escalations", reports: "Reports", notifications: "Notifications", settings: "Settings",
      administration: "Administration", managerAccess: "Manager Access", signOut: "Sign Out",
    },
    topbar: {
      notifications: "Notifications", viewAll: "View all", noNotifications: "No notifications",
      profile: "Profile", helpCenter: "Help Center", liveChat: "Live Chat", emailSupport: "Email Support",
      faq: "Frequently Asked Questions", getSupport: "Get support or find answers",
    },
    common: {
      search: "Search", allClients: "All Clients", allLocations: "All Locations", allRooms: "All Rooms",
      allWorkers: "All Workers", active: "Active", inactive: "Inactive", assignWorkers: "Assign workers",
      bulkImport: "Bulk Import", noDataFound: "No data found", adjustFilters: "Try adjusting search or filters.",
      duration: "Duration", photos: "Photos", tasks: "Tasks", rooms: "rooms", floors: "Floors",
      required: "Required", previous: "Previous", next: "Next", showing: "Showing", of: "of",
      total: "Total", cancel: "Cancel", save: "Save", delete: "Delete", edit: "Edit", status: "Status",
      actions: "Actions",
    },
    plans: {
      title: "Cleaning Plans", addPlan: "+ Add Cleaning Plan", searchPlaceholder: "Search cleaning plans...",
      noPlansFound: "No cleaning plans found",
    },
    rooms: {
      title: "Rooms", addRoom: "+ Add Room", searchPlaceholder: "Search rooms...",
      noRoomsFound: "No rooms found",
    },
    locations: {
      title: "Locations", addLocation: "+ Add Location", searchPlaceholder: "Search locations...",
      noLocationsFound: "No locations found",
    },
    workers: {
      title: "Workers", addWorker: "Add Worker", searchPlaceholder: "Search workers...",
      totalWorkers: "Total Workers", employees: "Employees", freelancers: "Freelancers",
      pendingApprovals: "Pending Approvals",
    },
    clients: {
      title: "Clients", addClient: "+ Add Client", searchPlaceholder: "Search clients...",
      noClientsFound: "No clients found",
    },
    dashboard: {
      overview: "Operations overview", totalClients: "Total Clients", totalLocations: "Total Locations",
      totalRooms: "Total Rooms", activeWorkers: "Active Workers", inProgressShifts: "In Progress Shifts",
      workerAttendance: "Worker Attendance Summary",
      createOrAdd: "Create or add", createShift: "Create a shift", addClientOrLocation: "Add client or location",
      bulkImportData: "Bulk import data", peopleNeedAttention: "people need attention", allOnTime: "All on time",
      noWorkersRequireAttention: "No workers require immediate attention or replacement.",
      allShiftsOnSchedule: "✓ All shifts on schedule", fallingBehindSchedule: "Falling behind schedule",
      alerts: "alerts", allActiveShiftsProgressing: "All active shifts are currently progressing according to schedule.",
      shiftNearlyOver: "Shift is nearly over and assigned objects may not finish on time.",
      activeShifts: "Active shifts", workersOnSite: "Workers on site", lateNoShow: "Late / no show",
      reviewsPending: "Reviews pending", liveOperationsByClient: "Live operations by client",
      locationsFirst: "Locations first, then people working there", all: "All", onTime: "On time",
      late: "Late", noShow: "No show", openEscalations: "open escalations",
      allEscalationsResolved: "All escalations resolved", attendanceAlert: "Attendance Alert",
      callEmployee: "Call employee",
      goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    },
    shiftMonitoring: {
      title: "Live shifts by location", shiftsCount: "shifts", onTimeCount: "on time", lateCount: "late",
      missingCount: "missing", searchPlaceholder: "Search worker or location...", allStatuses: "All statuses",
      onTime: "On Time", late: "Late", missing: "Missing", noLiveShifts: "No live shifts",
      employeeDetails: "Employee Details", hoursWorked: "Hours worked", totalShifts: "Total shifts",
      lateDays: "Late days", avgDuration: "Avg duration", freelancer: "Freelancer", employee: "Employee",
    },
    extraServices: {
      title: "Extra Services", searchPlaceholder: "Search extra services...", allStatuses: "All statuses",
      underReview: "Under Review", approved: "Approved", inProgress: "In Progress", completed: "Completed",
      rejected: "Rejected", noRequests: "No extra service requests found", requestId: "Request ID",
      description: "Description", client: "Client", location: "Location", room: "Room", preferredDate: "Preferred Date",
      priority: "Priority", status: "Status", assignedWorkers: "Assigned Workers", assignWorker: "Assign Worker",
      reject: "Reject", complete: "Mark Complete", rejectionReason: "Rejection Reason",
    },
    photoReviews: {
      title: "Photo Reviews", searchPlaceholder: "Search by ID, cleaner, location, room...", allStatuses: "All statuses",
      pending: "Pending", approved: "Approved", rejected: "Rejected", noReviews: "No reviews found.",
      reviewDetails: "Review Details", score: "Score", feedback: "Feedback", approve: "Approve", reject: "Reject",
      reviewId: "Review ID", aiConfidence: "AI Confidence", actions: "Actions",
    },
    escalations: {
      title: "Escalations", searchPlaceholder: "Search escalations...", allStatuses: "All statuses",
      open: "Open", resolved: "Resolved", closed: "Closed", noEscalations: "No escalations found",
      priority: "Priority", resolve: "Resolve Escalation",
    },
    reports: {
      title: "Reports & Analytics", exportPdf: "Export PDF", exportCsv: "Export CSV", generate: "Generate Report",
      cleaningSummary: "Cleaning Summary", workerPerformance: "Worker Performance", clientSatisfaction: "Client Satisfaction",
      week: "Week", month: "Month", quarter: "Quarter", year: "Year", pdf: "PDF", exporting: "Exporting...",
      totalShifts: "Total Shifts", totalPhotosApproved: "Total Photos Approved", escalations: "Escalations",
      shiftTrends: "Shift Trends", photoQualityDistribution: "Photo Quality Distribution",
      approved: "Approved", pending: "Pending", rejected: "Rejected",
    },
    notifications: {
      title: "Notifications", markAllRead: "Mark all as read", noNotifications: "No new notifications", unread: "Unread",
      notificationCenter: "Notification Center", newNotifications: "new", marking: "Marking...",
    },
    settings: {
      title: "Settings", companyProfile: "Company Profile", notifications: "Notification Preferences",
      security: "Security & Passwords", language: "Language", theme: "Theme", saveChanges: "Save Changes",
      changePassword: "Change Password", legal: "Legal", companyName: "Company Name", companyEmail: "Company Email",
      phoneNumber: "Phone Number", address: "Address", website: "Website", currentPassword: "Current Password",
      newPassword: "New Password", confirmPassword: "Confirm New Password", updatePassword: "Update Password",
      updating: "Updating...", saving: "Saving...", privacyPolicy: "Privacy Policy",
      privacyPolicySubtitle: "How we collect and protect your data", termsAndConditions: "Terms & Conditions",
      termsAndConditionsSubtitle: "Rules and guidelines for platform use",
    },
    roster: {
      title: "Shift Roster", addShift: "+ Create Shift", searchPlaceholder: "Search roster...",
      worker: "Worker", location: "Location", room: "Room", startTime: "Start Time", endTime: "End Time",
      date: "Date", createShift: "Create Shift", weekView: "Week View", dayView: "Day View", noShifts: "No shifts scheduled",
    },
    managerAccess: {
      title: "Manager Access Control", addManager: "+ Add Manager", name: "Name", email: "Email",
      role: "Role", permissions: "Permissions", activeManagers: "Active Managers", noManagers: "No managers found",
    },
    chat: {
      title: "Live Operations Chat", typeMessage: "Type a message...", send: "Send", noMessages: "No messages yet", activeChats: "Active Conversations",
    },
  },
  nl: {
    nav: {
      dashboard: "Dashboard", roster: "Rooster", shiftMonitoring: "Dienstbewaking", workers: "Medewerkers",
      clients: "Klanten", chat: "Chat", locations: "Locaties", rooms: "Kamers", cleaningPlans: "Schoonmaakplannen",
      extraServices: "Extra Services", qualityControl: "Kwaliteitscontrole", photoReviews: "Fotobeoordelingen",
      escalations: "Escalaties", reports: "Rapporten", notifications: "Meldingen", settings: "Instellingen",
      administration: "Beheer", managerAccess: "Manager Toegang", signOut: "Uitloggen",
    },
    topbar: {
      notifications: "Meldingen", viewAll: "Alles bekijken", noNotifications: "Geen meldingen",
      profile: "Profiel", helpCenter: "Helpcentrum", liveChat: "Livechat", emailSupport: "E-mailondersteuning",
      faq: "Veelgestelde vragen", getSupport: "Krijg ondersteuning of vind antwoorden",
    },
    common: {
      search: "Zoeken", allClients: "Alle Klanten", allLocations: "Alle Locaties", allRooms: "Alle Kamers",
      allWorkers: "Alle Medewerkers", active: "Actief", inactive: "Inactief", assignWorkers: "Wijs medewerkers toe",
      bulkImport: "Bulk Importeren", noDataFound: "Geen gegevens gevonden", adjustFilters: "Probeer de zoekopdracht of filters aan te passen.",
      duration: "Duur", photos: "Foto's", tasks: "Taken", rooms: "kamers", floors: "Verdiepingen",
      required: "Vereist", previous: "Vorige", next: "Volgende", showing: "Toont", of: "van",
      total: "Totaal", cancel: "Annuleren", save: "Opslaan", delete: "Verwijderen", edit: "Bewerken", status: "Status",
      actions: "Acties",
    },
    plans: {
      title: "Schoonmaakplannen", addPlan: "+ Schoonmaakplan toevoegen", searchPlaceholder: "Zoek schoonmaakplannen...",
      noPlansFound: "Geen schoonmaakplannen gevonden",
    },
    rooms: {
      title: "Kamers", addRoom: "+ Kamer toevoegen", searchPlaceholder: "Zoek kamers...",
      noRoomsFound: "Geen kamers gevonden",
    },
    locations: {
      title: "Locaties", addLocation: "+ Locatie toevoegen", searchPlaceholder: "Zoek locaties...",
      noLocationsFound: "Geen locaties gevonden",
    },
    workers: {
      title: "Medewerkers", addWorker: "Medewerker toevoegen", searchPlaceholder: "Zoek medewerkers...",
      totalWorkers: "Totaal Medewerkers", employees: "Werknemers", freelancers: "Freelancers",
      pendingApprovals: "In afwachting van goedkeuring",
    },
    clients: {
      title: "Klanten", addClient: "+ Klant toevoegen", searchPlaceholder: "Zoek klanten...",
      noClientsFound: "Geen klanten gevonden",
    },
    dashboard: {
      overview: "Operationeel overzicht", totalClients: "Totaal Klanten", totalLocations: "Totaal Locaties",
      totalRooms: "Totaal Kamers", activeWorkers: "Actieve Medewerkers", inProgressShifts: "Diensten in uitvoering",
      workerAttendance: "Samenvatting Medewerkersaanwezigheid",
      createOrAdd: "Maken of toevoegen", createShift: "Dienst maken", addClientOrLocation: "Klant of locatie toevoegen",
      bulkImportData: "Bulkgegevens importeren", peopleNeedAttention: "mensen hebben aandacht nodig", allOnTime: "Alles op tijd",
      noWorkersRequireAttention: "Geen medewerkers vereisen onmiddellijke aandacht of vervanging.",
      allShiftsOnSchedule: "✓ Alle diensten op schema", fallingBehindSchedule: "Lopen achter op schema",
      alerts: "meldingen", allActiveShiftsProgressing: "Alle actieve diensten verlopen momenteel volgens schema.",
      shiftNearlyOver: "De dienst is bijna afgelopen en toegewezen ruimtes zijn mogelijk niet op tijd klaar.",
      activeShifts: "Actieve diensten", workersOnSite: "Medewerkers op locatie", lateNoShow: "Te laat / afwezig",
      reviewsPending: "Beoordelingen in behandeling", liveOperationsByClient: "Live operaties per klant",
      locationsFirst: "Eerst locaties, dan medewerkers daar", all: "Alles", onTime: "Op tijd",
      late: "Te laat", noShow: "Niet verschenen", openEscalations: "openstaande escalaties",
      allEscalationsResolved: "Alle escalaties opgelost", attendanceAlert: "Aanwezigheidsmelding",
      callEmployee: "Bellen medewerker",
      goodMorning: "Goedemorgen", goodAfternoon: "Goedemiddag", goodEvening: "Goedenavond",
    },
    shiftMonitoring: {
      title: "Live diensten per locatie", shiftsCount: "diensten", onTimeCount: "op tijd", lateCount: "te laat",
      missingCount: "afwezig", searchPlaceholder: "Zoek medewerker of locatie...", allStatuses: "Alle statussen",
      onTime: "Op Tijd", late: "Te Laat", missing: "Afwezig", noLiveShifts: "Geen live diensten",
      employeeDetails: "Medewerkersdetails", hoursWorked: "Gewerkt uren", totalShifts: "Totaal diensten",
      lateDays: "Dagen te laat", avgDuration: "Gem. duur", freelancer: "Freelancer", employee: "Werknemer",
    },
    extraServices: {
      title: "Extra Services", searchPlaceholder: "Zoek extra services...", allStatuses: "Alle statussen",
      underReview: "In Behandeling", approved: "Goedgekeurd", inProgress: "In Uitvoering", completed: "Voltooid",
      rejected: "Afgewezen", noRequests: "Geen extra serviceaanvragen gevonden", requestId: "Aanvraag ID",
      description: "Beschrijving", client: "Klant", location: "Locatie", room: "Kamer", preferredDate: "Voorkeursdatum",
      priority: "Prioriteit", status: "Status", assignedWorkers: "Toegewezen Medewerkers", assignWorker: "Medewerker Toewijzen",
      reject: "Afwijzen", complete: "Markeren als Voltooid", rejectionReason: "Reden van afwijzing",
    },
    photoReviews: {
      title: "Fotobeoordelingen", searchPlaceholder: "Zoek op ID, schoonmaker, locatie, kamer...", allStatuses: "Alle statussen",
      pending: "In behandeling", approved: "Goedgekeurd", rejected: "Afgewezen", noReviews: "Geen beoordelingen gevonden.",
      reviewDetails: "Beoordelingsdetails", score: "Score", feedback: "Feedback", approve: "Goedkeuren", reject: "Afwijzen",
      reviewId: "Beoordelings-ID", aiConfidence: "AI-vertrouwen", actions: "Acties",
    },
    escalations: {
      title: "Escalaties", searchPlaceholder: "Zoek escalaties...", allStatuses: "Alle statussen",
      open: "Open", resolved: "Opgelost", closed: "Gesloten", noEscalations: "Geen escalaties gevonden",
      priority: "Prioriteit", resolve: "Escalatie Oplossen",
    },
    reports: {
      title: "Rapporten & Analytiek", exportPdf: "Exporteer PDF", exportCsv: "Exporteer CSV", generate: "Rapport Genereren",
      cleaningSummary: "Schoonmaaksamenvatting", workerPerformance: "Prestaties Medewerkers", clientSatisfaction: "Klanttevredenheid",
      week: "Week", month: "Maand", quarter: "Kwartaal", year: "Jaar", pdf: "PDF", exporting: "Exporteren...",
      totalShifts: "Totaal Aantal Diensten", totalPhotosApproved: "Totaal Goedgekeurde Foto's", escalations: "Escalaties",
      shiftTrends: "Diensttrends", photoQualityDistribution: "Kwaliteitsverdeling Foto's",
      approved: "Goedgekeurd", pending: "In behandeling", rejected: "Afgewezen",
    },
    notifications: {
      title: "Meldingen", markAllRead: "Alles als gelezen markeren", noNotifications: "Geen nieuwe meldingen", unread: "Ongelezen",
      notificationCenter: "Meldingscentrum", newNotifications: "nieuw", marking: "Markeren...",
    },
    settings: {
      title: "Instellingen", companyProfile: "Bedrijfsprofiel", notifications: "Meldingenvoorkeuren",
      security: "Beveiliging & Wachtwoorden", language: "Taal", theme: "Thema", saveChanges: "Wijzigingen Opslaan",
      changePassword: "Wachtwoord Wijzigen", legal: "Juridisch", companyName: "Bedrijfsnaam", companyEmail: "Bedrijfse-mail",
      phoneNumber: "Telefoonnummer", address: "Adres", website: "Website", currentPassword: "Huidig Wachtwoord",
      newPassword: "Nieuw Wachtwoord", confirmPassword: "Bevestig Nieuw Wachtwoord", updatePassword: "Wachtwoord Bijwerken",
      updating: "Bijwerken...", saving: "Opslaan...", privacyPolicy: "Privacybeleid",
      privacyPolicySubtitle: "Hoe wij uw gegevens verzamelen en beschermen", termsAndConditions: "Algemene Voorwaarden",
      termsAndConditionsSubtitle: "Regels en richtlijnen voor platformgebruik",
    },
    roster: {
      title: "Dienstroster", addShift: "+ Dienst Maken", searchPlaceholder: "Zoek in rooster...",
      worker: "Medewerker", location: "Locatie", room: "Kamer", startTime: "Starttijd", endTime: "Eindtijd",
      date: "Datum", createShift: "Dienst Maken", weekView: "Weekweergave", dayView: "Dagweergave", noShifts: "Geen diensten gepland",
    },
    managerAccess: {
      title: "Manager Toegangsbeheer", addManager: "+ Manager Toevoegen", name: "Naam", email: "E-mail",
      role: "Rol", permissions: "Machtigingen", activeManagers: "Actieve Managers", noManagers: "Geen managers gevonden",
    },
    chat: {
      title: "Live Operations Chat", typeMessage: "Typ een bericht...", send: "Versturen", noMessages: "Nog geen berichten", activeChats: "Actieve Gesprekken",
    },
  },
  pl: {
    nav: {
      dashboard: "Pulpit", roster: "Grafik", shiftMonitoring: "Monitorowanie Zmian", workers: "Pracownicy",
      clients: "Klienci", chat: "Czat", locations: "Lokalizacje", rooms: "Pokoje", cleaningPlans: "Plany Sprzątania",
      extraServices: "Usługi Dodatkowe", qualityControl: "Kontrola Jakości", photoReviews: "Recenzje Zdjęć",
      escalations: "Eskalacje", reports: "Raporty", notifications: "Powiadomienia", settings: "Ustawienia",
      administration: "Administracja", managerAccess: "Dostęp Menedżera", signOut: "Wyloguj się",
    },
    topbar: {
      notifications: "Powiadomienia", viewAll: "Zobacz wszystkie", noNotifications: "Brak powiadomień",
      profile: "Profil", helpCenter: "Centrum Pomocy", liveChat: "Czat na Żywo", emailSupport: "Wsparcie E-mail",
      faq: "Często Zadawane Pytania", getSupport: "Uzyskaj pomoc lub znajdź odpowiedzi",
    },
    common: {
      search: "Szukaj", allClients: "Wszyscy Klienci", allLocations: "Wszystkie Lokalizacje", allRooms: "Wszystkie Pokoje",
      allWorkers: "Wszyscy Pracownicy", active: "Aktywny", inactive: "Nieaktywny", assignWorkers: "Przydziel pracowników",
      bulkImport: "Import Masowy", noDataFound: "Nie znaleziono danych", adjustFilters: "Spróbuj dostosować wyszukiwanie lub filtry.",
      duration: "Czas trwania", photos: "Zdjęcia", tasks: "Zadania", rooms: "pokoje", floors: "Piętra",
      required: "Wymagane", previous: "Poprzedni", next: "Następny", showing: "Wyświetlanie", of: "z",
      total: "Łącznie", cancel: "Anuluj", save: "Zapisz", delete: "Usuń", edit: "Edytuj", status: "Status",
      actions: "Akcje",
    },
    plans: {
      title: "Plany Sprzątania", addPlan: "+ Dodaj Plan Sprzątania", searchPlaceholder: "Szukaj planów sprzątania...",
      noPlansFound: "Nie znaleziono planów sprzątania",
    },
    rooms: {
      title: "Pokoje", addRoom: "+ Dodaj Pokój", searchPlaceholder: "Szukaj pokoi...",
      noRoomsFound: "Nie znaleziono pokoi",
    },
    locations: {
      title: "Lokalizacje", addLocation: "+ Dodaj Lokalizację", searchPlaceholder: "Szukaj lokalizacji...",
      noLocationsFound: "Nie znaleziono lokalizacji",
    },
    workers: {
      title: "Pracownicy", addWorker: "Dodaj Pracownika", searchPlaceholder: "Szukaj pracowników...",
      totalWorkers: "Łącznie Pracowników", employees: "Pracownicy", freelancers: "Freelancerzy",
      pendingApprovals: "Oczekujące Zatwierdzenia",
    },
    clients: {
      title: "Klienci", addClient: "+ Dodaj Klienta", searchPlaceholder: "Szukaj klientów...",
      noClientsFound: "Nie znaleziono klientów",
    },
    dashboard: {
      overview: "Przegląd operacyjny", totalClients: "Łącznie Klienci", totalLocations: "Łącznie Lokalizacje",
      totalRooms: "Łącznie Pokoje", activeWorkers: "Aktywni Pracownicy", inProgressShifts: "Zmiany w trakcie",
      workerAttendance: "Podsumowanie Obecności Pracowników",
      createOrAdd: "Utwórz lub dodaj", createShift: "Utwórz zmianę", addClientOrLocation: "Dodaj klienta lub lokalizację",
      bulkImportData: "Importuj dane masowo", peopleNeedAttention: "osób wymaga uwagi", allOnTime: "Wszyscy na czas",
      noWorkersRequireAttention: "Żaden pracownik nie wymaga natychmiastowej uwagi ani zastępstwa.",
      allShiftsOnSchedule: "✓ Wszystkie zmiany zgodnie z harmonogramem", fallingBehindSchedule: "Opóźnienia w harmonogramie",
      alerts: "alerty", allActiveShiftsProgressing: "Wszystkie aktywne zmiany przebiegają obecnie zgodnie z planem.",
      shiftNearlyOver: "Zmiana dobiega końca, a przypisane obiekty mogą nie zostać ukończone na czas.",
      activeShifts: "Aktywne zmiany", workersOnSite: "Pracownicy na miejscu", lateNoShow: "Spóźnienie / brak obecności",
      reviewsPending: "Recenzje oczekujące", liveOperationsByClient: "Operacje na żywo według klienta",
      locationsFirst: "Najpierw lokalizacje, potem pracujący tam ludzie", all: "Wszystkie", onTime: "Na czas",
      late: "Spóźniony", noShow: "Nieobecny", openEscalations: "otwarte eskalacje",
      allEscalationsResolved: "Wszystkie eskalacje rozwiązane", attendanceAlert: "Alert Obecności",
      callEmployee: "Zadzwoń do pracownika",
      goodMorning: "Dzień dobry", goodAfternoon: "Dzień dobry", goodEvening: "Dobry wieczór",
    },
    shiftMonitoring: {
      title: "Zmiany na żywo według lokalizacji", shiftsCount: "zmiany", onTimeCount: "na czas", lateCount: "spóźnienia",
      missingCount: "brakujące", searchPlaceholder: "Szukaj pracownika lub lokalizacji...", allStatuses: "Wszystkie statusy",
      onTime: "Na Czas", late: "Spóźniony", missing: "Brakujący", noLiveShifts: "Brak zmian na żywo",
      employeeDetails: "Szczegóły Pracownika", hoursWorked: "Przepracowane godziny", totalShifts: "Łącznie zmian",
      lateDays: "Dni spóźnień", avgDuration: "Śr. czas trwania", freelancer: "Freelancer", employee: "Pracownik",
    },
    extraServices: {
      title: "Usługi Dodatkowe", searchPlaceholder: "Szukaj usług dodatkowych...", allStatuses: "Wszystkie statusy",
      underReview: "W trakcie weryfikacji", approved: "Zatwierdzono", inProgress: "W trakcie realizacji", completed: "Ukończono",
      rejected: "Odrzucono", noRequests: "Nie znaleziono zamówień usług dodatkowych", requestId: "ID Zamówienia",
      description: "Opis", client: "Klient", location: "Lokalizacja", room: "Pokój", preferredDate: "Preferowana data",
      priority: "Priorytet", status: "Status", assignedWorkers: "Przypisani Pracownicy", assignWorker: "Przypisz Pracownika",
      reject: "Odrzuć", complete: "Oznacz jako Ukończone", rejectionReason: "Powód odrzucenia",
    },
    photoReviews: {
      title: "Recenzje Zdjęć", searchPlaceholder: "Szukaj po ID, sprzątaczu, lokalizacji, pokoju...", allStatuses: "Wszystkie statusy",
      pending: "Oczekujące", approved: "Zatwierdzone", rejected: "Odrzucone", noReviews: "Nie znaleziono recenzji.",
      reviewDetails: "Szczegóły Recenzji", score: "Ocena", feedback: "Opinia", approve: "Zatwierdź", reject: "Odrzuć",
      reviewId: "ID Recenzji", aiConfidence: "Pewność AI", actions: "Akcje",
    },
    escalations: {
      title: "Eskalacje", searchPlaceholder: "Szukaj eskalacji...", allStatuses: "Wszystkie statusy",
      open: "Otwarte", resolved: "Rozwiązane", closed: "Zamknięte", noEscalations: "Nie znaleziono eskalacji",
      priority: "Priorytet", resolve: "Rozwiąż Eskalację",
    },
    reports: {
      title: "Raporty i Analityka", exportPdf: "Eksportuj PDF", exportCsv: "Eksportuj CSV", generate: "Generuj Raport",
      cleaningSummary: "Podsumowanie Sprzątania", workerPerformance: "Wydajność Pracowników", clientSatisfaction: "Zadowolenie Klientów",
      week: "Tydzień", month: "Miesiąc", quarter: "Kwartał", year: "Rok", pdf: "PDF", exporting: "Eksportowanie...",
      totalShifts: "Łącznie Zmian", totalPhotosApproved: "Łącznie Zatwierdzonych Zdjęć", escalations: "Eskalacje",
      shiftTrends: "Trendy Zmian", photoQualityDistribution: "Rozkład Jakości Zdjęć",
      approved: "Zatwierdzone", pending: "Oczekujące", rejected: "Odrzucone",
    },
    notifications: {
      title: "Powiadomienia", markAllRead: "Oznacz wszystkie jako przeczytane", noNotifications: "Brak nowych powiadomień", unread: "Nieprzeczytane",
      notificationCenter: "Centrum Powiadomień", newNotifications: "nowe", marking: "Oznaczanie...",
    },
    settings: {
      title: "Ustawienia", companyProfile: "Profil Firmy", notifications: "Preferencje Powiadomień",
      security: "Bezpieczeństwo i Hasła", language: "Język", theme: "Motyw", saveChanges: "Zapisz Zmiany",
      changePassword: "Zmień Hasło", legal: "Prawne", companyName: "Nazwa Firmy", companyEmail: "E-mail Firmowy",
      phoneNumber: "Numer Telefonu", address: "Adres", website: "Strona WWW", currentPassword: "Obecne Hasło",
      newPassword: "Nowe Hasło", confirmPassword: "Potwierdź Nowe Hasło", updatePassword: "Aktualizuj Hasło",
      updating: "Aktualizowanie...", saving: "Zapisywanie...", privacyPolicy: "Polityka Prywatności",
      privacyPolicySubtitle: "Jak zbieramy i chronimy Twoje dane", termsAndConditions: "Regulamin",
      termsAndConditionsSubtitle: "Zasady i wytyczne korzystania z platformy",
    },
    roster: {
      title: "Grafik Zmian", addShift: "+ Utwórz Zmianę", searchPlaceholder: "Szukaj w grafiku...",
      worker: "Pracownik", location: "Lokalizacja", room: "Pokój", startTime: "Czas Rozpoczęcia", endTime: "Czas Zakończenia",
      date: "Data", createShift: "Utwórz Zmianę", weekView: "Widok Tygodnia", dayView: "Widok Dnia", noShifts: "Brak zaplanowanych zmian",
    },
    managerAccess: {
      title: "Kontrola Dostępów Menedżerów", addManager: "+ Dodaj Menedżera", name: "Imię i nazwisko", email: "E-mail",
      role: "Rola", permissions: "Uprawnienia", activeManagers: "Aktywni Menedżerowie", noManagers: "Nie znaleziono menedżerów",
    },
    chat: {
      title: "Czat Operacji na Żywo", typeMessage: "Wpisz wiadomość...", send: "Wyślij", noMessages: "Brak wiadomości", activeChats: "Aktywne Rozmowy",
    },
  },
  uk: {
    nav: {
      dashboard: "Панель управління", roster: "Графік", shiftMonitoring: "Моніторинг Змін", workers: "Працівники",
      clients: "Клієнти", chat: "Чат", locations: "Локації", rooms: "Кімнати", cleaningPlans: "Плани Прибирання",
      extraServices: "Додаткові Послуги", qualityControl: "Контроль Якості", photoReviews: "Фотозвіти",
      escalations: "Ескалації", reports: "Звіти", notifications: "Сповіщення", settings: "Налаштування",
      administration: "Адміністрування", managerAccess: "Доступ Менеджера", signOut: "Вийти",
    },
    topbar: {
      notifications: "Сповіщення", viewAll: "Переглянути все", noNotifications: "Немає сповіщень",
      profile: "Профіль", helpCenter: "Центр Допомоги", liveChat: "Онлайн Чат", emailSupport: "Підтримка по Email",
      faq: "Часті Запитання", getSupport: "Отримати підтримку або знайти відповіді",
    },
    common: {
      search: "Пошук", allClients: "Усі Клієнти", allLocations: "Усі Локації", allRooms: "Усі Кімнати",
      allWorkers: "Усі Працівники", active: "Активний", inactive: "Неактивний", assignWorkers: "Призначити працівників",
      bulkImport: "Масовий Імпорт", noDataFound: "Даних не знайдено", adjustFilters: "Спробуйте змінити пошуковий запит або фільтри.",
      duration: "Тривалість", photos: "Фотографії", tasks: "Завдання", rooms: "кімнати", floors: "Поверхи",
      required: "Обов'язково", previous: "Назад", next: "Далі", showing: "Показано", of: "з",
      total: "Всього", cancel: "Скасувати", save: "Зберегти", delete: "Видалити", edit: "Редагувати", status: "Статус",
      actions: "Дії",
    },
    plans: {
      title: "Плани Прибирання", addPlan: "+ Додати План Прибирання", searchPlaceholder: "Пошук планів прибирання...",
      noPlansFound: "Планів прибирання не знайдено",
    },
    rooms: {
      title: "Кімнати", addRoom: "+ Додати Кімнату", searchPlaceholder: "Пошук кімнат...",
      noRoomsFound: "Кімнат не знайдено",
    },
    locations: {
      title: "Локації", addLocation: "+ Додати Локацію", searchPlaceholder: "Пошук локацій...",
      noLocationsFound: "Локацій не знайдено",
    },
    workers: {
      title: "Працівники", addWorker: "Додати Працівника", searchPlaceholder: "Пошук працівників...",
      totalWorkers: "Всього Працівників", employees: "Штатні Працівники", freelancers: "Фрілансери",
      pendingApprovals: "Очікують Затвердження",
    },
    clients: {
      title: "Клієнти", addClient: "+ Додати Клієнта", searchPlaceholder: "Пошук клієнтів...",
      noClientsFound: "Клієнтів не знайдено",
    },
    dashboard: {
      overview: "Оперативний огляд", totalClients: "Всього Клієнтів", totalLocations: "Всього Локацій",
      totalRooms: "Всього Кімнат", activeWorkers: "Активні Працівники", inProgressShifts: "Зміни в процесі",
      workerAttendance: "Зведення Відвідуваності Працівників",
      createOrAdd: "Створити або додати", createShift: "Створити зміну", addClientOrLocation: "Додати клієнта або локацію",
      bulkImportData: "Масовий імпорт даних", peopleNeedAttention: "осіб потребують уваги", allOnTime: "Усі вчасно",
      noWorkersRequireAttention: "Жоден працівник не потребує негайної уваги або заміни.",
      allShiftsOnSchedule: "✓ Усі зміни за розкладом", fallingBehindSchedule: "Відстають від розкладу",
      alerts: "сповіщень", allActiveShiftsProgressing: "Усі активні зміни зараз виконуються за розкладом.",
      shiftNearlyOver: "Зміна майже завершилася, і призначені об'єкти можуть не встигнути завершити вчасно.",
      activeShifts: "Активні зміни", workersOnSite: "Працівники на об'єкті", lateNoShow: "Запізнення / Нез'явлення",
      reviewsPending: "Перевірок очікується", liveOperationsByClient: "Операції в режимі реального часу за клієнтами",
      locationsFirst: "Спочатку локації, потім працівники", all: "Усі", onTime: "Вчасно",
      late: "Запізнення", noShow: "Нез'явлення", openEscalations: "відкритих ескалацій",
      allEscalationsResolved: "Усі ескалації вирішено", attendanceAlert: "Сповіщення про Відвідуваність",
      callEmployee: "Зателефонувати працівнику",
      goodMorning: "Доброго ранку", goodAfternoon: "Доброго дня", goodEvening: "Доброго вечора",
    },
    shiftMonitoring: {
      title: "Зміни онлайн за локаціями", shiftsCount: "змін", onTimeCount: "вчасно", lateCount: "з запізненням",
      missingCount: "відсутні", searchPlaceholder: "Пошук працівника або локації...", allStatuses: "Усі статуси",
      onTime: "Вчасно", late: "Запізнення", missing: "Відсутній", noLiveShifts: "Немає активних змін онлайн",
      employeeDetails: "Деталі Працівника", hoursWorked: "Відпрацьовано годин", totalShifts: "Всього змін",
      lateDays: "Днів запізнень", avgDuration: "Сер. тривалість", freelancer: "Фрілансер", employee: "Штатний працівник",
    },
    extraServices: {
      title: "Додаткові Послуги", searchPlaceholder: "Пошук додаткових послуг...", allStatuses: "Усі статуси",
      underReview: "На розгляді", approved: "Схвалено", inProgress: "В процесі", completed: "Завершено",
      rejected: "Відхилено", noRequests: "Запитів на додаткові послуги не знайдено", requestId: "ID Запиту",
      description: "Опис", client: "Клієнт", location: "Локація", room: "Кімната", preferredDate: "Бажана дата",
      priority: "Пріоритет", status: "Статус", assignedWorkers: "Призначені Працівники", assignWorker: "Призначити Працівника",
      reject: "Відхилити", complete: "Позначити як Завершене", rejectionReason: "Причина відхилення",
    },
    photoReviews: {
      title: "Фотозвіти", searchPlaceholder: "Пошук за ID, прибиральником, локацією, кімнатою...", allStatuses: "Усі статуси",
      pending: "Очікує", approved: "Схвалено", rejected: "Відхилено", noReviews: "Відгуків не знайдено.",
      reviewDetails: "Деталі Перевірки", score: "Оцінка", feedback: "Відгук", approve: "Схвалити", reject: "Відхилити",
      reviewId: "ID Відгуку", aiConfidence: "Впевненість ШІ", actions: "Дії",
    },
    escalations: {
      title: "Ескалації", searchPlaceholder: "Пошук ескалацій...", allStatuses: "Усі статуси",
      open: "Відкриті", resolved: "Вирішені", closed: "Закриті", noEscalations: "Ескалацій не знайдено",
      priority: "Пріоритет", resolve: "Вирішити Ескалацію",
    },
    reports: {
      title: "Звіти та Аналітика", exportPdf: "Експорт PDF", exportCsv: "Експорт CSV", generate: "Згенерувати Звіт",
      cleaningSummary: "Зведення Прибирання", workerPerformance: "Продуктивність Працівників", clientSatisfaction: "Задоволеність Клієнтів",
      week: "Тиждень", month: "Місяць", quarter: "Квартал", year: "Рік", pdf: "PDF", exporting: "Експорт...",
      totalShifts: "Всього Змін", totalPhotosApproved: "Всього Схвалених Фото", escalations: "Ескалації",
      shiftTrends: "Тренди Змін", photoQualityDistribution: "Розподіл Якості Фото",
      approved: "Схвалено", pending: "В очікуванні", rejected: "Відхилено",
    },
    notifications: {
      title: "Сповіщення", markAllRead: "Позначити всі як прочитані", noNotifications: "Немає нових сповіщень", unread: "Непрочитані",
      notificationCenter: "Центр Сповіщень", newNotifications: "нові", marking: "Позначення...",
    },
    settings: {
      title: "Налаштування", companyProfile: "Профіль Компанії", notifications: "Налаштування Сповіщень",
      security: "Безпека та Паролі", language: "Мова", theme: "Тема", saveChanges: "Зберегти Зміни",
      changePassword: "Змінити Пароль", legal: "Юридична інформація", companyName: "Назва Компанії", companyEmail: "Email Компанії",
      phoneNumber: "Номер Телефону", address: "Адреса", website: "Веб-сайт", currentPassword: "Поточний Пароль",
      newPassword: "Новий Пароль", confirmPassword: "Підтвердіть Новий Пароль", updatePassword: "Оновити Пароль",
      updating: "Оновлення...", saving: "Збереження...", privacyPolicy: "Політика Конфіденційності",
      privacyPolicySubtitle: "Як ми збираємо та захищаємо ваші дані", termsAndConditions: "Умови Використання",
      termsAndConditionsSubtitle: "Правила та інструкції використання платформи",
    },
    roster: {
      title: "Графік Змін", addShift: "+ Створити Зміну", searchPlaceholder: "Пошук у графіку...",
      worker: "Працівник", location: "Локація", room: "Кімната", startTime: "Час Початку", endTime: "Час Завершення",
      date: "Дата", createShift: "Створити Зміну", weekView: "Тижневий Вигляд", dayView: "Денний Вигляд", noShifts: "Запланованих змін немає",
    },
    managerAccess: {
      title: "Контроль Доступу Менеджерів", addManager: "+ Додати Менеджера", name: "Ім'я", email: "Email",
      role: "Роль", permissions: "Права доступу", activeManagers: "Активні Менеджери", noManagers: "Менеджерів не знайдено",
    },
    chat: {
      title: "Онлайн Чат Операцій", typeMessage: "Введіть повідомлення...", send: "Надіслати", noMessages: "Повідомлень ще немає", activeChats: "Активні Діалоги",
    },
  },
  pt: {
    nav: {
      dashboard: "Painel", roster: "Escala", shiftMonitoring: "Monitorização de Turnos", workers: "Trabalhadores",
      clients: "Clientes", chat: "Chat", locations: "Localizações", rooms: "Divisões", cleaningPlans: "Planos de Limpeza",
      extraServices: "Serviços Extra", qualityControl: "Controlo de Qualidade", photoReviews: "Avaliações de Fotos",
      escalations: "Escalações", reports: "Relatórios", notifications: "Notificações", settings: "Definições",
      administration: "Administração", managerAccess: "Acesso de Gestor", signOut: "Sair",
    },
    topbar: {
      notifications: "Notificações", viewAll: "Ver tudo", noNotifications: "Sem notificações",
      profile: "Perfil", helpCenter: "Centro de Ajuda", liveChat: "Chat ao Vivo", emailSupport: "Suporte por Email",
      faq: "Perguntas Frequentes", getSupport: "Obter suporte ou encontrar respostas",
    },
    common: {
      search: "Pesquisar", allClients: "Todos os Clientes", allLocations: "Todas as Localizações", allRooms: "Todas as Divisões",
      allWorkers: "Todos os Trabalhadores", active: "Ativo", inactive: "Inativo", assignWorkers: "Atribuir trabalhadores",
      bulkImport: "Importação em Massa", noDataFound: "Nenhum dado encontrado", adjustFilters: "Tente ajustar a pesquisa ou filtros.",
      duration: "Duração", photos: "Fotos", tasks: "Tarefas", rooms: "divisões", floors: "Pisos",
      required: "Obrigatório", previous: "Anterior", next: "Seguinte", showing: "A mostrar", of: "de",
      total: "Total", cancel: "Cancelar", save: "Guardar", delete: "Eliminar", edit: "Editar", status: "Estado",
      actions: "Ações",
    },
    plans: {
      title: "Planos de Limpeza", addPlan: "+ Adicionar Plano de Limpeza", searchPlaceholder: "Pesquisar planos...",
      noPlansFound: "Nenhum plano encontrado",
    },
    rooms: {
      title: "Divisões", addRoom: "+ Adicionar Divisão", searchPlaceholder: "Pesquisar divisões...",
      noRoomsFound: "Nenhuma divisão encontrada",
    },
    locations: {
      title: "Localizações", addLocation: "+ Adicionar Localização", searchPlaceholder: "Pesquisar localizações...",
      noLocationsFound: "Nenhuma localização encontrada",
    },
    workers: {
      title: "Trabalhadores", addWorker: "Adicionar Trabalhador", searchPlaceholder: "Pesquisar trabalhadores...",
      totalWorkers: "Total de Trabalhadores", employees: "Funcionários", freelancers: "Freelancers",
      pendingApprovals: "Aprovações Pendentes",
    },
    clients: {
      title: "Clientes", addClient: "+ Adicionar Cliente", searchPlaceholder: "Pesquisar clientes...",
      noClientsFound: "Nenhum cliente encontrado",
    },
    dashboard: {
      overview: "Visão geral das operações", totalClients: "Total de Clientes", totalLocations: "Total de Localizações",
      totalRooms: "Total de Divisões", activeWorkers: "Trabalhadores Ativos", inProgressShifts: "Turnos em Curso",
      workerAttendance: "Resumo de Assiduidade",
      createOrAdd: "Criar ou adicionar", createShift: "Criar um turno", addClientOrLocation: "Adicionar cliente ou localização",
      bulkImportData: "Importar dados em massa", peopleNeedAttention: "pessoas precisam de atenção", allOnTime: "Todos a tempo",
      noWorkersRequireAttention: "Nenhum trabalhador necessita de atenção imediata.",
      allShiftsOnSchedule: "✓ Todos os turnos no horário", fallingBehindSchedule: "Atrasado no horário",
      alerts: "alertas", allActiveShiftsProgressing: "Todos os turnos ativos estão a progredir conforme o previsto.",
      shiftNearlyOver: "O turno está quase a terminar e os objetos podem não ser concluídos a tempo.",
      activeShifts: "Turnos ativos", workersOnSite: "Trabalhadores no local", lateNoShow: "Atrasado / Falta",
      reviewsPending: "Avaliações pendentes", liveOperationsByClient: "Operações ao vivo por cliente",
      locationsFirst: "Primeiro localizações, depois trabalhadores", all: "Todos", onTime: "A tempo",
      late: "Atrasado", noShow: "Falta", openEscalations: "escalações abertas",
      allEscalationsResolved: "Todas as escalações resolvidas", attendanceAlert: "Alerta de Assiduidade",
      callEmployee: "Ligar ao funcionário",
      goodMorning: "Bom dia", goodAfternoon: "Boa tarde", goodEvening: "Boa noite",
    },
    shiftMonitoring: {
      title: "Turnos ao vivo por localização", shiftsCount: "turnos", onTimeCount: "a tempo", lateCount: "atrasados",
      missingCount: "em falta", searchPlaceholder: "Pesquisar trabalhador ou localização...", allStatuses: "Todos os estados",
      onTime: "A Tempo", late: "Atrasado", missing: "Em Falta", noLiveShifts: "Sem turnos ao vivo",
      employeeDetails: "Detalhes do Funcionário", hoursWorked: "Horas trabalhadas", totalShifts: "Total de turnos",
      lateDays: "Dias de atraso", avgDuration: "Duração média", freelancer: "Freelancer", employee: "Funcionário",
    },
    extraServices: {
      title: "Serviços Extra", searchPlaceholder: "Pesquisar serviços extra...", allStatuses: "Todos os estados",
      underReview: "Em Análise", approved: "Aprovado", inProgress: "Em Curso", completed: "Concluído",
      rejected: "Rejeitado", noRequests: "Nenhum pedido de serviço extra encontrado", requestId: "ID do Pedido",
      description: "Descrição", client: "Cliente", location: "Localização", room: "Divisão", preferredDate: "Data Preferencial",
      priority: "Prioridade", status: "Estado", assignedWorkers: "Trabalhadores Atribuídos", assignWorker: "Atribuir Trabalhador",
      reject: "Rejeitar", complete: "Marcar como Concluído", rejectionReason: "Motivo da Rejeição",
    },
    photoReviews: {
      title: "Avaliações de Fotos", searchPlaceholder: "Pesquisar por ID, profissional, local, divisão...", allStatuses: "Todos os estados",
      pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado", noReviews: "Nenhuma avaliação encontrada.",
      reviewDetails: "Detalhes da Avaliação", score: "Pontuação", feedback: "Comentário", approve: "Aprovar", reject: "Rejeitar",
      reviewId: "ID da Avaliação", aiConfidence: "Confiança da IA", actions: "Ações",
    },
    escalations: {
      title: "Escalações", searchPlaceholder: "Pesquisar escalações...", allStatuses: "Todos os estados",
      open: "Aberto", resolved: "Resolvido", closed: "Fechado", noEscalations: "Nenhuma escalação encontrada",
      priority: "Prioridade", resolve: "Resolver Escalação",
    },
    reports: {
      title: "Relatórios e Análises", exportPdf: "Exportar PDF", exportCsv: "Exportar CSV", generate: "Gerar Relatório",
      cleaningSummary: "Resumo de Limpeza", workerPerformance: "Desempenho dos Trabalhadores", clientSatisfaction: "Satisfação do Cliente",
      week: "Semana", month: "Mês", quarter: "Trimestre", year: "Ano", pdf: "PDF", exporting: "A exportar...",
      totalShifts: "Total de Turnos", totalPhotosApproved: "Total de Fotos Aprovadas", escalations: "Escalações",
      shiftTrends: "Tendências de Turnos", photoQualityDistribution: "Distribuição de Qualidade das Fotos",
      approved: "Aprovado", pending: "Pendente", rejected: "Rejeitado",
    },
    notifications: {
      title: "Notificações", markAllRead: "Marcar todas como lidas", noNotifications: "Sem novas notificações", unread: "Não lidas",
      notificationCenter: "Centro de Notificações", newNotifications: "novas", marking: "A marcar...",
    },
    settings: {
      title: "Definições", companyProfile: "Perfil da Empresa", notifications: "Preferências de Notificação",
      security: "Segurança e Palavras-passe", language: "Idioma", theme: "Tema", saveChanges: "Guardar Alterações",
      changePassword: "Alterar Palavra-passe", legal: "Legal", companyName: "Nome da Empresa", companyEmail: "Email da Empresa",
      phoneNumber: "Número de Telefone", address: "Endereço", website: "Website", currentPassword: "Palavra-passe Atual",
      newPassword: "Nova Palavra-passe", confirmPassword: "Confirmar Nova Palavra-passe", updatePassword: "Atualizar Palavra-passe",
      updating: "A atualizar...", saving: "A guardar...", privacyPolicy: "Política de Privacidade",
      privacyPolicySubtitle: "Como recolhemos e protegemos os seus dados", termsAndConditions: "Termos e Condições",
      termsAndConditionsSubtitle: "Regras e orientações para utilização da plataforma",
    },
    roster: {
      title: "Escala de Turnos", addShift: "+ Criar Turno", searchPlaceholder: "Pesquisar na escala...",
      worker: "Trabalhador", location: "Localização", room: "Divisão", startTime: "Hora de Início", endTime: "Hora de Fim",
      date: "Data", createShift: "Criar Turno", weekView: "Vista de Semana", dayView: "Vista de Dia", noShifts: "Nenhum turno agendado",
    },
    managerAccess: {
      title: "Controlo de Acesso de Gestores", addManager: "+ Adicionar Gestor", name: "Nome", email: "Email",
      role: "Função", permissions: "Permissões", activeManagers: "Gestores Ativos", noManagers: "Nenhum gestor encontrado",
    },
    chat: {
      title: "Chat de Operações ao Vivo", typeMessage: "Escreva uma mensagem...", send: "Enviar", noMessages: "Ainda sem mensagens", activeChats: "Conversas Ativas",
    },
  },
  ar: {
    nav: {
      dashboard: "لوحة التحكم", roster: "جدول العمل", shiftMonitoring: "مراقبة الورديات", workers: "العمال",
      clients: "العملاء", chat: "المحادثة", locations: "المواقع", rooms: "الغرف", cleaningPlans: "خطط التنظيف",
      extraServices: "خدمات إضافية", qualityControl: "مراقبة الجودة", photoReviews: "مراجعات الصور",
      escalations: "التصعيدات", reports: "التقارير", notifications: "الإشعارات", settings: "الإعدادات",
      administration: "الإدارة", managerAccess: "صلاحيات المدراء", signOut: "تسجيل الخروج",
    },
    topbar: {
      notifications: "الإشعارات", viewAll: "عرض الكل", noNotifications: "لا توجد إشعارات",
      profile: "الملف الشخصي", helpCenter: "مركز المساعدة", liveChat: "محادثة مباشرة", emailSupport: "الدعم عبر البريد",
      faq: "الأسئلة الشائعة", getSupport: "الحصول على الدعم أو الإجابات",
    },
    common: {
      search: "بحث", allClients: "جميع العملاء", allLocations: "جميع المواقع", allRooms: "جميع الغرف",
      allWorkers: "جميع العمال", active: "نشط", inactive: "غير نشط", assignWorkers: "تعيين عمال",
      bulkImport: "استيراد جماعي", noDataFound: "لم يتم العثور على بيانات", adjustFilters: "جرب تعديل البحث أو الفلاتر.",
      duration: "المدة", photos: "الصور", tasks: "المهام", rooms: "غرف", floors: "الطوابق",
      required: "مطلوب", previous: "السابق", next: "التالي", showing: "عرض", of: "من",
      total: "الإجمالي", cancel: "إلغاء", save: "حفظ", delete: "حذف", edit: "تعديل", status: "الحالة",
      actions: "الإجراءات",
    },
    plans: {
      title: "خطط التنظيف", addPlan: "+ إضافة خطة تنظيف", searchPlaceholder: "البحث في خطط التنظيف...",
      noPlansFound: "لم يتم العثور على خطط تنظيف",
    },
    rooms: {
      title: "الغرف", addRoom: "+ إضافة غرفة", searchPlaceholder: "البحث في الغرف...",
      noRoomsFound: "لم يتم العثور على غرف",
    },
    locations: {
      title: "المواقع", addLocation: "+ إضافة موقع", searchPlaceholder: "البحث في المواقع...",
      noLocationsFound: "لم يتم العثور على مواقع",
    },
    workers: {
      title: "العمال", addWorker: "إضافة عامل", searchPlaceholder: "البحث في العمال...",
      totalWorkers: "إجمالي العمال", employees: "الموظفون", freelancers: "العمال المستقلون",
      pendingApprovals: "في انتظار الموافقة",
    },
    clients: {
      title: "العملاء", addClient: "+ إضافة عميل", searchPlaceholder: "البحث في العملاء...",
      noClientsFound: "لم يتم العثور على عملاء",
    },
    dashboard: {
      overview: "نظرة عامة على العمليات", totalClients: "إجمالي العملاء", totalLocations: "إجمالي المواقع",
      totalRooms: "إجمالي الغرف", activeWorkers: "العمال النشطون", inProgressShifts: "الورديات الجارية",
      workerAttendance: "ملخص حضور العمال",
      createOrAdd: "إنشاء أو إضافة", createShift: "إنشاء وردية", addClientOrLocation: "إضافة عميل أو موقع",
      bulkImportData: "استيراد البيانات", peopleNeedAttention: "أشخاص يحتاجون للمتابعة", allOnTime: "الجميع في الوقت المحدد",
      noWorkersRequireAttention: "لا يوجد عمال يحتاجون إلى متابعة فورية.",
      allShiftsOnSchedule: "✓ جميع الورديات في موعدها", fallingBehindSchedule: "تأخر عن الجدول الزمني",
      alerts: "تنبيهات", allActiveShiftsProgressing: "جميع الورديات تسير حالياً وفق الجدول.",
      shiftNearlyOver: "الوردية أوشكت على الانتهاء وقد لا تكتمل المهام في الوقت المحدد.",
      activeShifts: "الورديات النشطة", workersOnSite: "العمال في الموقع", lateNoShow: "متأخر / غائب",
      reviewsPending: "المراجعات المعلقة", liveOperationsByClient: "العمليات المباشرة حسب العميل",
      locationsFirst: "المواقع أولاً، ثم العاملون هناك", all: "الكل", onTime: "في الوقت",
      late: "متأخر", noShow: "غائب", openEscalations: "تصعيدات مفتوحة",
      allEscalationsResolved: "تم حل جميع التصعيدات", attendanceAlert: "تنبيه الحضور",
      callEmployee: "الاتصال بالموظف",
      goodMorning: "صباح الخير", goodAfternoon: "مساء الخير", goodEvening: "مساء الخير",
    },
    shiftMonitoring: {
      title: "الورديات المباشرة حسب الموقع", shiftsCount: "ورديات", onTimeCount: "في الوقت", lateCount: "متأخر",
      missingCount: "مفقود", searchPlaceholder: "البحث عن عامل أو موقع...", allStatuses: "جميع الحالات",
      onTime: "في الوقت", late: "متأخر", missing: "مفقود", noLiveShifts: "لا توجد ورديات مباشرة",
      employeeDetails: "تفاصيل الموظف", hoursWorked: "ساعات العمل", totalShifts: "إجمالي الورديات",
      lateDays: "أيام التأخير", avgDuration: "متوسط المدة", freelancer: "مستقل", employee: "موظف",
    },
    extraServices: {
      title: "خدمات إضافية", searchPlaceholder: "البحث في الخدمات الإضافية...", allStatuses: "جميع الحالات",
      underReview: "قيد المراجعة", approved: "مقبول", inProgress: "قيد التنفيذ", completed: "مكتمل",
      rejected: "مرفوض", noRequests: "لم يتم العثور على طلبات خدمات إضافية", requestId: "رقم الطلب",
      description: "الوصف", client: "العميل", location: "الموقع", room: "الغرفة", preferredDate: "التاريخ المفضل",
      priority: "الأولوية", status: "الحالة", assignedWorkers: "العمال المعينون", assignWorker: "تعيين عامل",
      reject: "رفض", complete: "تحديد كمكتمل", rejectionReason: "سبب الرفض",
    },
    photoReviews: {
      title: "مراجعات الصور", searchPlaceholder: "البحث حسب المعرف، العامل، الموقع، الغرفة...", allStatuses: "جميع الحالات",
      pending: "معلق", approved: "مقبول", rejected: "مرفوض", noReviews: "لم يتم العثور على مراجعات.",
      reviewDetails: "تفاصيل المراجعة", score: "النتيجة", feedback: "الملاحظات", approve: "موافقة", reject: "رفض",
      reviewId: "معرف المراجعة", aiConfidence: "ثقة الذكاء الاصطناعي", actions: "الإجراءات",
    },
    escalations: {
      title: "التصعيدات", searchPlaceholder: "البحث في التصعيدات...", allStatuses: "جميع الحالات",
      open: "مفتوح", resolved: "تم الحح", closed: "مغلق", noEscalations: "لم يتم العثور على تصعيدات",
      priority: "الأولوية", resolve: "حل التصعيد",
    },
    reports: {
      title: "التقارير والتحليلات", exportPdf: "تصدير PDF", exportCsv: "تصدير CSV", generate: "إنشاء تقرير",
      cleaningSummary: "ملخص التنظيف", workerPerformance: "أداء العمال", clientSatisfaction: "رضا العملاء",
      week: "أسبوع", month: "شهر", quarter: "ربع سنة", year: "سنة", pdf: "PDF", exporting: "جاري التصدير...",
      totalShifts: "إجمالي الورديات", totalPhotosApproved: "إجمالي الصور المقبولة", escalations: "التصعيدات",
      shiftTrends: "اتجاهات الورديات", photoQualityDistribution: "توزيع جودة الصور",
      approved: "مقبول", pending: "قيد الانتظار", rejected: "مرفوض",
    },
    notifications: {
      title: "الإشعارات", markAllRead: "تحديد الكل كمقروء", noNotifications: "لا توجد إشعارات جديدة", unread: "غير مقروء",
      notificationCenter: "مركز الإشعارات", newNotifications: "جديد", marking: "جاري التحديث...",
    },
    settings: {
      title: "الإعدادات", companyProfile: "ملف الشركة", notifications: "تفضيلات الإشعارات",
      security: "الأمان وكلمات المرور", language: "اللغة", theme: "المظهر", saveChanges: "حفظ التغييرات",
      changePassword: "تغيير كلمة المرور", legal: "قانوني", companyName: "اسم الشركة", companyEmail: "البريد الإلكتروني للشركة",
      phoneNumber: "رقم الهاتف", address: "العنوان", website: "الموقع الإلكتروني", currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة", confirmPassword: "تأكيد كلمة المرور الجديدة", updatePassword: "تحديث كلمة المرور",
      updating: "جاري التحديث...", saving: "جاري الحفظ...", privacyPolicy: "سياسة الخصوصية",
      privacyPolicySubtitle: "كيف نجمع بياناتك ونحميها", termsAndConditions: "الشروط والأحكام",
      termsAndConditionsSubtitle: "القواعد والإرشادات لاستخدام المنصة",
    },
    roster: {
      title: "جدول الورديات", addShift: "+ إنشاء وردية", searchPlaceholder: "البحث في جدول الورديات...",
      worker: "العامل", location: "الموقع", room: "الغرفة", startTime: "وقت البدء", endTime: "وقت الانتهاء",
      date: "التاريخ", createShift: "إنشاء وردية", weekView: "عرض الأسبوع", dayView: "عرض اليوم", noShifts: "لا توجد ورديات مجدولة",
    },
    managerAccess: {
      title: "صلاحيات المدراء", addManager: "+ إضافة مدير", name: "الاسم", email: "البريد الإلكتروني",
      role: "الدور", permissions: "الصلاحيات", activeManagers: "المدراء النشطون", noManagers: "لم يتم العثور على مدراء",
    },
    chat: {
      title: "محادثة العمليات المباشرة", typeMessage: "اكتب رسالة...", send: "إرسال", noMessages: "لا توجد رسائل بعد", activeChats: "المحادثات النشطة",
    },
  },
  fr: {
    nav: {
      dashboard: "Tableau de Bord", roster: "Planning", shiftMonitoring: "Suivi des Shifts", workers: "Employés",
      clients: "Clients", chat: "Chat", locations: "Emplacements", rooms: "Pièces", cleaningPlans: "Plans de Nettoyage",
      extraServices: "Services Extras", qualityControl: "Contrôle Qualité", photoReviews: "Revues Photos",
      escalations: "Escalades", reports: "Rapports", notifications: "Notifications", settings: "Paramètres",
      administration: "Administration", managerAccess: "Accès Managers", signOut: "Se Déconnecter",
    },
    topbar: {
      notifications: "Notifications", viewAll: "Tout voir", noNotifications: "Aucune notification",
      profile: "Profil", helpCenter: "Centre d'Aide", liveChat: "Chat en Direct", emailSupport: "Support Email",
      faq: "Foire Aux Questions", getSupport: "Obtenir de l'aide ou des réponses",
    },
    common: {
      search: "Rechercher", allClients: "Tous les Clients", allLocations: "Tous les Emplacements", allRooms: "Toutes les Pièces",
      allWorkers: "Tous les Employés", active: "Actif", inactive: "Inactif", assignWorkers: "Attribuer des employés",
      bulkImport: "Import en Masse", noDataFound: "Aucune donnée trouvée", adjustFilters: "Essayez de modifier la recherche ou les filtres.",
      duration: "Durée", photos: "Photos", tasks: "Tâches", rooms: "pièces", floors: "Étages",
      required: "Requis", previous: "Précédent", next: "Suivant", showing: "Affichage de", of: "sur",
      total: "Total", cancel: "Annuler", save: "Enregistrer", delete: "Supprimer", edit: "Modifier", status: "Statut",
      actions: "Actions",
    },
    plans: {
      title: "Plans de Nettoyage", addPlan: "+ Ajouter un Plan", searchPlaceholder: "Rechercher des plans...",
      noPlansFound: "Aucun plan de nettoyage trouvé",
    },
    rooms: {
      title: "Pièces", addRoom: "+ Ajouter une Pièce", searchPlaceholder: "Rechercher des pièces...",
      noRoomsFound: "Aucune pièce trouvée",
    },
    locations: {
      title: "Emplacements", addLocation: "+ Ajouter un Emplacement", searchPlaceholder: "Rechercher des emplacements...",
      noLocationsFound: "Aucun emplacement trouvé",
    },
    workers: {
      title: "Employés", addWorker: "Ajouter un Employé", searchPlaceholder: "Rechercher des employés...",
      totalWorkers: "Total Employés", employees: "Salariés", freelancers: "Indépendants",
      pendingApprovals: "En Attente de Validation",
    },
    clients: {
      title: "Clients", addClient: "+ Ajouter un Client", searchPlaceholder: "Rechercher des clients...",
      noClientsFound: "Aucun client trouvé",
    },
    dashboard: {
      overview: "Aperçu des opérations", totalClients: "Total Clients", totalLocations: "Total Emplacements",
      totalRooms: "Total Pièces", activeWorkers: "Employés Actifs", inProgressShifts: "Shifts en Cours",
      workerAttendance: "Résumé de Présence des Employés",
      createOrAdd: "Créer ou ajouter", createShift: "Créer un shift", addClientOrLocation: "Ajouter client ou emplacement",
      bulkImportData: "Importer des données", peopleNeedAttention: "personnes nécessitent une attention", allOnTime: "Tous à l'heure",
      noWorkersRequireAttention: "Aucun employé ne nécessite d'attention immédiate.",
      allShiftsOnSchedule: "✓ Tous les shifts dans les temps", fallingBehindSchedule: "En retard sur le planning",
      alerts: "alertes", allActiveShiftsProgressing: "Tous les shifts actifs se déroulent actuellement selon le planning.",
      shiftNearlyOver: "Le shift est presque terminé et les locaux risquent de ne pas être prêts à temps.",
      activeShifts: "Shifts actifs", workersOnSite: "Employés sur place", lateNoShow: "En retard / Absent",
      reviewsPending: "Revues en attente", liveOperationsByClient: "Opérations en direct par client",
      locationsFirst: "D'abord les emplacements, puis les employés", all: "Tous", onTime: "À l'heure",
      late: "En retard", noShow: "Absent", openEscalations: "escalades ouvertes",
      allEscalationsResolved: "Toutes les escalades sont résolues", attendanceAlert: "Alerte de Présence",
      callEmployee: "Appeler l'employé",
      goodMorning: "Bonjour", goodAfternoon: "Bon après-midi", goodEvening: "Bonsoir",
    },
    shiftMonitoring: {
      title: "Shifts en direct par emplacement", shiftsCount: "shifts", onTimeCount: "à l'heure", lateCount: "en retard",
      missingCount: "absents", searchPlaceholder: "Rechercher employé ou emplacement...", allStatuses: "Tous les statuts",
      onTime: "À l'Heure", late: "En Retard", missing: "Absent", noLiveShifts: "Aucun shift en direct",
      employeeDetails: "Détails de l'Employé", hoursWorked: "Heures travaillées", totalShifts: "Total shifts",
      lateDays: "Jours de retard", avgDuration: "Durée moyenne", freelancer: "Indépendant", employee: "Salarié",
    },
    extraServices: {
      title: "Services Extras", searchPlaceholder: "Rechercher des services extras...", allStatuses: "Tous les statuts",
      underReview: "En Révision", approved: "Approuvé", inProgress: "En Cours", completed: "Terminé",
      rejected: "Rejeté", noRequests: "Aucune demande de service extra trouvée", requestId: "ID Demande",
      description: "Description", client: "Client", location: "Emplacement", room: "Pièce", preferredDate: "Date Souhaitée",
      priority: "Priorité", status: "Statut", assignedWorkers: "Employés Attribués", assignWorker: "Attribuer un Employé",
      reject: "Rejeter", complete: "Marquer comme Terminé", rejectionReason: "Motif du Rejet",
    },
    photoReviews: {
      title: "Revues Photos", searchPlaceholder: "Rechercher par ID, agent, lieu, pièce...", allStatuses: "Tous les statuts",
      pending: "En Attente", approved: "Approuvé", rejected: "Rejeté", noReviews: "Aucune revue trouvée.",
      reviewDetails: "Détails de la Revue", score: "Score", feedback: "Commentaires", approve: "Approuver", reject: "Rejeter",
      reviewId: "ID de revue", aiConfidence: "Confiance IA", actions: "Actions",
    },
    escalations: {
      title: "Escalades", searchPlaceholder: "Rechercher des escalades...", allStatuses: "Tous les statuts",
      open: "Ouvert", resolved: "Résolu", closed: "Fermé", noEscalations: "Aucune escalade trouvée",
      priority: "Priorité", resolve: "Résoudre l'Escalade",
    },
    reports: {
      title: "Rapports et Analyses", exportPdf: "Exporter PDF", exportCsv: "Exporter CSV", generate: "Générer un Rapport",
      cleaningSummary: "Résumé de Nettoyage", workerPerformance: "Performance des Employés", clientSatisfaction: "Satisfaction Client",
      week: "Semaine", month: "Mois", quarter: "Trimestre", year: "Année", pdf: "PDF", exporting: "Exportation...",
      totalShifts: "Total des Shifts", totalPhotosApproved: "Total des Photos Approuvées", escalations: "Escalades",
      shiftTrends: "Tendances des Shifts", photoQualityDistribution: "Distribution de la Qualité des Photos",
      approved: "Approuvé", pending: "En attente", rejected: "Rejeté",
    },
    notifications: {
      title: "Notifications", markAllRead: "Tout marquer comme lu", noNotifications: "Aucune nouvelle notification", unread: "Non lu",
      notificationCenter: "Centre de Notifications", newNotifications: "nouveau", marking: "Marquage...",
    },
    settings: {
      title: "Paramètres", companyProfile: "Profil de l'Entreprise", notifications: "Préférences de Notifications",
      security: "Sécurité & Mots de Passe", language: "Langue", theme: "Thème", saveChanges: "Enregistrer les Modifications",
      changePassword: "Changer le Mot de Passe", legal: "Mentions Légales", companyName: "Nom de l'Entreprise", companyEmail: "Email de l'Entreprise",
      phoneNumber: "Numéro de Téléphone", address: "Adresse", website: "Site Web", currentPassword: "Mot de Passe Actuel",
      newPassword: "Nouveau Mot de Passe", confirmPassword: "Confirmer le Nouveau Mot de Passe", updatePassword: "Mettre à Jour le Mot de Passe",
      updating: "Mise à jour...", saving: "Enregistrement...", privacyPolicy: "Politique de Confidentialité",
      privacyPolicySubtitle: "Comment nous collectons et protégeons vos données", termsAndConditions: "Conditions Générales",
      termsAndConditionsSubtitle: "Règles et directives pour l'utilisation de la plateforme",
    },
    roster: {
      title: "Planning des Shifts", addShift: "+ Créer un Shift", searchPlaceholder: "Rechercher dans le planning...",
      worker: "Employé", location: "Emplacement", room: "Pièce", startTime: "Heure de Début", endTime: "Heure de Fin",
      date: "Date", createShift: "Créer un Shift", weekView: "Vue Semaine", dayView: "Vue Jour", noShifts: "Aucun shift planifié",
    },
    managerAccess: {
      title: "Contrôle d'Accès Managers", addManager: "+ Ajouter un Manager", name: "Nom", email: "Email",
      role: "Rôle", permissions: "Permissions", activeManagers: "Managers Actifs", noManagers: "Aucun manager trouvé",
    },
    chat: {
      title: "Chat des Opérations en Direct", typeMessage: "Écrivez un message...", send: "Envoyer", noMessages: "Pas encore de messages", activeChats: "Conversations Actives",
    },
  },
  es: {
    nav: {
      dashboard: "Tablero", roster: "Turnos", shiftMonitoring: "Monitoreo de Turnos", workers: "Trabajadores",
      clients: "Clientes", chat: "Chat", locations: "Ubicaciones", rooms: "Habitaciones", cleaningPlans: "Planes de Limpieza",
      extraServices: "Servicios Extras", qualityControl: "Control de Calidad", photoReviews: "Revisiones de Fotos",
      escalations: "Escalaciones", reports: "Reportes", notifications: "Notificaciones", settings: "Ajustes",
      administration: "Administración", managerAccess: "Acceso de Gerentes", signOut: "Cerrar Sesión",
    },
    topbar: {
      notifications: "Notificaciones", viewAll: "Ver todo", noNotifications: "Sin notificaciones",
      profile: "Perfil", helpCenter: "Centro de Ayuda", liveChat: "Chat en Vivo", emailSupport: "Soporte por Email",
      faq: "Preguntas Frecuentes", getSupport: "Obtener soporte o buscar respuestas",
    },
    common: {
      search: "Buscar", allClients: "Todos los Clientes", allLocations: "Todas las Ubicaciones", allRooms: "Todas las Habitaciones",
      allWorkers: "Todos los Trabajadores", active: "Activo", inactive: "Inactivo", assignWorkers: "Asignar trabajadores",
      bulkImport: "Importación Masiva", noDataFound: "No se encontraron datos", adjustFilters: "Intente ajustar la búsqueda o filtros.",
      duration: "Duración", photos: "Fotos", tasks: "Tareas", rooms: "habitaciones", floors: "Pisos",
      required: "Requerido", previous: "Anterior", next: "Siguiente", showing: "Mostrando", of: "de",
      total: "Total", cancel: "Cancelar", save: "Guardar", delete: "Eliminar", edit: "Editar", status: "Estado",
      actions: "Acciones",
    },
    plans: {
      title: "Planes de Limpieza", addPlan: "+ Agregar Plan de Limpieza", searchPlaceholder: "Buscar planes...",
      noPlansFound: "No se encontraron planes de limpieza",
    },
    rooms: {
      title: "Habitaciones", addRoom: "+ Agregar Habitación", searchPlaceholder: "Buscar habitaciones...",
      noRoomsFound: "No se encontraron habitaciones",
    },
    locations: {
      title: "Ubicaciones", addLocation: "+ Agregar Ubicación", searchPlaceholder: "Buscar ubicaciones...",
      noLocationsFound: "No se encontraron ubicaciones",
    },
    workers: {
      title: "Trabajadores", addWorker: "Agregar Trabajador", searchPlaceholder: "Buscar trabajadores...",
      totalWorkers: "Total Trabajadores", employees: "Empleados", freelancers: "Freelancers",
      pendingApprovals: "Aprobaciones Pendientes",
    },
    clients: {
      title: "Clientes", addClient: "+ Agregar Cliente", searchPlaceholder: "Buscar clientes...",
      noClientsFound: "No se encontraron clientes",
    },
    dashboard: {
      overview: "Resumen de operaciones", totalClients: "Total Clientes", totalLocations: "Total Ubicaciones",
      totalRooms: "Total Habitaciones", activeWorkers: "Trabajadores Activos", inProgressShifts: "Turnos en Progreso",
      workerAttendance: "Resumen de Asistencia de Trabajadores",
      createOrAdd: "Crear o agregar", createShift: "Crear un turno", addClientOrLocation: "Agregar cliente u ubicación",
      bulkImportData: "Importar datos en masa", peopleNeedAttention: "personas necesitan atención", allOnTime: "Todos a tiempo",
      noWorkersRequireAttention: "Ningún trabajador requiere atención o reemplazo inmediato.",
      allShiftsOnSchedule: "✓ Todos los turnos a tiempo", fallingBehindSchedule: "Atrasado en el calendario",
      alerts: "alertas", allActiveShiftsProgressing: "Todos los turnos activos avanzan según lo programado.",
      shiftNearlyOver: "El turno casi termina y los objetos asignados pueden no completarse a tiempo.",
      activeShifts: "Turnos activos", workersOnSite: "Trabajadores en el lugar", lateNoShow: "Atrasado / No presentado",
      reviewsPending: "Revisiones pendientes", liveOperationsByClient: "Operaciones en vivo por cliente",
      locationsFirst: "Primero ubicaciones, luego personal", all: "Todos", onTime: "A tiempo",
      late: "Atrasado", noShow: "No presentado", openEscalations: "escalaciones abiertas",
      allEscalationsResolved: "Todas las escalaciones resueltas", attendanceAlert: "Alerta de Asistencia",
      callEmployee: "Llamar al empleado",
      goodMorning: "Buenos días", goodAfternoon: "Buenas tardes", goodEvening: "Buenas noches",
    },
    shiftMonitoring: {
      title: "Turnos en vivo por ubicación", shiftsCount: "turnos", onTimeCount: "a tiempo", lateCount: "atrasados",
      missingCount: "faltantes", searchPlaceholder: "Buscar trabajador o ubicación...", allStatuses: "Todos los estados",
      onTime: "A Tiempo", late: "Atrasado", missing: "Faltante", noLiveShifts: "Sin turnos en vivo",
      employeeDetails: "Detalles del Empleado", hoursWorked: "Horas trabajadas", totalShifts: "Total turnos",
      lateDays: "Días de retraso", avgDuration: "Duración promedio", freelancer: "Freelancer", employee: "Empleado",
    },
    extraServices: {
      title: "Servicios Extras", searchPlaceholder: "Buscar servicios extras...", allStatuses: "Todos los estados",
      underReview: "En Revisión", approved: "Aprobado", inProgress: "En Progreso", completed: "Completado",
      rejected: "Rechazado", noRequests: "No se encontraron solicitudes de servicios extras", requestId: "ID de Solicitud",
      description: "Descripción", client: "Cliente", location: "Ubicación", room: "Habitación", preferredDate: "Fecha Preferida",
      priority: "Prioridad", status: "Estado", assignedWorkers: "Trabajadores Asignados", assignWorker: "Asignar Trabajador",
      reject: "Rechazar", complete: "Marcar como Completado", rejectionReason: "Razon de Rechazo",
    },
    photoReviews: {
      title: "Revisiones de Fotos", searchPlaceholder: "Buscar por ID, limpiador, ubicación, habitación...", allStatuses: "Todos los estados",
      pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado", noReviews: "No se encontraron revisiones.",
      reviewDetails: "Detalles de Revisión", score: "Puntaje", feedback: "Comentario", approve: "Aprobar", reject: "Rechazar",
      reviewId: "ID de Revisión", aiConfidence: "Confianza de IA", actions: "Acciones",
    },
    escalations: {
      title: "Escalaciones", searchPlaceholder: "Buscar escalaciones...", allStatuses: "Todos los estados",
      open: "Abierto", resolved: "Resuelto", closed: "Cerrado", noEscalations: "No se encontraron escalaciones",
      priority: "Prioridad", resolve: "Resolver Escalación",
    },
    reports: {
      title: "Reportes y Analíticas", exportPdf: "Exportar PDF", exportCsv: "Exportar CSV", generate: "Generar Reporte",
      cleaningSummary: "Resumen de Limpieza", workerPerformance: "Rendimiento de Trabajadores", clientSatisfaction: "Satisfacción del Cliente",
      week: "Semana", month: "Mes", quarter: "Trimestre", year: "Año", pdf: "PDF", exporting: "Exportando...",
      totalShifts: "Total de Turnos", totalPhotosApproved: "Total de Fotos Aprobadas", escalations: "Escalaciones",
      shiftTrends: "Tendencias de Turnos", photoQualityDistribution: "Distribución de Calidad de Fotos",
      approved: "Aprobado", pending: "Pendiente", rejected: "Rechazado",
    },
    notifications: {
      title: "Notificaciones", markAllRead: "Marcar todas como leídas", noNotifications: "Sin notificaciones nuevas", unread: "Sin leer",
      notificationCenter: "Centro de Notificaciones", newNotifications: "nuevo", marking: "Marcando...",
    },
    settings: {
      title: "Ajustes", companyProfile: "Perfil de la Empresa", notifications: "Preferencias de Notificación",
      security: "Seguridad y Contraseñas", language: "Idioma", theme: "Tema", saveChanges: "Guardar Cambios",
      changePassword: "Cambiar Contraseña", legal: "Legal", companyName: "Nombre de la Empresa", companyEmail: "Email de la Empresa",
      phoneNumber: "Número de Teléfono", address: "Dirección", website: "Sitio Web", currentPassword: "Contraseña Actual",
      newPassword: "Nueva Contraseña", confirmPassword: "Confirmar Nueva Contraseña", updatePassword: "Actualizar Contraseña",
      updating: "Actualizando...", saving: "Guardando...", privacyPolicy: "Política de Privacidad",
      privacyPolicySubtitle: "Cómo recopilamos y protegemos sus datos", termsAndConditions: "Términos y Condiciones",
      termsAndConditionsSubtitle: "Reglas y pautas para el uso de la plataforma",
    },
    roster: {
      title: "Turnos Programados", addShift: "+ Crear Turno", searchPlaceholder: "Buscar en turnos...",
      worker: "Trabajador", location: "Ubicación", room: "Habitación", startTime: "Hora de Inicio", endTime: "Hora de Fin",
      date: "Fecha", createShift: "Crear Turno", weekView: "Vista Semanal", dayView: "Vista Diaria", noShifts: "Sin turnos programados",
    },
    managerAccess: {
      title: "Control de Acceso de Gerentes", addManager: "+ Agregar Gerente", name: "Nombre", email: "Email",
      role: "Rol", permissions: "Permisos", activeManagers: "Gerentes Activos", noManagers: "No se encontraron gerentes",
    },
    chat: {
      title: "Chat de Operaciones en Vivo", typeMessage: "Escriba un mensaje...", send: "Enviar", noMessages: "Aún no hay mensajes", activeChats: "Conversaciones Activas",
    },
  },
};

export const getDashboardTranslation = (locale: string | string[] | undefined): DashboardTranslationDict => {
  const code = typeof locale === "string" ? locale : "en";
  return translations[code] || translations.en;
};
