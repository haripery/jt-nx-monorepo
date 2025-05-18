import { Request, Response } from 'express';
import { UserModel } from '../schemas/user.schema';
import { generatePasswordHash, generateToken } from '@jt-nx/shared-utils';
import { LoginInput, UserInput } from '@jt-nx/shared-models';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName }: UserInput = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await generatePasswordHash(password);

    // Create new user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get userId from either req.userId (preferred) or req.body.userId (fallback)
    const userId = req.userId || req.body.userId;
    console.log('Get profile called with userId:', userId);
    
    if (!userId) {
      console.log('No userId found in request');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    console.log('Looking up user with ID:', userId);
    const user = await UserModel.findById(userId);
    if (!user) {
      console.log('User not found for ID:', userId);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('User found, returning profile for:', user.email);
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error getting user profile' });
  }
};
