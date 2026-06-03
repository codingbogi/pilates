export type TrainingType = "group" | "duo" | "individual";
export type UserRole = "admin" | "client";
export type ReservationStatus = "active" | "cancelled";
export type Locale = "sr" | "en";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  trainingType: TrainingType;
  remainingSessions: number;
  role: UserRole;
  createdAt: Date;
}

export interface Reservation {
  id: string;
  userId: string;
  date: string;
  timeSlot: string;
  trainingType: string;
  status: ReservationStatus;
  createdAt: Date;
}

export interface BlockedSlot {
  id: string;
  date: string;
  timeSlot: string | null;
  createdAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const TIME_SLOTS = [
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00",
] as const;

export const TRAINING_CAPACITY: Record<TrainingType, number> = {
  individual: 1,
  duo: 2,
  group: 7,
};
