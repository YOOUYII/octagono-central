require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Logger simple para ver las peticiones que llegan
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth/admin', require('./src/routes/admin.routes'));
app.use('/api/auth/biometric', require('./src/routes/biometric.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
