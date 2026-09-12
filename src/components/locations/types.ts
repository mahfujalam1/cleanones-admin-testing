export interface Location {
    id: string;
    name: string;
    client: string;
    address: string;
    floors: number;
    rooms: number;
    requiredHours: number;
    assignedEmployees: string[];
}
