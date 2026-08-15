export interface CleaningPlan {
    id: string;
    name: string;
    client: string;
    location: string;
    rooms: string[];
    duration: number;
    photos: number;
    tasks: number;
    aiValid: boolean;
    checklistTasks: string[];
    photoRequirements: string[];
    periodicTasks?: { task: string; frequencyDays: number; lastCompleted: string; due: boolean }[];
    photoRotation?: string;
}
