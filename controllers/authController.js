const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const getLogin = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
};

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        // Create JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        // Set Cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Server error during login.' });
    }
};

const getSignup = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/dashboard');
    }
    res.render('signup', { error: null });
};

const postSignup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.render('signup', { error: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = Date.now().toString(); // simple ID gen for mock/demo, usually Firebase handles this

        const newUser = await userModel.createUser(userId, {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        });

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('signup', { error: 'Server error during signup.' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
};

module.exports = {
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    logout
};
