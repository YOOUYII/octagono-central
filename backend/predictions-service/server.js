require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use('/api/predictions', require('./src/routes/predictions.routes'));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Predictions Service running on port ${PORT}`);
});
