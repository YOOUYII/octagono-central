require('dotenv').config();
const path = require('path');
const gateway = require('express-gateway');

const PORT = process.env.PORT || 8000;

// Configurar valores por defecto para los microservicios si no están en env
process.env.AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
process.env.FIGHTERS_SERVICE_URL = process.env.FIGHTERS_SERVICE_URL || 'http://localhost:3002';
process.env.EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL || 'http://localhost:3003';
process.env.NEWS_SERVICE_URL = process.env.NEWS_SERVICE_URL || 'http://localhost:3004';
process.env.PREDICTIONS_SERVICE_URL = process.env.PREDICTIONS_SERVICE_URL || 'http://localhost:3005';

console.log(`Starting API Gateway on port ${PORT}...`);
console.log(`Microservices URLs registered:`);
console.log(`- Auth: ${process.env.AUTH_SERVICE_URL}`);
console.log(`- Fighters: ${process.env.FIGHTERS_SERVICE_URL}`);
console.log(`- Events: ${process.env.EVENTS_SERVICE_URL}`);
console.log(`- News: ${process.env.NEWS_SERVICE_URL}`);
console.log(`- Predictions: ${process.env.PREDICTIONS_SERVICE_URL}`);

gateway()
  .load(path.join(__dirname, ''))
  .run();
