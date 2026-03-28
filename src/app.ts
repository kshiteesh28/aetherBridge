import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import eventRouter from './api/routes/event';
import path from 'path';
import { AppError } from './shared/error';

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1', eventRouter);

// Secure proxy route for Gemini API
app.post('/api/v1/live-evaluate', async (req, res) => {
  try {
    const { liveText } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: { message: "GEMINI_API_KEY server environment variable is missing!" } });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { 
          parts: [{ text: 'You are an emergency response AI called AetherBridge. An operator is typing a chaotic emergency report. Analyze the text, categorize the intent, assess confidence, and provide an array of specific life-saving recommended_actions. IMPORTANT: ALWAYS output raw JSON only, no formatting. Format: {"intent": "TEXT_OBSERVATION", "confidence": 0.95, "entities": {"transcript": "text", "urgency": "HIGH", "recommended_actions": ["Action 1"]}}.' }] 
        },
        contents: [{ role: 'user', parts: [{ text: liveText }] }]
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// SERVE FRONTEND (Cloud Run Deployment)
app.use(express.static(path.join(__dirname, '../../frontend-dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../frontend-dist/index.html'));
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.errorCode,
      message: err.message,
      details: err.details
    });
    return;
  }
  
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
});

export default app;
