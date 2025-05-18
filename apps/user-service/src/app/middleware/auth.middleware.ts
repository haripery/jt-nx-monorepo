import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@jt-nx/shared-utils';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    console.log('FULL Token extracted:', token);
    
    let decoded;
    try {
      // Verify the token
      decoded = verifyToken(token);
      console.log('Token verified, userId:', decoded.userId);
    } catch (err) {
      console.error('Token verification failed:', err.message);
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    // Add the userId to both the request object and body
    req.userId = decoded.userId;
    req.body.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
