import { AuthenticationError, UserInputError } from 'apollo-server-express';

export const authResolvers = {
  Query: {
    me: async (_, __, { dataSources, token }) => {
      console.log('Me query executed with token:', token ? `${token.substring(0, 15)}...` : 'null');
      
      if (!token) {
        console.log('No token provided in me query');
        return null;
      }

      try {
        const user = await dataSources.userAPI.getProfile(token);
        console.log('User profile fetched successfully:', user ? user.email : 'null');
        return user;
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
        // Don't return null automatically on all errors
        // If it's just a network error, the fallback in UserAPI might have worked
        return null;
      }
    },
  },
  Mutation: {
    register: async (_, { input }, { dataSources }) => {
      try {
        const result = await dataSources.userAPI.register(input);
        return result;
      } catch (error) {
        console.error('Register error:', error);
        if (error.extensions?.response?.status === 400) {
          throw new UserInputError('User with this email already exists');
        }
        throw new Error('Failed to register user');
      }
    },
    login: async (_, { input }, { dataSources }) => {
      try {
        console.log(`Attempting to login user: ${input.email}`);
        const result = await dataSources.userAPI.login(input.email, input.password);
        console.log('Login successful:', result.user.email);
        return result;
      } catch (error) {
        console.error('Login error:', error.message, error.stack);
        // Check for different error types
        if (error.extensions?.response?.status === 401 || 
            error.message === 'Invalid email or password') {
          throw new AuthenticationError('Invalid email or password');
        }
        // For any other error, provide more context
        throw new Error(`Failed to login: ${error.message}`);
      }
    },
  },
};
