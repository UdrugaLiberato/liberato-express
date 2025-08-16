import { Router } from 'express';
import getStats from '../controllers/stats-controller';
import cache from '../middleware/cache';

const router = Router();

router.get('/', cache, getStats);

export default router;
