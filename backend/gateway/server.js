require('dotenv').config();
const path = require('path');
const gateway = require('express-gateway');

const PORT = process.env.PORT || 8000;

console.log(`Starting API Gateway on port ${PORT}...`);
console.log(`Microservices URLs registered:`);
console.log(`- Auth: ${process.env.AUTH_SERVICE_URL}`);
console.log(`- Fighters: ${process.env.FIGHTERS_SERVICE_URL}`);

gateway()
  .load(path.join(__dirname, ''))
  .run();
