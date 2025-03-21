// Pre-defined exercises by category (for reference, though not used directly here)
const defaultExerciseData = {
    chest: { exercises: ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Push-Ups'] },
    back: { exercises: ['Deadlift', 'Pull-Up', 'Bent-Over Row', 'Lat Pulldown'] },
    legs: { 
        exercises: [
            'Squat', 
            'Leg Press', 
            'Lunges', 
            'Leg Curl', 
            'Leg Extensions (Machine)', 
            'Seated Leg Curls', 
            'Squat Barbell', 
            'Seated Calf Raises'
        ]
    },
    arms: { exercises: ['Bicep Curl', 'Tricep Dip', 'Hammer Curl', 'Overhead Press'] },
    core: { exercises: ['Plank', 'Russian Twist', 'Leg Raise', 'Crunches'] }
};

// Load data
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || {};
let sessionData = JSON.parse(localStorage.getItem('sessionData')) || [];

// DOM elements
const historyTableBody = document.getElementById('full-history-table-body');
const progressChartCanvas = document.getElementById('full-progress-chart');
let progressChart = null;

// Display full history summary
function displayHistorySummary() {
    console.log('Displaying full history summary, workoutData:', workoutData, 'sessionData:', sessionData);
    historyTableBody.innerHTML = '';

    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }
    progressChartCanvas.style.display = 'none';

    // Show individual exercise logs
    let allEntries = [];
    Object.keys(workoutData).forEach(workout => {
        workoutData[workout].forEach(entry => {
            allEntries.push({ workout, ...entry });
        });
    });
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    allEntries.forEach(entry => {
        const row = document.createElement('tr');
        const setsText = entry.sets.map((set, i) => `Set ${i + 1}: ${set.weight} kg x ${set.reps} reps`).join(', ');
        const totalMass = entry.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.workout.charAt(0).toUpperCase() + entry.workout.slice(1)} Day</td>
            <td>${entry.exercise}</td>
            <td>${setsText}</td>
            <td>${totalMass}</td>
        `;
        historyTableBody.appendChild(row);
    });

    // Show session summaries
    if (sessionData.length > 0) {
        sessionData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        sessionData.forEach(session => {
            const row = document.createElement('tr');
            const duration = `${Math.floor(session.duration / 3600)}:${String(Math.floor((session.duration % 3600) / 60)).padStart(2, '0')}:${String(session.duration % 60).padStart(2, '0')}`;
            row.innerHTML = `
                <td>${session.startTime}</td>
                <td>${session.workout.charAt(0).toUpperCase() + session.workout.slice(1)} Day</td>
                <td>Full Session</td>
                <td>Duration: ${duration}</td>
                <td>${session.totalMass}</td>
            `;
            historyTableBody.appendChild(row);
        });
    }

    if (allEntries.length === 0 && sessionData.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="5">No workout history available.</td></tr>';
    } else {
        // Display progress chart for all exercises
        const progressData = {};
        allEntries.forEach(entry => {
            if (!progressData[entry.exercise]) progressData[entry.exercise] = [];
            const maxWeight = Math.max(...entry.sets.map(set => set.weight));
            progressData[entry.exercise].push({ date: new Date(entry.date), weight: maxWeight });
        });

        console.log('Progress data for chart (history page):', progressData);

        const datasets = Object.entries(progressData).map(([exercise, data]) => ({
            label: exercise,
            data: data.map(d => ({ x: d.date, y: d.weight })),
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            fill: false,
            tension: 0.1
        }));

        if (datasets.some(dataset => dataset.data.length > 1)) { // Ensure at least one exercise has 2+ data points
            progressChartCanvas.style.display = 'block';
            progressChart = new Chart(progressChartCanvas, {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    scales: {
                        x: { 
                            type: 'time',
                            time: { 
                                unit: 'day',
                                parser: 'MM/dd/yyyy', // Updated to use 'dd' instead of 'DD'
                                displayFormats: { day: 'MM/dd/yyyy' } // Updated to use 'dd' instead of 'DD'
                            },
                            title: { display: true, text: 'Date' }
                        },
                        y: { 
                            title: { display: true, text: 'Max Weight (kg)' },
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: { display: true },
                        title: { display: true, text: 'Progress Over Time (All Exercises)' }
                    }
                }
            });
        } else {
            console.log('Not enough data points to render chart on history page (need at least 2 per exercise).');
            progressChartCanvas.style.display = 'none';
        }
    }
}

// Initialize history page
displayHistorySummary();
