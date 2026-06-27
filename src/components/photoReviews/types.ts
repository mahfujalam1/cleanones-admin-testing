export type ReviewStatus = "Pending Review" | "Approved" | "Rejected";

export type RejectReason =
    | "poor_quality"
    | "incomplete_cleaning"
    | "wrong_room"
    | "blurry_image"
    | "missing_areas"
    | "other";

export interface AIAnalysis {
    overallScore: number;
    qualityScore: number;
    coverageScore: number;
    imageQualityScore: number;
    brightnessScore: number;
    suggestion: "Approve" | "Reject" | "Review";
    notes: string[];
}

export interface PhotoReview {
    id: string;
    cleaner: {
        name: string;
        initials: string;
        avatarColor: string;
    };
    client: string;
    location: string;
    room: string;
    dateSubmitted: string;
    aiScore: number;
    aiConfidence: number;
    status: ReviewStatus;
    aiAnalysis?: AIAnalysis;
    beforeImage?: string;
    afterImage?: string;
    submittedBy?: string;
    shiftId?: string;
}

export interface RejectFormData {
    reason: RejectReason | "";
    managerComment: string;
    saveAsTrainingData: boolean;
}

export interface ApproveFormData {
    managerComment: string;
    saveAsTrainingData: boolean;
}