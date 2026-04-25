const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const User = mongoose.model('User', userSchema);

const createUser = async (userId, data) => {
    // userId arg ignored, Mongoose handles ids. Included to reduce controller changes.
    const user = new User(data);
    await user.save();
    return user;
};

const getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const getUserById = async (userId) => {
    return await User.findById(userId);
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    User
};
