import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create an HTTP link - use hardcoded URL in development if env var is missing
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
  credentials: 'same-origin', // Use same-origin to prevent CORS issues
  fetchOptions: {
    mode: 'cors',
  }
});

// Authentication link to add the token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
    console.log('Apollo client - token from localStorage:', token ? 'present' : 'missing');
  }
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Create Apollo Client
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
