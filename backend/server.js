console.log('Minimal Server starting...');
const app = require('./app');

module.exports = (req, res) => {
  console.log('Request received by minimal server.');
  app(req, res);
};