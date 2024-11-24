import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import webhookRoutes from './routes/webhook.js';
import templateRoutes from './routes/templates.js';
import conversationRoutes from './routes/conversations.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';

config();

const app = express();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', authenticate, leadRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/templates', authenticate, templateRoutes);
app.use('/api/conversations', authenticate, conversationRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});