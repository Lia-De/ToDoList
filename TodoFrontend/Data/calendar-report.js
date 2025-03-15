export function calculateTotalTimePerDay(events) {
    const timePerDay = {};

    events.forEach((timer) => {
        const startDate = new Date(timer.startDate);
        const stopDate = new Date(timer.endDate);

        const dayKey = startDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
        const durationMs = stopDate - startDate;
        const durationMinutes = Math.floor(durationMs / (1000 * 60));

        if (!timePerDay[dayKey]) {
            timePerDay[dayKey] = 0;
        }
        timePerDay[dayKey] += durationMinutes;
    });

    // Convert minutes to readable hours:minutes format
    const formattedTimes = Object.entries(timePerDay).map(([date, minutes]) => ({
        date,
        totalTime: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
    }));

    return formattedTimes;
}

