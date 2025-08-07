const { pool } = require('../config/database');

const calculateTotalPrice = async (individualOrders, guests = 0) => {
  if (!individualOrders || !Array.isArray(individualOrders)) {
    return guests * 3; // Solo quota bagnina se non ci sono ordini
  }

  const [pizzaResult, frittiResult] = await Promise.all([
    pool.query('SELECT * FROM pizza_menu WHERE active = TRUE'),
    pool.query('SELECT * FROM fritti_menu WHERE active = TRUE')
  ]);

  const pizzaMenu = pizzaResult.rows;
  const frittiMenu = frittiResult.rows;

  let total = 0;

  individualOrders.forEach(order => {
    if (order.selectedPizzas && Array.isArray(order.selectedPizzas)) {
      order.selectedPizzas.forEach(pizza => {
        const menuItem = pizzaMenu.find(p => p.id === pizza.item.id || p.name === pizza.item.name);
        if (menuItem) {
          let pizzaPrice = menuItem.price;
          
          if (order.pizzaVariants && order.pizzaVariants[pizza.index]) {
            if (order.pizzaVariants[pizza.index].noGluten) pizzaPrice += 2;
            if (order.pizzaVariants[pizza.index].noLactose) pizzaPrice += 1.5;
          }
          
          total += pizzaPrice;
        }
      });
    }

    if (order.selectedFritti && Array.isArray(order.selectedFritti)) {
      order.selectedFritti.forEach(fritto => {
        const menuItem = frittiMenu.find(f => f.id === fritto.item.id || f.name === fritto.item.name);
        if (menuItem) {
          total += menuItem.price;
        }
      });
    }
  });

  const quotaBagnina = guests * 3;
  total += quotaBagnina;

  return total;
};

const isBookingDeadlinePassed = () => {
  const deadline = new Date(process.env.BOOKING_DEADLINE || '2025-08-10');
  const now = new Date();
  return now > deadline;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>"'&]/g, '');
};

module.exports = {
  calculateTotalPrice,
  isBookingDeadlinePassed,
  formatDate,
  validateEmail,
  sanitizeInput
};