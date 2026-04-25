const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.getUserById(decoded.id);
        
        if (!user) {
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
};

module.exports = { requireAuth };
