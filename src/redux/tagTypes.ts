export enum tagTypes {
  users = "users",
  profile = "profile",
  dashboard = "dashboard",
  chat = "chat",
  cleaningPlans = "cleaningPlans",
  clients = "clients",
  escalations = "escalations",
  extraServices = "extraServices",
  locations = "locations",
  manager = "manager",
  notifications = "notifications",
  photoReviews = "photoReviews",
  reports = "reports",
  rooms = "rooms",
  roster = "roster",
  shiftMonitoring = "shiftMonitoring",
  shifts = "shifts",
  workers = "workers",
}

export const tagTypeList = Object.values(tagTypes);
