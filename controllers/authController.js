const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const getLogin = (req, res) => {
    if (req.session && req.session.userId) {
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

        // Create Session Native
        req.session.userId = user._id;
        
        req.session.save((err) => {
            if (err) console.error("Session save error:", err);
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Server error during login.' });
    }
};

const getSignup = (req, res) => {
    if (req.session && req.session.userId) {
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

        const newUser = await userModel.createUser(null, {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        });

        req.session.userId = newUser._id;
        
        req.session.save((err) => {
            if (err) console.error("Session save error:", err);
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error(error);
        res.render('signup', { error: 'Server error during signup.' });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.error("Error destroying session:", err);
        res.clearCookie('connect.sid'); // Wipe default express session cookie
        res.redirect('/auth/login');
    });
};

module.exports = {
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    logout
};
