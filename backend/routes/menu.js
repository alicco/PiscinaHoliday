const express = require('express');
const { 
  getPizzaMenu, 
  getFrittiMenu, 
  getFullMenu, 
  updatePizzaMenu, 
  updateFrittiMenu 
} = require('../controllers/menuController');
const { authenticateToken } = require('../middleware/auth');
const { validateMenuItem } = require('../middleware/validation');

const router = express.Router();

// Route pubbliche
router.get('/pizzas', getPizzaMenu);
router.get('/fritti', getFrittiMenu);
router.get('/full', getFullMenu);

// Route protette (solo admin)
router.use(authenticateToken);

// Aggiorna menu pizze
router.put('/pizzas', updatePizzaMenu);

// Aggiorna menu fritti
router.put('/fritti', updateFrittiMenu);

// Aggiungi singola pizza
router.post('/pizzas', validateMenuItem, async (req, res) => {
  try {
    const { name, description, price, emoji } = req.body;
    const { pool } = require('../config/database');

    const maxOrderResult = await pool.query('SELECT MAX(sort_order) as max_order FROM pizza_menu');
    const maxOrder = maxOrderResult.rows[0].max_order || 0;

    const result = await pool.query(
      'INSERT INTO pizza_menu (name, description, price, emoji, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, description, price, emoji, maxOrder + 1]
    );

    res.status(201).json({ 
      success: true, 
      id: result.rows[0].id, 
      message: 'Pizza aggiunta al menu' 
    });

  } catch (error) {
    console.error('Errore aggiunta pizza:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/fritti', validateMenuItem, async (req, res) => {
  try {
    const { name, description, price, emoji } = req.body;
    const { pool } = require('../config/database');

    const maxOrderResult = await pool.query('SELECT MAX(sort_order) as max_order FROM fritti_menu');
    const maxOrder = maxOrderResult.rows[0].max_order || 0;

    const result = await pool.query(
      'INSERT INTO fritti_menu (name, description, price, emoji, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, description, price, emoji, maxOrder + 1]
    );

    res.status(201).json({ 
      success: true, 
      id: result.rows[0].id, 
      message: 'Fritto aggiunto al menu' 
    });

  } catch (error) {
    console.error('Errore aggiunta fritto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;