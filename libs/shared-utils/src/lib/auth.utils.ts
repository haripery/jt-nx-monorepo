import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

// IMPORTANT: Make sure to set this environment variable in production
const JWT_SECRET = process.env['JWT_SECRET'] || 'development-only-jwt-secret-do-not-use-in-production';
const JWT_EXPIRATION = '24h';

export const generatePasswordHash = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
};
