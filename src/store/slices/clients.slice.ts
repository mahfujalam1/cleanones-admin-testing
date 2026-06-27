import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientContact, ClientLocation } from '@/components/clients/types';
import { MOCK_CLIENTS } from '@/components/clients/mockData';

interface ClientsState {
  list: Client[];
}

const initialState: ClientsState = {
  list: MOCK_CLIENTS
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    addClient(state, action: PayloadAction<Omit<Client, 'id' | 'locationsCount' | 'contractStatus' | 'contractExpiryDate' | 'activeTasks' | 'contacts' | 'locations'>>) {
      const newId = (state.list.length + 1).toString();
      const newClient: Client = {
        ...action.payload,
        id: newId,
        locationsCount: 0,
        contractStatus: 'Active',
        contractExpiryDate: '31 Dec 2026',
        activeTasks: 0,
        contacts: [
          {
            id: `c_${newId}_1`,
            name: action.payload.mainContactName,
            role: 'Facility Manager',
            email: action.payload.email,
            phone: action.payload.phone
          }
        ],
        locations: []
      };
      state.list.push(newClient);
    },
    deleteClient(state, action: PayloadAction<string>) {
      state.list = state.list.filter(c => c.id !== action.payload);
    },
    updateClient(state, action: PayloadAction<Client>) {
      const idx = state.list.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
      }
    },
    addClientContact(state, action: PayloadAction<{ clientId: string; contact: Omit<ClientContact, 'id'> }>) {
      const client = state.list.find(c => c.id === action.payload.clientId);
      if (client) {
        const nextId = `c_${client.id}_${client.contacts.length + 1}`;
        client.contacts.push({
          ...action.payload.contact,
          id: nextId
        });
      }
    },
    deleteClientContact(state, action: PayloadAction<{ clientId: string; contactId: string }>) {
      const client = state.list.find(c => c.id === action.payload.clientId);
      if (client) {
        client.contacts = client.contacts.filter(c => c.id !== action.payload.contactId);
      }
    },
    addClientLocation(state, action: PayloadAction<{ clientId: string; location: Omit<ClientLocation, 'id'> }>) {
      const client = state.list.find(c => c.id === action.payload.clientId);
      if (client) {
        const nextId = `l_${client.id}_${client.locations.length + 1}`;
        client.locations.push({
          ...action.payload.location,
          id: nextId
        });
        client.locationsCount = client.locations.length;
      }
    },
    deleteClientLocation(state, action: PayloadAction<{ clientId: string; locationId: string }>) {
      const client = state.list.find(c => c.id === action.payload.clientId);
      if (client) {
        client.locations = client.locations.filter(l => l.id !== action.payload.locationId);
        client.locationsCount = client.locations.length;
      }
    }
  }
});

export const {
  addClient,
  deleteClient,
  updateClient,
  addClientContact,
  deleteClientContact,
  addClientLocation,
  deleteClientLocation
} = clientsSlice.actions;

export default clientsSlice.reducer;
