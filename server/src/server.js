/**
 * Server Entry Point
 * 
 * Loads environment variables and starts the Express server.
 */

import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`

   Status:  Running                                       
   Port:    ${PORT}                                       
   Mode:    ${process.env.NODE_ENV || 'development'}      
   Health:  http://localhost:${PORT}/api/health           
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
