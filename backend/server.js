console.log('DEBUG (server.js): process.env.DATABASE_URL at start:', process.env.DATABASE_URL);
// const app = require('./app');
// const { initializeDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Inizializza il database
// initializeDatabase()
//   .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend: http://localhost:3001`);
      console.log(`🔧 API: http://localhost:${PORT}/api`);
    });
//   })
//   .catch(err => {
//     console.error('❌ Failed to initialize database:', err);
//     process.exit(1);
//   });

// Per testare solo l'avvio del server senza app o db
console.log('Server is attempting to start with minimal setup.');
// app.listen(PORT, () => {
//   console.log(`Minimal server running on port ${PORT}`);
// });