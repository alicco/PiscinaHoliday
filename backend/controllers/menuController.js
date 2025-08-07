const { db } = require('../config/database');

const getPizzaMenu = async (req, res) => {
  try {
    const pizzas = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, description, price, emoji, active, sort_order
        FROM pizza_menu 
        WHERE active = 1 
        ORDER BY sort_order, id
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(pizzas);
  } catch (error) {
    console.error('Errore recupero menu pizze:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const getFrittiMenu = async (req, res) => {
  try {
    const fritti = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, description, price, emoji, active, sort_order
        FROM fritti_menu 
        WHERE active = 1 
        ORDER BY sort_order, id
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(fritti);
  } catch (error) {
    console.error('Errore recupero menu fritti:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const getFullMenu = async (req, res) => {
  try {
    const [pizzas, fritti] = await Promise.all([
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM pizza_menu WHERE active = 1 ORDER BY sort_order, id', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM fritti_menu WHERE active = 1 ORDER BY sort_order, id', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      })
    ]);

    res.json({ pizzas, fritti });
  } catch (error) {
    console.error('Errore recupero menu completo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const updatePizzaMenu = async (req, res) => {
  try {
    const { pizzas } = req.body;

    if (!Array.isArray(pizzas)) {
      return res.status(400).json({ error: 'Menu pizze deve essere un array' });
    }

    // Inizia transazione
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // Disattiva tutti gli elementi esistenti
      await new Promise((resolve, reject) => {
        db.run('UPDATE pizza_menu SET active = 0', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Inserisci/aggiorna nuovi elementi
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO pizza_menu (id, name, description, price, emoji, active, sort_order)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `);

      for (let i = 0; i < pizzas.length; i++) {
        const pizza = pizzas[i];
        await new Promise((resolve, reject) => {
          stmt.run(
            pizza.id || null,
            pizza.name,
            pizza.description,
            pizza.price,
            pizza.emoji,
            i,
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      stmt.finalize();

      // Commit transazione
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ success: true, message: 'Menu pizze aggiornato' });

    } catch (error) {
      // Rollback in caso di errore
      await new Promise((resolve) => {
        db.run('ROLLBACK', () => resolve());
      });
      throw error;
    }

  } catch (error) {
    console.error('Errore aggiornamento menu pizze:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const updateFrittiMenu = async (req, res) => {
  try {
    const { fritti } = req.body;

    if (!Array.isArray(fritti)) {
      return res.status(400).json({ error: 'Menu fritti deve essere un array' });
    }

    // Logica simile a updatePizzaMenu ma per fritti_menu
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      await new Promise((resolve, reject) => {
        db.run('UPDATE fritti_menu SET active = 0', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO fritti_menu (id, name, description, price, emoji, active, sort_order)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `);

      for (let i = 0; i < fritti.length; i++) {
        const fritto = fritti[i];
        await new Promise((resolve, reject) => {
          stmt.run(
            fritto.id || null,
            fritto.name,
            fritto.description,
            fritto.price,
            fritto.emoji,
            i,
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      stmt.finalize();

      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ success: true, message: 'Menu fritti aggiornato' });

    } catch (error) {
      await new Promise((resolve) => {
        db.run('ROLLBACK', () => resolve());
      });
      throw error;
    }

  } catch (error) {
    console.error('Errore aggiornamento menu fritti:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

module.exports = {
  getPizzaMenu,
  getFrittiMenu,
  getFullMenu,
  updatePizzaMenu,
  updateFrittiMenu
};