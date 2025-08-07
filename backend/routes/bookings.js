const express = require('express');
const { 
  createBooking, 
  getAllBookings, 
  deleteBooking, 
  getBookingStats,
  getAvailableSpots 
} = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Crea nuova prenotazione (pubblico)
router.post('/', bookingLimiter, validateBooking, createBooking);

// Ottieni posti disponibili (pubblico)
router.get('/available-spots', async (req, res) => {
  try {
    const spots = await getAvailableSpots();
    res.json({ availableSpots: spots });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Route protette (solo admin)
router.use(authenticateToken);

// Ottieni tutte le prenotazioni
router.get('/', getAllBookings);

// Ottieni statistiche
router.get('/stats', getBookingStats);

// Elimina prenotazione
router.delete('/:id', deleteBooking);

// Aggiorna stato pagamento
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Stato pagamento non valido' });
    }

    const { pool } = require('../config/database');
    
    const result = await pool.query(
      'UPDATE bookings SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prenotazione non trovata' });
    }

    res.json({ success: true, message: 'Stato pagamento aggiornato' });

  } catch (error) {
    console.error('Errore aggiornamento pagamento:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;