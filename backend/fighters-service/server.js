require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use('/api/fighters', require('./src/routes/fighters.routes'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Fighters Service running on port ${PORT}`);
});
