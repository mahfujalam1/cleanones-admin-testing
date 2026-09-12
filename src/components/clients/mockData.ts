import { Client } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Schoonmaak Amsterdam BV',
    industry: 'Corporate',
    status: 'Active',
    mainContactName: 'Johan Brouwer',
    email: 'j.brouwer@schoonmaakamsterdam.nl',
    phone: '+31 20 123 4567',
    locationsCount: 2,
    contractStatus: 'Active',
    contractExpiryDate: '31 Dec 2026',
    activeTasks: 6,
    contacts: [
      {
        id: 'c1',
        name: 'Johan Brouwer',
        role: 'Facility Manager',
        email: 'j.brouwer@schoonmaakamsterdam.nl',
        phone: '+31 20 123 4567'
      },
      {
        id: 'c2',
        name: 'Sara Bakker',
        role: 'Operations Contact',
        email: 's.bakker@schoonmaakamsterdam.nl',
        phone: '+31 20 123 4568'
      }
    ],
    locations: [
      {
        id: 'l1',
        name: 'Hoofdkantoor Amsterdam',
        address: 'Herengracht 500, Amsterdam',
        roomsCount: 24
      },
      {
        id: 'l2',
        name: 'Bijkantoor Zuidas',
        address: 'Gustav Mahlerplein 2, Amsterdam',
        roomsCount: 16
      }
    ]
  },
  {
    id: '2',
    name: 'Kantoorschoonmaak Rotterdam',
    industry: 'Corporate',
    status: 'Active',
    mainContactName: 'Peter van Leeuwen',
    email: 'p.vanleeuwen@kantoorschoon.nl',
    phone: '+31 10 234 5678',
    locationsCount: 1,
    contractStatus: 'Expiring',
    contractExpiryDate: '31 Aug 2026',
    activeTasks: 3,
    contacts: [
      {
        id: 'c3',
        name: 'Peter van Leeuwen',
        role: 'Facility Manager',
        email: 'p.vanleeuwen@kantoorschoon.nl',
        phone: '+31 10 234 5678'
      }
    ],
    locations: [
      {
        id: 'l3',
        name: 'Rotterdam Office',
        address: 'Coolsingel 120, Rotterdam',
        roomsCount: 18
      }
    ]
  },
  {
    id: '3',
    name: 'Zorg & Schoon Utrecht',
    industry: 'Healthcare',
    status: 'Active',
    mainContactName: 'Mark Hendriks',
    email: 'm.hendriks@zorgschoon.nl',
    phone: '+31 30 345 6789',
    locationsCount: 1,
    contractStatus: 'Active',
    contractExpiryDate: '30 Jun 2027',
    activeTasks: 8,
    contacts: [
      {
        id: 'c4',
        name: 'Mark Hendriks',
        role: 'Health Facility Coordinator',
        email: 'm.hendriks@zorgschoon.nl',
        phone: '+31 30 345 6789'
      }
    ],
    locations: [
      {
        id: 'l4',
        name: 'Utrecht Medical Center',
        address: 'Heidelberglaan 100, Utrecht',
        roomsCount: 45
      }
    ]
  },
  {
    id: '4',
    name: 'NH Hotels Nederland',
    industry: 'Hospitality',
    status: 'Active',
    mainContactName: 'Karin Bakker',
    email: 'k.bakker@nh-hotels.nl',
    phone: '+31 20 456 7890',
    locationsCount: 2,
    contractStatus: 'Active',
    contractExpiryDate: '15 Jan 2027',
    activeTasks: 12,
    contacts: [
      {
        id: 'c5',
        name: 'Karin Bakker',
        role: 'Hospitality Cleaning Director',
        email: 'k.bakker@nh-hotels.nl',
        phone: '+31 20 456 7890'
      }
    ],
    locations: [
      {
        id: 'l5',
        name: 'NH Collection Amsterdam',
        address: 'Dam 9, Amsterdam',
        roomsCount: 120
      },
      {
        id: 'l6',
        name: 'NH Rotterdam Centro',
        address: 'Weena 350, Rotterdam',
        roomsCount: 95
      }
    ]
  },
  {
    id: '5',
    name: 'Facility Services Eindhoven',
    industry: 'Corporate',
    status: 'Active',
    mainContactName: 'Marieke de Jong',
    email: 'm.dejong@facilityservices.nl',
    phone: '+31 40 567 8901',
    locationsCount: 1,
    contractStatus: 'Active',
    contractExpiryDate: '31 Oct 2026',
    activeTasks: 4,
    contacts: [
      {
        id: 'c6',
        name: 'Marieke de Jong',
        role: 'General Manager',
        email: 'm.dejong@facilityservices.nl',
        phone: '+31 40 567 8901'
      }
    ],
    locations: [
      {
        id: 'l7',
        name: 'Eindhoven Business Park',
        address: 'Flight Forum 40, Eindhoven',
        roomsCount: 30
      }
    ]
  },
  {
    id: '6',
    name: 'Schoonmaak Leiden BV',
    industry: 'Corporate',
    status: 'Inactive',
    mainContactName: 'Pieter van Dijk',
    email: 'p.vandijk@schoonleiden.nl',
    phone: '+31 71 890 1234',
    locationsCount: 0,
    contractStatus: 'Expired',
    contractExpiryDate: '01 Mar 2026',
    activeTasks: 0,
    contacts: [
      {
        id: 'c7',
        name: 'Pieter van Dijk',
        role: 'Former Director',
        email: 'p.vandijk@schoonleiden.nl',
        phone: '+31 71 890 1234'
      }
    ],
    locations: []
  }
];
