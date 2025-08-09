require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Inizializza il database e avvia il server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Frontend: http://localhost:3001 (if running with 'npm run dev:full')`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to start server due to database initialization error:', err);
    process.exit(1);
  });