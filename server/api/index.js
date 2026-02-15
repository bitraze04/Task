/**
 * Vercel Serverless Entry Point
 * 
 * Exports the Express app for Vercel's serverless function runtime.
 * This file stays minimal as it just bridges Vercel to our existing app.
 */

import app from '../src/app.js';

export default app;
