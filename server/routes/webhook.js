import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validateWebhook } from '../middleware/validateWebhook.js';
import { processYelpLead } from '../services/leadProcessor.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/yelp', validateWebhook, async (req, res) => {
  try {
    const { businessId, customerData } = req.body;

    const lead = await processYelpLead(businessId, customerData);
    
    res.status(201).json(lead);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router;