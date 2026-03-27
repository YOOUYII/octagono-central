require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use('/api/news', require('./src/routes/news.routes'));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`News Service running on port ${PORT}`);
});
