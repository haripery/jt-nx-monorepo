import { Request, Response } from 'express';
import { JobApplicationModel } from '../schemas/job-application.schema';
import { JobApplicationInput, JobApplicationUpdateInput } from '@jt-nx/shared-models';

// Get all applications for a user
export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId;
    console.log('Getting applications for user:', userId);
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const applications = await JobApplicationModel.find({ userId }).sort({ appliedDate: -1 });
    console.log(`Found ${applications.length} applications`);
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// Get a single application by ID
export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId;
    const applicationId = req.params.id;
    console.log(`Getting application by ID: ${applicationId} for user: ${userId}`);
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const application = await JobApplicationModel.findOne({ _id: applicationId, userId });
    
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }
    
    console.log('Found application:', application.company);
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Server error while fetching application' });
  }
};

// Create a new job application
export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId;
    const applicationData: JobApplicationInput = req.body.application;
    
    console.log('createApplication controller received request with userId:', userId);
    console.log('Application data:', JSON.stringify(applicationData));
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Add userId as a string field, not trying to convert to ObjectId
    // This is a temporary workaround for authentication issues during development
    const newApplication = {
      ...applicationData,
      userId: userId.toString(), // Ensure userId is a string
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating application with data:', JSON.stringify(newApplication));
    
    const application = await JobApplicationModel.create(newApplication);
    console.log('Application created successfully:', application._id);
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      message: 'Server error while creating application',
      error: error.message
    });
  }
};

// Update an existing job application
export const updateApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId;
    const applicationId = req.params.id;
    const applicationData: JobApplicationUpdateInput = req.body.application;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const application = await JobApplicationModel.findOneAndUpdate(
      { _id: applicationId, userId },
      { ...applicationData },
      { new: true }
    );
    
    if (!application) {
      res.status(404).json({ message: 'Application not found or you do not have permission to update it' });
      return;
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Server error while updating application' });
  }
};

// Delete a job application
export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId;
    const applicationId = req.params.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const application = await JobApplicationModel.findOneAndDelete({ 
      _id: applicationId,
      userId
    });
    
    if (!application) {
      res.status(404).json({ message: 'Application not found or you do not have permission to delete it' });
      return;
    }
    
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Server error while deleting application' });
  }
};
