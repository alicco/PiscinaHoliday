const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateBooking = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve essere tra 2 e 100 caratteri'),
  body('guests')
    .isInt({ min: 1, max: 8 })
    .withMessage('Numero ospiti deve essere tra 1 e 8'),
  body('individualOrders')
    .isArray()
    .withMessage('Ordini individuali devono essere un array'),
  body('tableType')
    .isIn(['pool', 'personal'])
    .withMessage('Tipo tavolo non valido'),
  body('totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Prezzo totale non valido'),
  handleValidationErrors
];

const validateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome richiesto (max 100 caratteri)'),
  body('description')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrizione troppo lunga (max 500 caratteri)'),
  body('price')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Prezzo deve essere tra 0 e 100 euro'),
  body('emoji')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Emoji troppo lunga'),
  handleValidationErrors
];

module.exports = {
  validateBooking,
  validateMenuItem,
  handleValidationErrors
};