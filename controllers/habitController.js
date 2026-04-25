const habitModel = require('../models/habitModel');
const habitLogModel = require('../models/habitLogModel');

const getHabits = async (req, res) => {
    try {
        const habits = await habitModel.getHabitsByUser(req.user.id);
        res.render('habits', { user: req.user, habits, error: null });
    } catch (error) {
        console.error(error);
        res.render('habits', { user: req.user, habits: [], error: 'Failed to load habits.' });
    }
};

const postAddHabit = async (req, res) => {
    const { name, category, frequency, reminderTime } = req.body;
    try {
        await habitModel.createHabit({
            userId: req.user.id,
            name,
            category,
            frequency,
            reminderTime
        });
        res.redirect('/habits');
    } catch (error) {
        console.error(error);
        res.redirect('/habits');
    }
};

const postDeleteHabit = async (req, res) => {
    try {
        await habitModel.deleteHabit(req.params.id);
        res.redirect('/habits');
    } catch (error) {
        console.error(error);
        res.redirect('/habits');
    }
};

const postLogHabit = async (req, res) => {
    const { habitId, status, date } = req.body; 
    try {
        // Validation: Only one check per day logic
        const existingLogs = await habitLogModel.getLogsByUserAndDate(req.user.id, date);
        const alreadyLogged = existingLogs.find(log => log.habitId === habitId && log.status === 'completed');
        
        if (alreadyLogged && status === 'completed') {
            return res.status(400).json({ success: false, error: 'Already checked for today.' });
        }

        // Log the completion
        await habitLogModel.logHabitCompletion(habitId, req.user.id, date, status);
        
        // Update streak logic
        const habit = await habitModel.getHabitById(habitId);
        if (habit) {
            let newStreak = habit.streak || 0;
            if (status === 'completed') {
                newStreak += 1;
            } else {
                newStreak = 0; // Break streak
            }
            // Math for updating overall completion rate across all logs 
            // will be handled asynchronously or by analytics view calculation,
            // streak is live-updated here.
            await habitModel.updateHabit(habitId, { streak: newStreak });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const postEditHabit = async (req, res) => {
    const { name, category, frequency, reminderTime } = req.body;
    try {
        await habitModel.updateHabit(req.params.id, {
            name,
            category,
            frequency,
            reminderTime
        });
        res.redirect('/habits');
    } catch (error) {
        console.error(error);
        res.redirect('/habits');
    }
};

module.exports = {
    getHabits,
    postAddHabit,
    postEditHabit,
    postDeleteHabit,
    postLogHabit
};
