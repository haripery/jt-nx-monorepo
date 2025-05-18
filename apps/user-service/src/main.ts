import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './app/routes/auth.routes';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3333;
const mongoUri = process.env['MONGO_URI'] || 'mongodb://localhost:27017/jobtracker';

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.send({ message: 'User Service API is running!' });
});

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(port, host, () => {
  console.log(`User Service is running at http://${host}:${port}`);
});
