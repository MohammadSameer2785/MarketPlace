import express from 'express';
import { chatWithAI, getFertilizerAdvice } from '../controllers/ai.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

// Chat with Bujji AI assistant
router.post('/chat',
  [
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  protectRoute,
  chatWithAI
);

// Get fertilizer recommendations
router.post('/fertilizer',
  [
    body('cropName').trim().notEmpty().withMessage('Crop name is required'),
    body('soilType').optional().trim(),
    body('region').optional().trim()
  ],
  protectRoute,
  getFertilizerAdvice
);

export default router;
