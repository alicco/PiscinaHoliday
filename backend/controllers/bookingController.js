const { db } = require('../config/database');
const { sendBookingConfirmation } = require('../utils/emailTemplates');
const { calculateTotalPrice, isBookingDeadlinePassed } = require('../utils/helpers');

// Correggi la sezione createBooking (circa riga 15-45):
const createBooking = async (req, res) => {
  try {
    // Verifica scadenza
    if (isBookingDeadlinePassed()) {
      return res.status(400).json({ 
        error: 'Scadenza prenotazioni superata' 
      });
    }

    // Estrai i dati dal body (senza email e phone)
    const { name, guests, individualOrders, tableType, totalPrice } = req.body;
    
    // Verifica posti disponibili
    const availableSpots = await getAvailableSpots();
    if (tableType === 'pool' && guests > availableSpots) {
      return res.status(400).json({ 
        error: `Solo ${availableSpots} posti disponibili con tavoli condominiali` 
      });
    }

    // Verifica calcolo prezzo
    const calculatedPrice = await calculateTotalPrice(individualOrders, guests);
    if (Math.abs(calculatedPrice - totalPrice) > 0.01) {
      return res.status(400).json({ 
        error: 'Errore nel calcolo del prezzo totale' 
      });
    }

    // Inserisci prenotazione (QUERY CORRETTA)
    const stmt = db.prepare(`
      INSERT INTO bookings (name, guests, individual_orders, table_type, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      name,
      guests, 
      JSON.stringify(individualOrders),
      tableType,
      totalPrice
    );

    // Risposta di successo
    res.json({
      success: true,
      message: 'Prenotazione creata con successo',
      booking: {
        id: result.lastInsertRowid,
        name,
        guests,
        individualOrders,
        tableType,
        totalPrice,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Errore creazione prenotazione:', error);
    res.status(500).json({ 
      error: 'Errore interno del server' 
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, email, phone, guests, individual_orders, 
               table_type, total_price, payment_status, booking_date
        FROM bookings 
        ORDER BY booking_date DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Parse JSON fields
    const parsedBookings = bookings.map(booking => ({
      ...booking,
      individual_orders: JSON.parse(booking.individual_orders || '[]')
    }));

    res.json(parsedBookings);

  } catch (error) {
    console.error('Errore recupero prenotazioni:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Prenotazione non trovata' });
    }

    res.json({ success: true, message: 'Prenotazione eliminata' });

  } catch (error) {
    console.error('Errore eliminazione prenotazione:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const getBookingStats = async (req, res) => {
  try {
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_bookings,
          SUM(guests) as total_participants,
          SUM(total_price) as total_revenue,
          AVG(total_price) as avg_booking_value
        FROM bookings
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const availableSpots = await getAvailableSpots();
    
    res.json({
      ...stats,
      available_spots: availableSpots,
      max_spots: parseInt(process.env.MAX_SPOTS) || 40,
      booking_deadline: process.env.BOOKING_DEADLINE,
      deadline_passed: isBookingDeadlinePassed()
    });

  } catch (error) {
    console.error('Errore statistiche:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

const getAvailableSpots = async () => {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT COALESCE(SUM(guests), 0) as used_spots 
      FROM bookings 
      WHERE table_type = 'pool'
    `, (err, row) => {
      if (err) reject(err);
      else {
        const maxSpots = parseInt(process.env.MAX_SPOTS) || 40;
        const availableSpots = Math.max(0, maxSpots - (row.used_spots || 0));
        resolve(availableSpots);
      }
    });
  });
};

module.exports = {
  createBooking,
  getAllBookings,
  deleteBooking,
  getBookingStats,
  getAvailableSpots
};