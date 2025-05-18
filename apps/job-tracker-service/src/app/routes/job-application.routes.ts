import { Router } from 'express';
import { 
  getAllApplications, 
  getApplicationById, 
  createApplication, 
  updateApplication, 
  deleteApplication 
} from '../controllers/job-application.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected with auth middleware
router.use(authMiddleware);

// Job application routes
router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
