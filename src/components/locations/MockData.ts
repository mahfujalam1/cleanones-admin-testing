import { Location } from "./types";


export const mockLocations: Location[] = [
    {
        id: 'L001',
        name: 'NH Hotel Amsterdam Centrum',
        client: 'NH Hotels Nederland',
        address: 'Stadhouderskade 7, Amsterdam',
        floors: 4,
        rooms: 48,
        requiredHours: 240,
        assignedEmployees: ['Lisa Visser', 'Emma Smit', 'Milan Dekker'],
    },
    {
        id: 'L002',
        name: 'Hilton Rotterdam',
        client: 'Kantoorschoonmaak Rotterdam',
        address: 'Weena 10, Rotterdam',
        floors: 3,
        rooms: 36,
        requiredHours: 192,
        assignedEmployees: ['Emma Smit', 'Daan van den Berg'],
    },
    {
        id: 'L003',
        name: 'Zorg & Schoon - UMC Utrecht',
        client: 'Zorg & Schoon Utrecht',
        address: 'Heidelberglaan 100, Utrecht',
        floors: 15,
        rooms: 120,
        requiredHours: 304,
        assignedEmployees: ['Noah Bos', 'Sophie de Boer', 'Anna Mulder'],
    },
    {
        id: 'L004',
        name: 'Van der Valk Eindhoven',
        client: 'Facility Services Eindhoven',
        address: 'Aalsterweg 322, Eindhoven',
        floors: 2,
        rooms: 24,
        requiredHours: 120,
        assignedEmployees: ['Sophie de Boer', 'Lucas Meijer'],
    },
    {
        id: 'L005',
        name: 'NH Hotel Groningen',
        client: 'ProClean Groningen',
        address: 'Hanzeplein 132, Groningen',
        floors: 5,
        rooms: 60,
        requiredHours: 168,
        assignedEmployees: ['Lucas Meijer', 'Milan Dekker'],
    },
    {
        id: 'L006',
        name: 'Haarlem Stadsschouwburg',
        client: 'Haarlem Schoonmaakdiensten',
        address: 'Grote Markt 15, Haarlem',
        floors: 3,
        rooms: 42,
        requiredHours: 104,
        assignedEmployees: ['Daan van den Berg', 'Anna Mulder'],
    },
];

export const mockClients = [
    'NH Hotels Nederland',
    'Kantoorschoonmaak Rotterdam',
    'Zorg & Schoon Utrecht',
    'Facility Services Eindhoven',
    'ProClean Groningen',
    'Haarlem Schoonmaakdiensten',
];
