const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
    habitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    status: {
        type: String, // 'completed' or 'incomplete'
        required: true
    },
    loggedAt: {
        type: Date,
        default: Date.now
    }
});

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

// Helper Functions
const logHabitCompletion = async (habitId, userId, dateString, status) => {
    // Check if log already exists
    let existingLog = await HabitLog.findOne({ habitId, date: dateString });

    if (existingLog) {
        existingLog.status = status;
        existingLog.loggedAt = Date.now();
        await existingLog.save();
        return { ...existingLog.toObject(), id: existingLog._id.toString() };
    } else {
        const newLog = new HabitLog({
            habitId,
            userId,
            date: dateString,
            status
        });
        await newLog.save();
        return { ...newLog.toObject(), id: newLog._id.toString() };
    }
};

const getHabitLogs = async (habitId) => {
    const logs = await HabitLog.find({ habitId }).sort({ date: 1 }).lean();
    return logs.map(l => ({ ...l, id: l._id.toString() }));
};

const getLogsByUserAndDate = async (userId, dateString) => {
    const logs = await HabitLog.find({ userId, date: dateString }).lean();
    return logs.map(l => ({ ...l, id: l._id.toString() }));
};

module.exports = {
    logHabitCompletion,
    getHabitLogs,
    getLogsByUserAndDate,
    HabitLog
};
