import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { typeDefs } from './app/schemas';
import { resolvers } from './app/resolvers';
import { UserAPI, JobAPI } from './app/datasources';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 4000;

async function startApolloServer() {
  // Create Express app
  const app = express();
  
  // Create http server
  const httpServer = http.createServer(app);
  
  // Set up CORS for all routes with proper credentials support
  app.use((req, res, next) => {
    // Get the origin from the request or use a default during development
    const origin = req.headers.origin || 'http://localhost:3000';
    
    // Allow the specific origin instead of wildcard when using credentials
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle OPTIONS requests immediately
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  });
  
  // Add json middleware
  app.use(express.json());
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
      userAPI: new UserAPI(),
      jobAPI: new JobAPI()
    }),
    context: ({ req }) => {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization || '';
      
      // If Bearer prefix exists, extract the token, otherwise use the whole value
      // Make sure we get a proper token, not an empty string after splitting
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] || '' 
        : authHeader;
      
      console.log('Apollo context - Authorization header:', authHeader ? `"${authHeader}"` : 'missing');
      console.log('Apollo context - Token type check:', {
        isEmpty: token === '',
        startsWith_ey: token.startsWith('ey'),
        length: token.length
      });
      
      if (token && token.length > 20) {
        console.log('Apollo context - Valid token found:', token.substring(0, 15) + '...');
      } else {
        console.log('Apollo context - No valid token found');
      }
      
      return { token: token || null };
    },
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    introspection: true,
    debug: true, // Enable debug information
  });
  
  // Start Apollo Server
  await server.start();
  
  // Apply middleware with no CORS (we handle it above)
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // Disable Apollo's CORS handling
  });
  
  // Health check route
  app.get('/', (_req, res) => {
    res.json({ message: 'GraphQL API Gateway is running!' });
  });
  
  // Start the HTTP server
  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));
  
  console.log(`GraphQL API Gateway is running at http://${host}:${port}`);
  console.log(`GraphQL Playground available at http://${host}:${port}/graphql`);
}

// Start the server
startApolloServer().catch(err => {
  console.error('Error starting server:', err);
});
