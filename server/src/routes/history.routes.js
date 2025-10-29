import express from 'express';
import { verifyAccess } from '../middleware/auth.js';
import { getHistory } from '../controllers/history.controller.js';

const router = express.Router();

// GET /api/history?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', verifyAccess, getHistory); // tested and working

export default router;
