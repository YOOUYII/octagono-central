require('dotenv').config();
const path = require('path');
const gateway = require('express-gateway');

const PORT = process.env.PORT || 8000;

console.log(`Starting API Gateway on port ${PORT}...`);
console.log(`[Gateway] Registered Services URLs:`);
console.log(` - Auth:        ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001 (DEFAULT)'}`);
console.log(` - Fighters:    ${process.env.FIGHTERS_SERVICE_URL || 'http://localhost:3002 (DEFAULT)'}`);
console.log(` - Events:      ${process.env.EVENTS_SERVICE_URL || 'http://localhost:3003 (DEFAULT)'}`);
console.log(` - News:        ${process.env.NEWS_SERVICE_URL || 'http://localhost:3004 (DEFAULT)'}`);
console.log(` - Predictions: ${process.env.PREDICTIONS_SERVICE_URL || 'http://localhost:3005 (DEFAULT)'}`);
console.log('-------------------------------------------');

gateway()
  .load(path.join(__dirname, ''))
  .run();
