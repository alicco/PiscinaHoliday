console.log('Server starting...');
const app = require('./app');
const { initializeDatabase } = require('./config/database');

// Inizializza il database una volta all'avvio della funzione serverless
let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      console.log('Initializing database for serverless function...');
      await initializeDatabase();
      isInitialized = true;
      console.log('Database initialized for serverless function.');
    } catch (err) {
      console.error('❌ Failed to initialize database in serverless function:', err);
      // Non uscire dal processo, ma invia un errore al client
      res.status(500).send('Server initialization failed.');
      return;
    }
  }
  // Passa la richiesta all'app Express
  app(req, res);
};