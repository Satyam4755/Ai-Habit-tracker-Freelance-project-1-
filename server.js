const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Web Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect Database
connectDB();

app.set('trust proxy', 1);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.JWT_SECRET || 'atlas_super_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Base Route
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/habits', habitRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found', path: req.path });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
