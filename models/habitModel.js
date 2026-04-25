const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    reminderTime: {
        type: String, // HH:MM format
        default: ""
    },
    streak: {
        type: Number,
        default: 0
    },
    completionRate: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create model
const Habit = mongoose.model('Habit', habitSchema);

// Helper functions (migrated from firebase logic)
const createHabit = async (data) => {
    const habit = new Habit(data);
    await habit.save();
    return habit; // mongoose outputs _id inherently
};

const getHabitsByUser = async (userId) => {
    const habits = await Habit.find({ userId: userId }).lean();
    return habits.map(h => ({ ...h, id: h._id.toString() }));
};

const getHabitById = async (id) => {
    const habit = await Habit.findById(id).lean();
    if (!habit) return null;
    return { ...habit, id: habit._id.toString() };
};

const deleteHabit = async (id) => {
    await Habit.findByIdAndDelete(id);
};

const updateHabit = async (id, data) => {
    await Habit.findByIdAndUpdate(id, data, { new: true });
};

module.exports = {
    createHabit,
    getHabitsByUser,
    getHabitById,
    deleteHabit,
    updateHabit,
    Habit
};
