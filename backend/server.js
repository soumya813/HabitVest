const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount routers
app.use('/api/v1/habits', require('./routes/habits'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/tasks', require('./routes/tasks'));
app.use('/api/v1/stocks', require('./routes/stocks'));
app.use('/api/v1/rewards', require('./routes/rewards'));
app.use('/api/v1/auth', require('./routes/auth'));

// Mount nested routes
app.use('/api/v1/users/:userId/tasks', require('./routes/tasks'));
app.use('/api/v1/users/:userId/rewards', require('./routes/rewards'));

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
