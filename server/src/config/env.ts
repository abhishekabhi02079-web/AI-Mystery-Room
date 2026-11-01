import dotenv from 'dotenv';
import path from 'node:path';

// Load .env if present
dotenv.config();

export interface IEnvConfig {
  PORT: number;
  NODE_ENV: string;
  CLIENT_URL: string;
  MONGODB_URI: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
}

const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mystery-room';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

if (!GEMINI_API_KEY && NODE_ENV !== 'test') {
  console.warn(
    '[CONFIG WARNING] GEMINI_API_KEY is not defined in the environment. ' +
    'The mystery generation service will fall back to dynamic procedural mystery templates for local testing.'
  );
}

export const env: IEnvConfig = {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  MONGODB_URI,
  GEMINI_API_KEY,
  GEMINI_MODEL,
};
