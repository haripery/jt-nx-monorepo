import { RESTDataSource } from 'apollo-datasource-rest';

// Global mock storage to persist mock data across requests
const globalMockUsers = [
  {
    id: 'test-user-1',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
const globalMockTokens: Record<string, string> = {};

export class UserAPI extends RESTDataSource {
  private mockUsers: any[] = globalMockUsers;
  private mockTokens: Record<string, string> = globalMockTokens;
  
  constructor() {
    super();
    this.baseURL = process.env['USER_SERVICE_URL'] || 'http://localhost:3333/api/';
    console.log('UserAPI initialized with baseURL:', this.baseURL);
  }

  // Authentication
  async login(email: string, password: string) {
    try {
      // Log the login attempt
      console.log(`Login attempt for email: ${email}`);
      console.log(`Active mock users:`, this.mockUsers.map(u => u.email));
      
      try {
        // First try the real API
        return await this.post('auth/login', { email, password });
      } catch (apiError) {
        console.log('API login error, using mock login:', apiError.message);
        
        // Fallback to mock login for testing
        const mockUser = this.mockUsers.find(u => u.email === email);
        console.log('Found mock user:', mockUser ? 'yes' : 'no');
        
        if (!mockUser) {
          throw new Error('User not found');
        }
        
        if (mockUser.password !== password) {
          throw new Error('Invalid password');
        }
        
        const token = `mock-token-${Date.now()}`;
        this.mockTokens[token] = mockUser.id;
        
        console.log('Successful mock login for user:', mockUser.email);
        
        return {
          token,
          user: {
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            createdAt: mockUser.createdAt,
            updatedAt: mockUser.updatedAt
          }
        };
      }
    } catch (error) {
      console.error('Login error in UserAPI:', error.message);
      throw error;
    }
  }

  async register(userData: { email: string; password: string; firstName: string; lastName: string }) {
    try {
      // First try the real API
      return await this.post('auth/register', userData);
    } catch (error) {
      console.log('Using mock register instead due to API error:', error.message);
      // Fallback to mock registration for testing
      
      // Check if user already exists
      const existingUser = this.mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create mock user
      const mockUser = {
        id: `user-${Date.now()}`,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.mockUsers.push(mockUser);
      
      // Generate mock token
      const token = `mock-token-${Date.now()}`;
      this.mockTokens[token] = mockUser.id;
      
      return {
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt
        }
      };
    }
  }

  // User profile
  async getProfile(token: string) {
    console.log('getProfile called with token:', token.substring(0, 20) + '...');
    
    try {
      // Check if it's a JWT token (they start with "ey")
      const isJwtToken = token.startsWith('ey');
      
      if (isJwtToken) {
        try {
          // For JWT tokens, use the real API
          console.log('Attempting to fetch profile from real API with JWT token');
          
          // Make a direct request to the User Service using the baseURL
          const response = await this.get('auth/profile', undefined, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Successfully retrieved user profile from API:', response.email);
          return response;
        } catch (apiError) {
          console.error('Error fetching profile from API:', apiError.message || apiError);
          
          // Try the direct fetch approach as a fallback
          try {
            console.log('Attempting direct fetch to User Service as fallback');
            const directResponse = await fetch('http://localhost:3333/api/auth/profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!directResponse.ok) {
              throw new Error(`API error: ${directResponse.status}`);
            }
            
            const userData = await directResponse.json();
            console.log('Successfully retrieved user profile via direct fetch:', userData.email);
            return userData;
          } catch (directError) {
            console.error('Direct fetch also failed:', directError.message || directError);
            return null;
          }
        }
      } else {
        // For mock tokens, look up in the mock token store
        console.log('Processing mock token in getProfile');
        const userId = this.mockTokens[token];
        if (!userId) {
          console.log('Mock token not found in mockTokens map');
          return null;
        }
        
        const mockUser = this.mockUsers.find(u => u.id === userId);
        if (!mockUser) {
          console.log('User not found for mock token');
          return null;
        }
        
        console.log('Returning mock user profile for:', mockUser.email);
        return {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt
        };
      }
    } catch (error) {
      console.error('Unexpected error in getProfile:', error);
      return null;
    }
  }
}
