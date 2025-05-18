import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jobApplicationRoutes from './app/routes/job-application.routes';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3334;
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
  res.send({ message: 'Job Tracker Service API is running!' });
});

// Routes
app.use('/api/applications', jobApplicationRoutes);

// Start server
app.listen(port, host, () => {
  console.log(`Job Tracker Service is running at http://${host}:${port}`);
});
