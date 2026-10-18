const app = require('./app');
const config = require('./config');
const { getDb } = require('./db/connection');
const { initSchema } = require('./db/schema');
const { seedDatabase } = require('./db/seed');

// Initialize database schema and demo seeds on startup
const db = getDb();
initSchema(db);
seedDatabase(db);

const server = app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(`LuxeMart E-Commerce Server running!`);
  console.log(`Port: ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Database: ${config.dbPath}`);
  console.log(`=========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
