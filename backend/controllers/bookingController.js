const { pool } = require('../config/database');
const { sendBookingConfirmation } = require('../utils/emailTemplates');
const { calculateTotalPrice, isBookingDeadlinePassed } = require('../utils/helpers');

const createBooking = async (req, res) => {
  try {
    if (isBookingDeadlinePassed()) {
      return res.status(400).json({ 
        error: 'Scadenza prenotazioni superata' 
      });
    }

    const { name, guests, individualOrders, tableType, totalPrice } = req.body;
    
    const availableSpots = await getAvailableSpots();
    if (tableType === 'pool' && guests > availableSpots) {
      return res.status(400).json({ 
        error: `Solo ${availableSpots} posti disponibili con tavoli condominiali` 
      });
    }

    const calculatedPrice = await calculateTotalPrice(individualOrders, guests);
    if (Math.abs(calculatedPrice - totalPrice) > 0.01) {
      return res.status(400).json({ 
        error: 'Errore nel calcolo del prezzo totale' 
      });
    }

    const result = await pool.query(
      `INSERT INTO bookings (name, guests, individual_orders, table_type, total_price)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        name,
        guests, 
        JSON.stringify(individualOrders),
        tableType,
        totalPrice
      ]
    );

    res.json({
      success: true,
      message: 'Prenotazione creata con successo',
      booking: {
        id: result.rows[0].id,
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
    const result = await pool.query(
      `SELECT id, name, email, phone, guests, individual_orders, 
              table_type, total_price, payment_status, booking_date
       FROM bookings 
       ORDER BY booking_date DESC`
    );
    const bookings = result.rows;

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

    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
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
    const result = await pool.query(
      `SELECT 
          COUNT(*) as total_bookings,
          SUM(guests) as total_participants,
          SUM(total_price) as total_revenue,
          AVG(total_price) as avg_booking_value
       FROM bookings`
    );
    const stats = result.rows[0];

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
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(guests), 0) as used_spots 
       FROM bookings 
       WHERE table_type = 'pool'`
    );
    const row = result.rows[0];

    const maxSpots = parseInt(process.env.MAX_SPOTS) || 40;
    const availableSpots = Math.max(0, maxSpots - (row.used_spots || 0));
    return availableSpots;
  } catch (error) {
    console.error('Errore nel recupero posti disponibili:', error);
    throw error;
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  deleteBooking,
  getBookingStats,
  getAvailableSpots
};