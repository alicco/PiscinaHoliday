const jwt = require('jsonwebtoken');
const { verifyAdminPassword } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password richiesta' });
    }

    const isValid = await verifyAdminPassword(password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Password non corretta' });
    }

    const token = jwt.sign(
      { 
        role: 'admin',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const verifyToken = (req, res) => {
  // Se arriviamo qui, il token è valido (grazie al middleware)
  res.json({ 
    valid: true, 
    user: req.user 
  });
};

module.exports = {
  login,
  verifyToken
};