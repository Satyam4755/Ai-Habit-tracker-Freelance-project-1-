// services/predictionService.js

/**
 * Advanced AI-Based Prediction Module
 * Calculates the probability of a user breaking their habit tomorrow (0% - 100%).
 * 
 * Analyzes:
 * - Streak consistency
 * - Weekly trends (e.g. historical performance on the upcoming day of the week)
 * - Missed days pattern
 * - Recency of failures
 */
const predictHabitBreakProbability = (habit, logs) => {
    // If no logs, no data to predict = neutral high default
    if (!logs || logs.length === 0) {
        return {
            probability: 50,
            insights: "Not enough data yet. Start tracking to get AI insights!",
            weakDay: null
        };
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDayOfWeek = tomorrow.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // 1. Calculate Base Consistency & Weekday Performance
    let totalLogs = logs.length;
    let totalCompletions = 0;
    
    // Track stats for each day of the week
    const weekdayStats = { 0:{c:0,t:0}, 1:{c:0,t:0}, 2:{c:0,t:0}, 3:{c:0,t:0}, 4:{c:0,t:0}, 5:{c:0,t:0}, 6:{c:0,t:0} };
    
    // Recency tracking
    let missedRecently = false;
    let daysSinceLastMiss = 0;
    let foundLastMiss = false;

    // Iterate backwards through logs
    for (let i = logs.length - 1; i >= 0; i--) {
        const log = logs[i];
        const logDate = new Date(log.date);
        const dayOfWeek = logDate.getDay();

        if (log.status === 'completed') {
            totalCompletions++;
            weekdayStats[dayOfWeek].c++;
            if (!foundLastMiss) daysSinceLastMiss++;
        } else {
            if (!foundLastMiss) {
                foundLastMiss = true;
                if (daysSinceLastMiss < 3) {
                    missedRecently = true; // Missed within the last 3 logged days
                }
            }
        }
        weekdayStats[dayOfWeek].t++;
    }

    // 2. Base Probability (inverse of completion rate)
    const overallCompletionRate = totalCompletions / totalLogs;
    let breakProbability = (1 - overallCompletionRate) * 100;

    // 3. Apply Day-Of-Week Modifier
    const tomorrowStats = weekdayStats[tomorrowDayOfWeek];
    let tomorrowCompletionRate = overallCompletionRate; // Default to overall if no data for tomorrow's day
    if (tomorrowStats.t > 0) {
        tomorrowCompletionRate = tomorrowStats.c / tomorrowStats.t;
        // If they particularly fail on this day, increase probability
        const modifier = (overallCompletionRate - tomorrowCompletionRate) * 50; 
        breakProbability += modifier;
    }

    // 4. Streak & Recency Bias
    const currentStreak = habit.streak || 0;
    
    if (currentStreak > 21) {
        // High streak = habit formed, break probability drops
        breakProbability -= 15;
    } else if (currentStreak > 7) {
        breakProbability -= 5;
    }

    if (missedRecently) {
        // Momentum broken, higher chance to fail again
        breakProbability += 20;
    }

    // Normalize between 5% and 95% (never 0% or 100% in real life)
    breakProbability = Math.max(5, Math.min(95, breakProbability));

    // 5. Generate Smart Insights
    let insights = "";
    if (breakProbability > 70) {
        insights = "⚠️ High risk of skipping tomorrow! Try setting an early reminder.";
    } else if (breakProbability > 40) {
        insights = "Keep your momentum. Don't break the streak now!";
    } else {
        insights = "🌟 You are highly consistent! Excellent work.";
    }

    // Find weakest day
    let weakDay = null;
    let lowestRate = 1;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let d = 0; d < 7; d++) {
        if (weekdayStats[d].t >= 2) { // Require at least 2 logs to consider it a trend
            let rate = weekdayStats[d].c / weekdayStats[d].t;
            if (rate < lowestRate) {
                lowestRate = rate;
                weakDay = days[d];
            }
        }
    }

    if (weakDay && lowestRate < 0.6) {
        insights += ` FYI: Your consistency tends to drop on ${weakDay}s.`;
    }

    return {
        probability: Math.round(breakProbability),
        insights,
        weakDay
    };
};

module.exports = {
    predictHabitBreakProbability
};
