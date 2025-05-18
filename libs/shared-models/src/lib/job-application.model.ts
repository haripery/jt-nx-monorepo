import { Document } from 'mongoose';

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED'
}

export interface JobApplication extends Document {
  id: string;
  userId: string;
  company: string;
  position: string;
  location: string;
  appliedDate: Date;
  status: ApplicationStatus;
  notes: string;
  contactName?: string;
  contactEmail?: string;
  nextFollowUp?: Date;
  salary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplicationInput {
  company: string;
  position: string;
  location: string;
  appliedDate: Date;
  status: ApplicationStatus;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  nextFollowUp?: Date;
  salary?: string;
}

export interface JobApplicationUpdateInput extends JobApplicationInput {
  id: string;
}
