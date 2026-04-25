const userModel = require('../models/userModel');

const requireAuth = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await userModel.getUserById(req.session.userId);
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }
        
        req.user = { id: user._id.toString(), ...user.toObject() };
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        req.session.destroy();
        return res.redirect('/auth/login');
    }
};

module.exports = { requireAuth };
