'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_ME_QUERY } from '../graphql/auth';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
} | null;

interface AuthContextType {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        console.log('Found token on initialization, will try to fetch user data');
        try {
          // Force a refetch of user data when token exists
          setLoading(true);
          // Only update loading state, the useQuery will handle actual data fetching
        } catch (err) {
          console.error('Error during auth initialization:', err);
          localStorage.removeItem('token'); // Clear invalid token
          setUser(null);
          setLoading(false);
        }
      } else {
        console.log('No token found on initialization');
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Check for existing token and get user data if available
  const { loading: userLoading } = useQuery(GET_ME_QUERY, {
    skip: !getToken(),
    fetchPolicy: 'network-only', // Don't use cache for authentication
    onCompleted: (data) => {
      console.log('User profile data loaded successfully:', data?.me?.email);
      if (data?.me) {
        setUser(data.me);
      }
      setLoading(false);
    },
    onError: (error) => {
      // Handle network errors differently from auth errors
      console.error('Error fetching user profile:', error.message);
      
      if (error.message.includes('Failed to fetch') || error.networkError) {
        console.error('Network error during authentication - services may be down');
        // Don't clear token on network errors, might just be temporary
      } else if (error.message.includes('Unauthorized') || error.message.includes('token')) {
        // Only clear token if it's an authentication error
        console.error('Authentication error - clearing token');
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    }
  });

  // Get token from localStorage
  function getToken() {
    if (typeof window === 'undefined') {
      return '';
    }
    return localStorage.getItem('token');
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      console.log('Attempting to login with email:', email);
      setError(null);
      setLoading(true);
      
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        },
        errorPolicy: 'all' // Handle errors in the catch block
      });

      if (data?.login) {
        console.log('Login successful, setting token and user data');
        // Set token in localStorage
        localStorage.setItem('token', data.login.token);
        // Update user state
        setUser(data.login.user);
        setLoading(false);
        return data.login;
      } else {
        console.log('Login mutation returned but without expected data');
        setLoading(false);
        throw new Error('Login failed - no data returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Handle network errors with a more specific error message
      const error = err as Error; // Type assertion for TypeScript
      if (error.message?.includes('Failed to fetch')) {
        setError(new Error('Cannot connect to server. Please check your connection or try again later.'));
      } else {
        setError(error);
      }
      setLoading(false);
      throw err;
    }
  }

  // Register function
  async function register(email: string, password: string, firstName: string, lastName: string) {
    try {
      setError(null);
      const { data } = await registerMutation({
        variables: {
          input: { email, password, firstName, lastName }
        }
      });

      if (data?.register) {
        localStorage.setItem('token', data.register.token);
        setUser(data.register.user);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  // Logout function
  function logout() {
    console.log('Logging out user');
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Reset user state
    setUser(null);
    // Set any additional cleanup if needed
    setError(null);
    // Force page reload to clear Apollo cache and reset all state
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      // Combine both loading states to ensure UI waits for all auth operations
      loading: loading || userLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
