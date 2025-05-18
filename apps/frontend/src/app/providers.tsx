// Apollo Client and Auth provider for Next.js
'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from './lib/apollo-client';
import { AuthProvider } from './contexts/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ApolloProvider>
  );
}
