export interface HeartbeatPayload {
    project: string;        // Workspace name
    language: string;       // Language ID
    file: string;           // Active file path
    lineCount: number;      // Current size of the file
    isWrite: boolean;       // True if typing, false if reading/scrolling
    timestamp: string;      // Timestamp
}

export enum ActivityType {
    Coding = "coding",
    Reading = "reading"
}