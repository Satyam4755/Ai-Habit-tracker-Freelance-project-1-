const { db } = require('../config/firebase');

const habitLogsCollection = db.collection('habitLogs');

// Create or update a log for a specific date
const logHabitCompletion = async (habitId, userId, dateString, status) => {
    // Check if log already exists for this date
    const snapshot = await habitLogsCollection
        .where('habitId', '==', habitId)
        .get();
        
    let existingLogId = null;
    snapshot.forEach(doc => {
        if (doc.data().date === dateString) {
            existingLogId = doc.id;
        }
    });

    const logData = {
        habitId,
        userId,
        date: dateString,
        status, // 'completed' or 'incomplete'
        loggedAt: new Date().toISOString()
    };

    if (existingLogId) {
        await habitLogsCollection.doc(existingLogId).update({ status, loggedAt: logData.loggedAt });
        return { id: existingLogId, ...logData };
    } else {
        const docRef = await habitLogsCollection.add(logData);
        return { id: docRef.id, ...logData };
    }
};

const getHabitLogs = async (habitId) => {
    const snapshot = await habitLogsCollection.where('habitId', '==', habitId).get();
    let logs = [];
    snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
    });
    // Sort by date ascending
    logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    return logs;
};

const getLogsByUserAndDate = async (userId, dateString) => {
    const snapshot = await habitLogsCollection.where('userId', '==', userId).get();
    let logs = [];
    snapshot.forEach(doc => {
        if (doc.data().date === dateString) {
            logs.push({ id: doc.id, ...doc.data() });
        }
    });
    return logs;
}

module.exports = {
    logHabitCompletion,
    getHabitLogs,
    getLogsByUserAndDate
};
