export interface DashboardTranslationDict {
  nav: {
    dashboard: string;
    roster: string;
    shiftMonitoring: string;
    workers: string;
    clients: string;
    chat: string;
    locations: string;
    rooms: string;
    cleaningPlans: string;
    extraServices: string;
    qualityControl: string;
    photoReviews: string;
    escalations: string;
    reports: string;
    notifications: string;
    settings: string;
    administration: string;
    managerAccess: string;
    signOut: string;
  };
  topbar: {
    notifications: string;
    viewAll: string;
    noNotifications: string;
    profile: string;
    helpCenter: string;
    liveChat: string;
    emailSupport: string;
    faq: string;
    getSupport: string;
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
  },
  pl: {
    nav: {
      dashboard: "Pulpit", roster: "Harmonogram", shiftMonitoring: "Monitorowanie Zmian", workers: "Pracownicy",
      clients: "Klienci", chat: "Czat", locations: "Lokalizacje", rooms: "Pokoje", cleaningPlans: "Plany Sprzątania",
      extraServices: "Usługi Dodatkowe", qualityControl: "Kontrola Jakości", photoReviews: "Recenzje Zdjęć",
      escalations: "Eskalacje", reports: "Raporty", notifications: "Powiadomienia", settings: "Ustawienia",
      administration: "Administracja", managerAccess: "Dostęp Menedżera", signOut: "Wyloguj się",
    },
    topbar: {
      notifications: "Powiadomienia", viewAll: "Zobacz wszystkie", noNotifications: "Brak powiadomień",
      profile: "Profil", helpCenter: "Centrum Pomocy", liveChat: "Czat na żywo", emailSupport: "Wsparcie e-mail",
      faq: "Często zadawane pytania", getSupport: "Uzyskaj pomoc lub znajdź odpowiedzi",
    },
  },
  uk: {
    nav: {
      dashboard: "Панель управління", roster: "Розклад", shiftMonitoring: "Моніторинг змін", workers: "Працівники",
      clients: "Клієнти", chat: "Чат", locations: "Локації", rooms: "Кімнати", cleaningPlans: "Плани прибирання",
      extraServices: "Додаткові послуги", qualityControl: "Контроль якості", photoReviews: "Перевірка фото",
      escalations: "Ескалації", reports: "Звіти", notifications: "Сповіщення", settings: "Налаштування",
      administration: "Адміністрування", managerAccess: "Доступ менеджера", signOut: "Вийти",
    },
    topbar: {
      notifications: "Сповіщення", viewAll: "Переглянути всі", noNotifications: "Немає сповіщень",
      profile: "Профіль", helpCenter: "Центр допомоги", liveChat: "Онлайн-чат", emailSupport: "Email підтримка",
      faq: "Часті запитання", getSupport: "Отримайте підтримку або знайдіть відповіді",
    },
  },
  pt: {
    nav: {
      dashboard: "Painel", roster: "Escala", shiftMonitoring: "Monitorização de Turnos", workers: "Trabalhadores",
      clients: "Clientes", chat: "Chat", locations: "Localizações", rooms: "Divisões", cleaningPlans: "Planos de Limpeza",
      extraServices: "Serviços Extra", qualityControl: "Controlo de Qualidade", photoReviews: "Revisão de Fotos",
      escalations: "Escalações", reports: "Relatórios", notifications: "Notificações", settings: "Definições",
      administration: "Administração", managerAccess: "Acesso de Gestor", signOut: "Sair",
    },
    topbar: {
      notifications: "Notificações", viewAll: "Ver tudo", noNotifications: "Sem notificações",
      profile: "Perfil", helpCenter: "Centro de Ajuda", liveChat: "Chat ao Vivo", emailSupport: "Suporte por Email",
      faq: "Perguntas Frequentes", getSupport: "Obtenha suporte ou encontre respostas",
    },
  },
  ar: {
    nav: {
      dashboard: "لوحة التحكم", roster: "جدول المناوبات", shiftMonitoring: "مراقبة الورديات", workers: "العاملون",
      clients: "العملاء", chat: "المحادثة", locations: "المواقع", rooms: "الغرف", cleaningPlans: "خطط التنظيف",
      extraServices: "خدمات إضافية", qualityControl: "مراقبة الجودة", photoReviews: "مراجعة الصور",
      escalations: "البلاغات والتصعيد", reports: "التقارير", notifications: "الإشعارات", settings: "الإعدادات",
      administration: "الإدارة", managerAccess: "صلاحيات المدراء", signOut: "تسجيل الخروج",
    },
    topbar: {
      notifications: "الإشعارات", viewAll: "عرض الكل", noNotifications: "لا توجد إشعارات",
      profile: "الملف الشخصي", helpCenter: "مركز المساعدة", liveChat: "محادثة مباشرة", emailSupport: "الدعم عبر البريد",
      faq: "الأسئلة الشائعة", getSupport: "احصل على الدعم أو ابحث عن إجابات",
    },
  },
  fr: {
    nav: {
      dashboard: "Tableau de bord", roster: "Planning", shiftMonitoring: "Suivi des équipes", workers: "Employés",
      clients: "Clients", chat: "Discussion", locations: "Emplacements", rooms: "Pièces", cleaningPlans: "Plans de nettoyage",
      extraServices: "Services supplémentaires", qualityControl: "Contrôle qualité", photoReviews: "Examens photos",
      escalations: "Escalades", reports: "Rapports", notifications: "Notifications", settings: "Paramètres",
      administration: "Administration", managerAccess: "Accès manager", signOut: "Déconnexion",
    },
    topbar: {
      notifications: "Notifications", viewAll: "Voir tout", noNotifications: "Aucune notification",
      profile: "Profil", helpCenter: "Centre d'aide", liveChat: "Chat en direct", emailSupport: "Support par e-mail",
      faq: "Foire aux questions", getSupport: "Obtenez de l'aide ou trouvez des réponses",
    },
  },
  es: {
    nav: {
      dashboard: "Panel principal", roster: "Turnos", shiftMonitoring: "Supervisión de turnos", workers: "Trabajadores",
      clients: "Clientes", chat: "Chat", locations: "Ubicaciones", rooms: "Habitaciones", cleaningPlans: "Planes de limpieza",
      extraServices: "Servicios adicionales", qualityControl: "Control de calidad", photoReviews: "Revisión de fotos",
      escalations: "Escalaciones", reports: "Informes", notifications: "Notificaciones", settings: "Ajustes",
      administration: "Administración", managerAccess: "Acceso de gestor", signOut: "Cerrar sesión",
    },
    topbar: {
      notifications: "Notificaciones", viewAll: "Ver todo", noNotifications: "Sin notificaciones",
      profile: "Perfil", helpCenter: "Centro de ayuda", liveChat: "Chat en vivo", emailSupport: "Soporte por correo",
      faq: "Preguntas frecuentes", getSupport: "Obtén ayuda o encuentra respuestas",
    },
  },
};

export function getDashboardTranslation(locale: string | null | undefined): DashboardTranslationDict {
  const code = locale && translations[locale] ? locale : "en";
  return translations[code];
}
