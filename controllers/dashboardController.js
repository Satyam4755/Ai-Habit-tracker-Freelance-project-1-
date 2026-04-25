const habitModel = require('../models/habitModel');
const habitLogModel = require('../models/habitLogModel');
const predictionService = require('../services/predictionService');

const getDashboard = async (req, res) => {
    try {
        const habits = await habitModel.getHabitsByUser(req.user.id);
        
        // Today's date in YYYY-MM-DD
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysLogs = await habitLogModel.getLogsByUserAndDate(req.user.id, todayStr);
        
        let totalHabits = habits.length;
        let completedToday = 0;

        // Process data for UI
        const dashboardHabits = [];
        for (let habit of habits) {
            const logs = await habitLogModel.getHabitLogs(habit.id);
            const prediction = predictionService.predictHabitBreakProbability(habit, logs);
            
            // Check if completed today
            const isCompletedToday = todaysLogs.find(log => log.habitId === habit.id && log.status === 'completed');
            if (isCompletedToday) completedToday++;

            dashboardHabits.push({
                ...habit,
                isCompletedToday: !!isCompletedToday,
                prediction,
                logs
            });
        }

        const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

        res.render('dashboard', { 
            user: req.user, 
            habits: dashboardHabits,
            stats: {
                totalHabits,
                completedToday,
                completionPercentage
            }
        });
    } catch (error) {
        console.error(error);
        res.render('error', { error: 'Failed to load dashboard.' });
    }
};

module.exports = {
    getDashboard
};
