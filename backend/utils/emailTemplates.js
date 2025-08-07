const { sendEmail } = require('../config/email');

const sendBookingConfirmation = async (bookingData) => {
  const { name, email, guests, individualOrders, tableType, totalPrice, bookingId } = bookingData;

  let ordersHtml = '';
  if (individualOrders && individualOrders.length > 0) {
    ordersHtml = '<h3>🍽️ I tuoi ordini:</h3>';
    
    individualOrders.forEach((order, index) => {
      ordersHtml += `<h4>Partecipante ${index + 1}:</h4><ul>`;
      
      // Pizze
      if (order.selectedPizzas && order.selectedPizzas.length > 0) {
        order.selectedPizzas.forEach(pizza => {
          let price = pizza.item.price;
          let pizzaText = `🍕 ${pizza.item.name}`;
          
          if (order.pizzaVariants && order.pizzaVariants[pizza.index]) {
            let variants = [];
            if (order.pizzaVariants[pizza.index].noGluten) {
              price += 2;
              variants.push('senza glutine');
            }
            if (order.pizzaVariants[pizza.index].noLactose) {
              price += 1.5;
              variants.push('senza lattosio');
            }
            if (variants.length > 0) {
              pizzaText += ` (${variants.join(', ')})`;
            }
          }
          
          ordersHtml += `<li>${pizzaText} - €${price.toFixed(2)}</li>`;
        });
      }
      
      // Fritti
      if (order.selectedFritti && order.selectedFritti.length > 0) {
        order.selectedFritti.forEach(fritto => {
          ordersHtml += `<li>🍟 ${fritto.item.name} - €${fritto.item.price.toFixed(2)}</li>`;
        });
      }
      
      ordersHtml += '</ul>';
    });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #00cec9 0%, #00b894 100%); color: white; padding: 30px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1>🏊‍♀️ FESTA IN PISCINA 🍕</h1>
        <h2>Prenotazione Confermata!</h2>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h3>Ciao ${name}! 👋</h3>
        <p>La tua prenotazione per la festa in piscina è stata confermata con successo!</p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>📋 Dettagli Prenotazione</h3>
          <p><strong>📅 Data:</strong> Lunedì 12 Agosto 2025</p>
          <p><strong>🕒 Orario:</strong> 20:00 - 23:00</p>
          <p><strong>📍 Luogo:</strong> Piscina Condominiale Holiday, Montalto di Castro (VT)</p>
          <p><strong>👥 Partecipanti:</strong> ${guests} ${guests === 1 ? 'persona' : 'persone'}</p>
          <p><strong>🪑 Tavolo:</strong> ${tableType === 'pool' ? 'Condominiale (incluso)' : 'Personale (gratis)'}</p>
          <p><strong>🆔 Codice Prenotazione:</strong> #${bookingId}</p>
        </div>
        
        ${ordersHtml}
        
        <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #ff9800;">
          <h3>💰 Totale da Pagare: €${totalPrice.toFixed(2)}</h3>
          <p><strong>⚠️ IMPORTANTE:</strong></p>
          <ul>
            <li>Il totale include €3 per partecipante come quota bagnina</li>
            <li>Porta €${totalPrice.toFixed(2)} in contanti alla bagnina <strong>ENTRO IL 10 AGOSTO</strong></li>
            <li>Conserva questa email e portala alla festa per l'ingresso</li>
            <li>Senza pagamento anticipato non sarà possibile partecipare</li>
            <li>Non si accettano modifiche agli ordini dopo la conferma</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666;">Ci vediamo alla festa! 🏊‍♀️🍕✨</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">Questa è una email automatica, non rispondere a questo messaggio.</p>
        </div>
      </div>
    </div>
  `;

  const textContent = `
FESTA IN PISCINA - PRENOTAZIONE CONFERMATA

Ciao ${name}!
La tua prenotazione è stata confermata.

Dettagli:
- Data: Lunedì 12 Agosto 2025
- Orario: 20:00 - 23:00
- Partecipanti: ${guests}
- Totale: €${totalPrice.toFixed(2)}
- Codice: #${bookingId}

IMPORTANTE: Porta €${totalPrice.toFixed(2)} alla bagnina entro il 10 agosto.

Ci vediamo alla festa!
  `;

  await sendEmail({
    to: email,
    subject: '🏊‍♀️ Prenotazione Confermata - Festa in Piscina',
    html,
    text: textContent
  });
};

const sendAdminNotification = async (bookingData) => {
  const { name, email, guests, totalPrice, bookingId } = bookingData;
  
  const html = `
    <h2>🔔 Nuova Prenotazione Ricevuta</h2>
    <p><strong>Nome:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Partecipanti:</strong> ${guests}</p>
    <p><strong>Totale:</strong> €${totalPrice.toFixed(2)}</p>
    <p><strong>Codice:</strong> #${bookingId}</p>
    <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
  `;

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🔔 Nuova Prenotazione #${bookingId} - ${name}`,
      html
    });
  }
};

module.exports = {
  sendBookingConfirmation,
  sendAdminNotification
};