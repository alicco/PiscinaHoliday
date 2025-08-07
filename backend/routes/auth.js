const express = require('express');
const { login, verifyToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Login admin
router.post('/login', 
  authLimiter,
  [
    body('password')
      .notEmpty()
      .withMessage('Password richiesta'),
    handleValidationErrors
  ],
  login
);

// Verifica token
router.get('/verify', authenticateToken, verifyToken);

// Logout (lato client)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout effettuato' });
});

module.exports = router;