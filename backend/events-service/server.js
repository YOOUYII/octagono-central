require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/events', require('./src/routes/events.routes'));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Events Service running on port ${PORT}`);
});
