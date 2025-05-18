import * as mongoose from 'mongoose';
import { JobApplication, ApplicationStatus } from '@jt-nx/shared-models';

const JobApplicationSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed from ObjectId to String for simpler authentication during development
    required: true,
    index: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  appliedDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.APPLIED,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  contactName: {
    type: String,
    trim: true,
  },
  contactEmail: {
    type: String,
    trim: true,
  },
  nextFollowUp: {
    type: Date,
  },
  salary: {
    type: String,
    trim: true,
  },
}, { 
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const JobApplicationModel = mongoose.model<JobApplication>('JobApplication', JobApplicationSchema);
