const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crops');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Default UPI Configuration
app.get('/api/upi-config', (req, res) => {
  res.json({
    upiId: 'shivanakkanagoni17@okaxis',
    message: 'Default UPI ID for payments'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
