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
    const { db } = require('../config/database');

    // Ottieni prossimo sort_order
    const maxOrder = await new Promise((resolve, reject) => {
      db.get('SELECT MAX(sort_order) as max_order FROM pizza_menu', (err, row) => {
        if (err) reject(err);
        else resolve(row.max_order || 0);
      });
    });

    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO pizza_menu (name, description, price, emoji, sort_order) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, emoji, maxOrder + 1],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({ 
      success: true, 
      id: result.id, 
      message: 'Pizza aggiunta al menu' 
    });

  } catch (error) {
    console.error('Errore aggiunta pizza:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Aggiungi singolo fritto
router.post('/fritti', validateMenuItem, async (req, res) => {
  try {
    const { name, description, price, emoji } = req.body;
    const { db } = require('../config/database');

    const maxOrder = await new Promise((resolve, reject) => {
      db.get('SELECT MAX(sort_order) as max_order FROM fritti_menu', (err, row) => {
        if (err) reject(err);
        else resolve(row.max_order || 0);
      });
    });

    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO fritti_menu (name, description, price, emoji, sort_order) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, emoji, maxOrder + 1],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({ 
      success: true, 
      id: result.id, 
      message: 'Fritto aggiunto al menu' 
    });

  } catch (error) {
    console.error('Errore aggiunta fritto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;