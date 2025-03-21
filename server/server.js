require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); // Add this line
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Connect Database
connectDB();

// Add the connection listener AFTER connecting
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB database:', mongoose.connection.name);
});

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));

// Serve static files from the client
app.use(express.static(path.join(__dirname, '../client/public')));

// All other routes should redirect to the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));