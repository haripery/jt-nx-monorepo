import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@jt-nx/shared-utils';

// For development - enable mock tokens when needed
const ALLOW_MOCK_TOKENS = true;

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth middleware received authHeader:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    console.log('Token extracted from Authorization header:', token.substring(0, 15) + '...');
    
    // Handle mock tokens for development/testing
    if (ALLOW_MOCK_TOKENS && token.startsWith('mock-token-')) {
      console.log('Development mode: Using mock token');
      // Extract mock user ID from token or use a default test ID
      const mockUserId = 'test-user-1';
      req.body.userId = mockUserId;
      next();
      return;
    }
    
    // For real tokens, verify JWT
    try {
      const decoded = verifyToken(token);
      console.log('Token verified successfully for user:', decoded.userId);
      
      // Add the userId to the request object
      req.body.userId = decoded.userId;
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
