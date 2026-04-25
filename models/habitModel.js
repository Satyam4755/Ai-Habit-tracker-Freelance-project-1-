const { db } = require('../config/firebase');

const habitsCollection = db.collection('habits');

const createHabit = async (data) => {
    const docRef = await habitsCollection.add({
        ...data,
        createdAt: new Date().toISOString(),
        streak: 0, // Initial streak
        completionRate: 0,
    });
    return { id: docRef.id, ...data };
};

const getHabitsByUser = async (userId) => {
    const snapshot = await habitsCollection.where('userId', '==', userId).get();
    let habits = [];
    snapshot.forEach(doc => {
        habits.push({ id: doc.id, ...doc.data() });
    });
    return habits;
};

const getHabitById = async (id) => {
    const doc = await habitsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

const deleteHabit = async (id) => {
    await habitsCollection.doc(id).delete();
};

const updateHabit = async (id, data) => {
    await habitsCollection.doc(id).update(data);
};

module.exports = {
    createHabit,
    getHabitsByUser,
    getHabitById,
    deleteHabit,
    updateHabit
};
