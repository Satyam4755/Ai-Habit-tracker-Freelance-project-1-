const { db } = require('../config/firebase');

const usersCollection = db.collection('users');

const createUser = async (userId, data) => {
    await usersCollection.doc(userId).set(data);
    return { id: userId, ...data };
};

const getUserByEmail = async (email) => {
    const snapshot = await usersCollection.where('email', '==', email).get();
    if (snapshot.empty) return null;
    let user = null;
    // Mock vs Real Firebase difference handling:
    snapshot.forEach(doc => {
        user = { id: doc.id, ...doc.data() };
    });
    return user;
};

const getUserById = async (userId) => {
    const doc = await usersCollection.doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById
};
