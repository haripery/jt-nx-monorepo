import { AuthenticationError, UserInputError } from 'apollo-server-express';

export const jobApplicationResolvers = {
  Query: {
    applications: async (_, __, { dataSources, token }) => {
      console.log('Resolving applications query, token present:', !!token);
      
      if (!token) {
        console.error('Authentication error: No token provided');
        throw new AuthenticationError('You must be logged in to view applications');
      }

      try {
        console.log('Attempting to fetch applications with token');
        const apps = await dataSources.jobAPI.getApplications();
        console.log(`Successfully fetched ${apps.length} applications`);
        return apps;
      } catch (error) {
        console.error('Error fetching applications:', error);
        if (error.message && error.message.includes('401')) {
          throw new AuthenticationError('Authentication failed when connecting to Job Tracker Service');
        }
        throw new Error('Failed to fetch applications');
      }
    },
    application: async (_, { id }, { dataSources, token }) => {
      if (!token) {
        throw new AuthenticationError('You must be logged in to view an application');
      }

      try {
        return await dataSources.jobAPI.getApplicationById(id);
      } catch (error) {
        console.error('Error fetching application:', error);
        if (error.extensions?.response?.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch application');
      }
    },
  },
  Mutation: {
    createJobApplication: async (_, { input }, { dataSources, token }) => {
      console.log('Creating job application with token:', token ? 'present' : 'missing');
      console.log('Application input:', JSON.stringify(input));
      
      if (!token) {
        console.error('Authentication error: No token provided for application creation');
        throw new AuthenticationError('You must be logged in to create an application');
      }

      try {
        console.log('Calling jobAPI.createApplication with input data');
        const result = await dataSources.jobAPI.createApplication(input);
        console.log('Successfully created application:', result?.id || 'No ID returned');
        return result;
      } catch (error) {
        console.error('Error creating application:', error);
        console.error('Error details:', error.message);
        if (error.stack) console.error('Stack trace:', error.stack);
        
        if (error.message && error.message.includes('401')) {
          throw new AuthenticationError('Authentication failed when connecting to Job Tracker Service');
        }
        throw new Error(`Failed to create application: ${error.message}`);
      }
    },
    updateJobApplication: async (_, { input }, { dataSources, token }) => {
      if (!token) {
        throw new AuthenticationError('You must be logged in to update an application');
      }

      const { id, ...applicationData } = input;

      try {
        return await dataSources.jobAPI.updateApplication(id, applicationData);
      } catch (error) {
        console.error('Error updating application:', error);
        if (error.extensions?.response?.status === 404) {
          throw new UserInputError('Application not found');
        }
        throw new Error('Failed to update application');
      }
    },
    deleteJobApplication: async (_, { id }, { dataSources, token }) => {
      if (!token) {
        throw new AuthenticationError('You must be logged in to delete an application');
      }

      try {
        await dataSources.jobAPI.deleteApplication(id);
        return true;
      } catch (error) {
        console.error('Error deleting application:', error);
        if (error.extensions?.response?.status === 404) {
          throw new UserInputError('Application not found');
        }
        return false;
      }
    },
  },
};
