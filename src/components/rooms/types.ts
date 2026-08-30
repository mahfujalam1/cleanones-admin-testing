export type RoomType = string;
export type CleaningPlan = string;

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
