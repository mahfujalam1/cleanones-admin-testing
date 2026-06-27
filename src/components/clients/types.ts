export interface Client {
  id: string;
  name: string;
  industry: 'Corporate' | 'Healthcare' | 'Hospitality';
  status: 'Active' | 'Inactive';
  mainContactName: string;
  email: string;
  phone: string;
  locationsCount: number;
  contractStatus: 'Active' | 'Expiring' | 'Expired';
  contractExpiryDate: string;
  activeTasks: number;

  contacts: ClientContact[];
  locations: ClientLocation[];
}

export interface ClientContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface ClientLocation {
  id: string;
  name: string;
  address: string;
  roomsCount: number;
}
