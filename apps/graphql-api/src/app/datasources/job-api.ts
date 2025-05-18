import { RESTDataSource } from 'apollo-datasource-rest';
import { ApplicationStatus } from '@jt-nx/shared-models';

// Global mock storage for job applications
const globalMockApplications = [
  {
    id: 'app-1',
    company: 'Tech Innovations Inc.',
    position: 'Senior Full Stack Developer',
    location: 'San Francisco, CA',
    appliedDate: new Date('2025-05-01').toISOString(),
    status: ApplicationStatus.INTERVIEW,
    notes: 'Had first interview on May 10th. Waiting for second round.',
    contactName: 'Jane Smith',
    contactEmail: 'jane.smith@techinnovations.com',
    nextFollowUp: new Date('2025-05-20').toISOString(),
    salary: '150000',
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString()
  },
  {
    id: 'app-2',
    company: 'Global Software Solutions',
    position: 'Frontend Engineer',
    location: 'Remote',
    appliedDate: new Date('2025-05-05').toISOString(),
    status: ApplicationStatus.APPLIED,
    notes: 'Submitted application through their career portal.',
    contactName: 'Recruiting Team',
    contactEmail: 'recruiting@globalsoftware.com',
    nextFollowUp: new Date('2025-05-19').toISOString(),
    salary: '120000',
    createdAt: new Date('2025-05-05').toISOString(),
    updatedAt: new Date('2025-05-05').toISOString()
  },
  {
    id: 'app-3',
    company: 'Startup Ventures',
    position: 'Backend Developer',
    location: 'New York, NY',
    appliedDate: new Date('2025-04-25').toISOString(),
    status: ApplicationStatus.OFFER,
    notes: 'Received offer! Need to negotiate salary.',
    contactName: 'Michael Johnson',
    contactEmail: 'michael@startupventures.com',
    nextFollowUp: new Date('2025-05-18').toISOString(),
    salary: '135000',
    createdAt: new Date('2025-04-25').toISOString(),
    updatedAt: new Date('2025-05-15').toISOString()
  }
];

// Track application IDs for operations
let nextAppId = globalMockApplications.length + 1;

export class JobAPI extends RESTDataSource {
  private mockApplications = globalMockApplications;
  
  constructor() {
    super();
    // This should match the URL of your job tracker service
    this.baseURL = process.env['JOB_SERVICE_URL'] || 'http://localhost:3334/api/';
  }

  // Set authorization token for all requests
  willSendRequest(request: any) {
    // The token is expected to be in the GraphQL context
    const context = this.context as { token?: string };
    if (context.token) {
      console.log('Setting Authorization header with token');
      // Ensure token is properly formatted
      const token = context.token;
      // If token already includes 'Bearer', don't add it again
      const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      request.headers.set('Authorization', tokenValue);
    } else {
      console.warn('No token found in context for API request');
    }
  }

  // Get all applications
  async getApplications() {
    try {
      console.log('Attempting to fetch applications from real API at:', this.baseURL + 'applications');
      // Try to get from real API first
      return await this.get('applications');
    } catch (error) {
      console.error('Error fetching applications from real API:', error.message);
      console.error('Error details:', error);
      console.log('Falling back to mock applications');
      // Return mock data if service is unavailable
      return this.mockApplications;
    }
  }

  // Get a single application by ID
  async getApplicationById(id: string) {
    try {
      // Try to get from real API first
      return await this.get(`applications/${id}`);
    } catch (error) {
      // If real API fails, find in mock data
      const mockApp = this.mockApplications.find(app => app.id === id);
      if (!mockApp) {
        throw new Error(`Application with ID ${id} not found`);
      }
      return mockApp;
    }
  }

  // Create a new application
  async createApplication(applicationData: any) {
    console.log('JobAPI.createApplication called with data:', JSON.stringify(applicationData));
    console.log('Endpoint URL:', `${this.baseURL}applications`);
    
    try {
      console.log('Making POST request to Job Tracker Service');
      // Add userId from the token to the application data
      const context = this.context as { token?: string };
      const appData = {
        ...applicationData,
        // Ensure we're sending the proper object structure
        userId: applicationData.userId || 'default-user' // This should come from the token in production
      };
      
      console.log('Sending data to job service:', JSON.stringify(appData));
      
      // In the job-tracker-service, the API expects { application: applicationData }
      const response = await this.post('applications', { application: appData });
      console.log('Successfully created application:', response);
      return response;
    } catch (error) {
      console.error('Error in JobAPI.createApplication:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.extensions || 'No extensions');
      
      if (error.message && error.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to Job Tracker Service. Please ensure it is running.');
      }
      
      // We should not fall back to mock data in production,
      // but let the error propagate so it can be fixed
      throw error;
    }
  }

  // Update an application
  async updateApplication(id: string, applicationData: any) {
    try {
      // Try to update in real API first
      return await this.put(`applications/${id}`, { application: applicationData });
    } catch (error) {
      console.log('Using mock data for application update');
      // Find and update the mock application
      const index = this.mockApplications.findIndex(app => app.id === id);
      if (index === -1) {
        throw new Error(`Application with ID ${id} not found`);
      }
      
      // Update the application and its updatedAt timestamp
      this.mockApplications[index] = {
        ...this.mockApplications[index],
        ...applicationData,
        updatedAt: new Date().toISOString()
      };
      
      return this.mockApplications[index];
    }
  }

  // Delete an application
  async deleteApplication(id: string) {
    try {
      // Try to delete in real API first
      return await this.delete(`applications/${id}`);
    } catch (error) {
      console.log('Using mock data for application deletion');
      // Find and remove the mock application
      const index = this.mockApplications.findIndex(app => app.id === id);
      if (index === -1) {
        throw new Error(`Application with ID ${id} not found`);
      }
      
      // Remove the application from the array
      const deleted = this.mockApplications.splice(index, 1)[0];
      return { success: true, id };
    }
  }
}
