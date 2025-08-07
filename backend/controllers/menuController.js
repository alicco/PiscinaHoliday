const { pool } = require('../config/database');

const getPizzaMenu = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, emoji, active, sort_order
       FROM pizza_menu 
       WHERE active = TRUE 
       ORDER BY sort_order, id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero menu pizze:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const getFrittiMenu = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, emoji, active, sort_order
       FROM fritti_menu 
       WHERE active = TRUE 
       ORDER BY sort_order, id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero menu fritti:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const getFullMenu = async (req, res) => {
  try {
    const [pizzaResult, frittiResult] = await Promise.all([
      pool.query('SELECT * FROM pizza_menu WHERE active = TRUE ORDER BY sort_order, id'),
      pool.query('SELECT * FROM fritti_menu WHERE active = TRUE ORDER BY sort_order, id')
    ]);

    res.json({ pizzas: pizzaResult.rows, fritti: frittiResult.rows });
  } catch (error) {
    console.error('Errore recupero menu completo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const updatePizzaMenu = async (req, res) => {
  const client = await pool.connect();
  try {
    const { pizzas } = req.body;

    if (!Array.isArray(pizzas)) {
      return res.status(400).json({ error: 'Menu pizze deve essere un array' });
    }

    await client.query('BEGIN');

    await client.query('UPDATE pizza_menu SET active = FALSE');

    for (let i = 0; i < pizzas.length; i++) {
      const pizza = pizzas[i];
      await client.query(
        `INSERT INTO pizza_menu (id, name, description, price, emoji, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, TRUE, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           emoji = EXCLUDED.emoji,
           active = EXCLUDED.active,
           sort_order = EXCLUDED.sort_order`,
        [pizza.id || null, pizza.name, pizza.description, pizza.price, pizza.emoji, i]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Menu pizze aggiornato' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore aggiornamento menu pizze:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  } finally {
    client.release();
  }
};

const updateFrittiMenu = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fritti } = req.body;

    if (!Array.isArray(fritti)) {
      return res.status(400).json({ error: 'Menu fritti deve essere un array' });
    }

    await client.query('BEGIN');

    await client.query('UPDATE fritti_menu SET active = FALSE');

    for (let i = 0; i < fritti.length; i++) {
      const fritto = fritti[i];
      await client.query(
        `INSERT INTO fritti_menu (id, name, description, price, emoji, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, TRUE, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           emoji = EXCLUDED.emoji,
           active = EXCLUDED.active,
           sort_order = EXCLUDED.sort_order`,
        [fritto.id || null, fritto.name, fritto.description, fritto.price, fritto.emoji, i]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Menu fritti aggiornato' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore aggiornamento menu fritti:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  } finally {
    client.release();
  }
};

module.exports = {
  getPizzaMenu,
  getFrittiMenu,
  getFullMenu,
  updatePizzaMenu,
  updateFrittiMenu
};