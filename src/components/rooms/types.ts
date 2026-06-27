export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Junior Suite';
export type CleaningPlan = 'Standard Clean' | 'Deluxe Clean' | 'Suite Deep Clean' | 'Junior Suite Clean';

export interface Room {
    id: string;
    name: string;
    type: RoomType;
    location: string;
    floor: string;
    duration: number; // minutes
    photos: number;
    tasks: number;
    cleaningPlan: CleaningPlan;
}