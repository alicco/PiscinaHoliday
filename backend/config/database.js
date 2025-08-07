const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || '/tmp/festa_piscina.db';
const dbDir = path.dirname(dbPath);

// Crea la directory del database se non esiste
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabella utenti admin
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabella prenotazioni (CORRETTA)
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          guests INTEGER NOT NULL,
          individual_orders TEXT NOT NULL,
          table_type TEXT NOT NULL,
          total_price REAL NOT NULL,
          payment_status TEXT DEFAULT 'pending',
          booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabella menu pizze
      db.run(`
        CREATE TABLE IF NOT EXISTS pizza_menu (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          emoji TEXT,
          active BOOLEAN DEFAULT 1,
          sort_order INTEGER DEFAULT 0
        )
      `);

      // Tabella menu fritti
      db.run(`
        CREATE TABLE IF NOT EXISTS fritti_menu (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          emoji TEXT,
          active BOOLEAN DEFAULT 1,
          sort_order INTEGER DEFAULT 0
        )
      `);

      // Inserisci menu di default
      insertDefaultMenu();
      
      console.log('✅ Database initialized successfully');
      resolve();
    });
  });
};

const insertDefaultMenu = () => {
  // Menu pizze di default
  const defaultPizzas = [
    { name: "Focaccia", description: "Sale, olio e rosmarino", price: 6, emoji: "🫓" },
    { name: "Margherita", description: "Pomodoro, mozzarella, basilico", price: 8, emoji: "🔴" },
    { name: "Napoli", description: "Pomodoro, alici e mozzarella", price: 8, emoji: "🐟" },
    { name: "Diavola", description: "Pomodoro, mozzarella, salame piccante", price: 10, emoji: "🌶️" },
    { name: "Capricciosa", description: "Pomodoro, mozzarella, prosciutto, funghi, uovo, olive, carciofini", price: 10, emoji: "🎭" },
    { name: "Fiori e Alici", description: "Fiori di zucca, alici e mozzarella", price: 10, emoji: "🌻" },
    { name: "Pizza Veggie", description: "Pomodori, peperoni, melanzane, zucchine", price: 10, emoji: "🥬" },
    { name: "Boscaiola Bianca", description: "Funghi, salsiccia e mozzarella", price: 10, emoji: "🍄" },
    { name: "La Pier", description: "Crudo, bufala, rucola e pachino", price: 10, emoji: "🥩" },
    { name: "Wrustel e Patatine", description: "Bianca wrustel e patatine fritte", price: 10, emoji: "🌭" }
  ];

  // Menu fritti di default
  const defaultFritti = [
    { name: "Mini Supplì", description: "Deliziosi supplì al telefono", price: 5, emoji: "🧀" },
    { name: "Olive Ascolane", description: "Olive ripiene impanate e fritte", price: 5, emoji: "🫒" },
    { name: "Mozzarelline", description: "Mozzarelline impanate e fritte", price: 5, emoji: "🧈" },
    { name: "Nuggets Pollo", description: "Bocconcini di pollo impanati", price: 5, emoji: "🍗" }
  ];

  // Inserisci solo se le tabelle sono vuote
  db.get("SELECT COUNT(*) as count FROM pizza_menu", (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare("INSERT INTO pizza_menu (name, description, price, emoji, sort_order) VALUES (?, ?, ?, ?, ?)");
      defaultPizzas.forEach((pizza, index) => {
        stmt.run(pizza.name, pizza.description, pizza.price, pizza.emoji, index);
      });
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as count FROM fritti_menu", (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare("INSERT INTO fritti_menu (name, description, price, emoji, sort_order) VALUES (?, ?, ?, ?, ?)");
      defaultFritti.forEach((fritto, index) => {
        stmt.run(fritto.name, fritto.description, fritto.price, fritto.emoji, index);
      });
      stmt.finalize();
    }
  });
};

module.exports = { db, initializeDatabase };