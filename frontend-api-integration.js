const API_BASE_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('adminToken');

// Funzioni API
const api = {
  // Autenticazione
  async login(password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (data.token) {
      authToken = data.token;
      localStorage.setItem('adminToken', authToken);
    }
    return data;
  },

  // Prenotazioni
  async createBooking(bookingData) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return await response.json();
  },

  async getAvailableSpots() {
    const response = await fetch(`${API_BASE_URL}/bookings/available-spots`);
    return await response.json();
  },

  async getBookings() {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    return await response.json();
  },

  // Aggiungi questa funzione se non esiste già
  async getBookingStats() {
    const response = await fetch(`${API_BASE_URL}/bookings/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  },

  // Menu
  async getMenu() {
    const response = await fetch(`${API_BASE_URL}/menu/full`);
    return await response.json();
  },

  async updateMenu(pizzas, fritti) {
    await fetch(`${API_BASE_URL}/menu/pizzas`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ pizzas })
    });
    
    await fetch(`${API_BASE_URL}/menu/fritti`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fritti })
    });
  }
};