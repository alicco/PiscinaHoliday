const { Pool } = require('pg');

// DEBUG: Hardcoded connection parameters for testing
const pool = new Pool({
  user: 'postgres',
  host: 'db.btqthnnecgzkhlpdixdd.supabase.co',
  database: 'postgres',
  password: '4275142Ss.!',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // Necessario per Supabase su Vercel
  }
});

console.log('DEBUG: Pool created with hardcoded parameters.');

const initializeDatabase = async () => {
  console.log('Attempting to initialize database...');
  try {
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created/verified.');

    console.log('Creating bookings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        guests INTEGER NOT NULL,
        individual_orders TEXT NOT NULL,
        table_type TEXT NOT NULL,
        total_price REAL NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        booking_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Bookings table created/verified.');

    console.log('Creating pizza_menu table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pizza_menu (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        emoji TEXT,
        active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0
      )
    `);
    console.log('Pizza menu table created/verified.');

    console.log('Creating fritti_menu table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fritti_menu (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        emoji TEXT,
        active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0
      )
    `);
    console.log('Fritti menu table created/verified.');

    console.log('Inserting default menu items...');
    await insertDefaultMenu();
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    throw err; // Rilancia l'errore per gestirlo a livello superiore
  }
};

const insertDefaultMenu = async () => {
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

  const defaultFritti = [
    { name: "Mini Supplì", description: "Deliziosi supplì al telefono", price: 5, emoji: "🧀" },
    { name: "Olive Ascolane", description: "Olive ripiene impanate e fritte", price: 5, emoji: "🫒" },
    { name: "Mozzarelline", description: "Mozzarelline impanate e fritte", price: 5, emoji: "🧈" },
    { name: "Nuggets Pollo", description: "Bocconcini di pollo impanati", price: 5, emoji: "🍗" }
  ];

  try {
    const pizzaCount = await pool.query("SELECT COUNT(*) FROM pizza_menu");
    if (parseInt(pizzaCount.rows[0].count) === 0) {
      for (const [index, pizza] of defaultPizzas.entries()) {
        await pool.query("INSERT INTO pizza_menu (name, description, price, emoji, sort_order) VALUES ($1, $2, $3, $4, $5)", [pizza.name, pizza.description, pizza.price, pizza.emoji, index]);
      }
    }

    const frittiCount = await pool.query("SELECT COUNT(*) FROM fritti_menu");
    if (parseInt(frittiCount.rows[0].count) === 0) {
      for (const [index, fritto] of defaultFritti.entries()) {
        await pool.query("INSERT INTO fritti_menu (name, description, price, emoji, sort_order) VALUES ($1, $2, $3, $4, $5)", [fritto.name, fritto.description, fritto.price, fritto.emoji, index]);
      }
    }
  } catch (err) {
    console.error('❌ Error inserting default menu:', err);
    throw err;
  }
};

module.exports = { pool, initializeDatabase };