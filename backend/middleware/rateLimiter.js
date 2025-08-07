const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // massimo 100 richieste per IP
  message: {
    error: 'Troppe richieste da questo IP, riprova tra 15 minuti'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // massimo 5 prenotazioni per IP per ora
  message: {
    error: 'Troppe prenotazioni da questo IP, riprova tra 1 ora'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // massimo 5 tentativi di login
  message: {
    error: 'Troppi tentativi di login, riprova tra 15 minuti'
  }
});

module.exports = {
  generalLimiter,
  bookingLimiter,
  authLimiter
};