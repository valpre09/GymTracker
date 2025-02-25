// Pre-defined exercises
const defaultExerciseData = {
    chest: { exercises: ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Push-Ups'] },
    back: { exercises: ['Deadlift', 'Pull-Up', 'Bent-Over Row', 'Lat Pulldown'] },
    legs: { exercises: ['Squat', 'Leg Press', 'Lunges', 'Leg Curl'] }
};

// Load or initialize data
let exerciseData = JSON.parse(localStorage.getItem('exerciseData')) || { ...defaultExerciseData };
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || {};
let sessionData = JSON.parse(localStorage.getItem('sessionData')) || []; // Store sessions with mass and time

// DOM elements
const workoutList = document.getElementById('workout-list');
const exerciseInput = document.getElementById('exercise-input');
const exerciseForm = document.getElementById('exercise-form');
const exerciseName = document.getElementById('exercise-name');
const customExerciseInput = document.getElementById('custom-exercise');
const addCustomExerciseBtn = document.getElementById('add-custom-exercise');
const customWorkoutInput = document.getElementById('custom-workout');
const addCustomWorkoutBtn = document.getElementById('add-custom-workout');
const setsContainer = document.getElementById('sets-container');
const addSetBtn = document.getElementById('add-set');
const removeSetBtn = document.getElementById('remove-set');
const historySummary = document.getElementById('history-summary');
const historyDetails = document.getElementById('history-details');
const progressChartCanvas = document.getElementById('progress-chart');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const stopTimerBtn = document.getElementById('stop-timer');
const resetTimerBtn = document.getElementById('reset-timer');
let progressChart = null;
let timerInterval = null;
let timerSeconds = 0;
let currentSession = { workouts: [], totalMass: 0, startTime: null };

// Populate workouts
function populateWorkoutList() {
    workoutList.innerHTML = '<option value="">-- Choose Workouts --</option>';
    Object.keys(exerciseData).forEach(workout => {
        const option = document.createElement('option');
        option.value = workout;
        option.textContent = workout.charAt(0).toUpperCase() + workout.slice(1) + ' Day';
        workoutList.appendChild(option);
    });
}
populateWorkoutList();

// Handle workout selection (multiple allowed)
workoutList.addEventListener('change', function () {
    const selectedWorkouts = Array.from(workoutList.selectedOptions).map(opt => opt.value);
    exerciseName.innerHTML = '<option value="">-- Select an Exercise --</option>';
    setsContainer.innerHTML = '';
    customExerciseInput.value = '';
    currentSession.workouts = selectedWorkouts;

    if (selectedWorkouts.length > 0) {
        exerciseInput.style.display = 'block';
        const allExercises = [...new Set(selectedWorkouts.flatMap(w => exerciseData[w].exercises))];
        allExercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            exerciseName.appendChild(option);
        });
        generateSets(4);
    } else {
        exerciseInput.style.display = 'none';
    }
    displayHistorySummary();
});

// Add custom workout
addCustomWorkoutBtn.addEventListener('click', function () {
    const newWorkout = customWorkoutInput.value.trim().toLowerCase();
    if (newWorkout && !exerciseData[newWorkout]) {
        exerciseData[newWorkout] = { exercises: [] };
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        const option = document.createElement('option');
        option.value = newWorkout;
        option.textContent = newWorkout.charAt(0).toUpperCase() + newWorkout.slice(1) + ' Day';
        workoutList.appendChild(option);
        customWorkoutInput.value = '';
        alert('Custom workout added!');
    } else if (!newWorkout) {
        alert('Please enter a workout name');
    } else {
        alert('This workout already exists');
    }
});

// Add custom exercise
addCustomExerciseBtn.addEventListener('click', function () {
    const selectedWorkouts = Array.from(workoutList.selectedOptions).map(opt => opt.value);
    const newExercise = customExerciseInput.value.trim();
    if (newExercise && selectedWorkouts.length > 0) {
        selectedWorkouts.forEach(workout => {
            if (!exerciseData[workout].exercises.includes(newExercise)) {
                exerciseData[workout].exercises.push(newExercise);
            }
        });
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        const option = document.createElement('option');
        option.value = newExercise;
        option.textContent = newExercise;
        exerciseName.appendChild(option);
        exerciseName.value = newExercise;
        customExerciseInput.value = '';
        alert('Custom exercise added!');
    } else if (!newExercise) {
        alert('Please enter an exercise name');
    } else {
        alert('Please select at least one workout');
    }
});

// Generate set inputs
function generateSets(numSets) {
    setsContainer.innerHTML = '';
    for (let i = 1; i <= numSets; i++) {
        const setDiv = document.createElement('div');
        setDiv.className = 'set-input';
        setDiv.innerHTML = `
            <label>Set ${i}:</label>
            <input type="number" class="set-weight" min="0" step="0.5" placeholder="Weight (kg)" required>
            <input type="number" class="set-reps" min="1" placeholder="Reps" required>
        `;
        setsContainer.appendChild(setDiv);
    }
}

// Add set
addSetBtn.addEventListener('click', function () {
    const currentSets = setsContainer.children.length;
    const setDiv = document.createElement('div');
    setDiv.className = 'set-input';
    setDiv.innerHTML = `
        <label>Set ${currentSets + 1}:</label>
        <input type="number" class="set-weight" min="0" step="0.5" placeholder="Weight (kg)" required>
        <input type="number" class="set-reps" min="1" placeholder="Reps" required>
    `;
    setsContainer.appendChild(setDiv);
});

// Remove set
removeSetBtn.addEventListener('click', function () {
    const currentSets = setsContainer.children.length;
    if (currentSets > 1) {
        setsContainer.removeChild(setsContainer.lastChild);
    } else {
        alert('At least one set is required');
    }
});

// Handle form submission
exerciseForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const selectedWorkouts = Array.from(workoutList.selectedOptions).map(opt => opt.value);
    const exercise = exerciseName.value;
    if (!exercise || selectedWorkouts.length === 0) {
        alert('Please select an exercise and at least one workout');
        return;
    }

    const setWeights = Array.from(document.querySelectorAll('.set-weight'))
        .map(input => parseFloat(input.value) || 0);
    const setReps = Array.from(document.querySelectorAll('.set-reps'))
        .map(input => parseInt(input.value) || 0);
    const date = new Date().toLocaleDateString();
    const totalMass = setWeights.reduce((sum, weight, i) => sum + weight * setReps[i], 0);

    if (setWeights.some(w => w < 0) || setReps.some(r => r < 0)) {
        alert('Weights and reps must be non-negative');
        return;
    }

    selectedWorkouts.forEach(workout => {
        if (!workoutData[workout]) workoutData[workout] = [];
        workoutData[workout].push({ exercise, sets: setWeights.map((w, i) => ({ weight: w, reps: setReps[i] })), date });
    });
    currentSession.totalMass += totalMass;
    localStorage.setItem('workoutData', JSON.stringify(workoutData));
    alert('Exercise logged successfully!');
    exerciseForm.reset();
    customExerciseInput.value = '';
    generateSets(4);
    displayHistorySummary();
});

// Timer functions
function updateTimer() {
    timerSeconds++;
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

startTimerBtn.addEventListener('click', function () {
    if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
        startTimerBtn.disabled = true;
        stopTimerBtn.disabled = false;
        currentSession.startTime = new Date().toLocaleString();
    }
});

stopTimerBtn.addEventListener('click', function () {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTimerBtn.disabled = false;
        stopTimerBtn.disabled = true;
        if (currentSession.workouts.length > 0 && currentSession.totalMass > 0) {
            sessionData.push({
                workouts: [...currentSession.workouts],
                totalMass: currentSession.totalMass,
                duration: timerSeconds,
                startTime: currentSession.startTime
            });
            localStorage.setItem('sessionData', JSON.stringify(sessionData));
            currentSession = { workouts: [], totalMass: 0, startTime: null };
            displayHistorySummary();
        }
    }
});

resetTimerBtn.addEventListener('click', function () {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerSeconds = 0;
    timerDisplay.textContent = '00:00:00';
    startTimerBtn.disabled = false;
    stopTimerBtn.disabled = true;
    currentSession = { workouts: [], totalMass: 0, startTime: null };
});

// Display history summary
function displayHistorySummary() {
    historySummary.innerHTML = '';
    historyDetails.style.display = 'none';
    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }
    progressChartCanvas.style.display = 'none';

    sessionData.forEach((session, index) => {
        const div = document.createElement('div');
        div.className = 'summary-item';
        const duration = `${Math.floor(session.duration / 3600)}:${String(Math.floor((session.duration % 3600) / 60)).padStart(2, '0')}:${String(session.duration % 60).padStart(2, '0')}`;
        div.innerHTML = `<span>${session.startTime} - ${session.workouts.join(', ')}: ${session.totalMass} kg, ${duration}</span>`;
        div.addEventListener('click', () => displayHistoryDetails(index));
        historySummary.appendChild(div);
    });
}

// Display detailed history and graph
function displayHistoryDetails(sessionIndex) {
    const session = sessionData[sessionIndex];
    historyDetails.innerHTML = '';
    historyDetails.style.display = 'block';

    const workouts = session.workouts;
    workouts.forEach(workout => {
        if (workoutData[workout]) {
            const workoutDiv = document.createElement('div');
            workoutDiv.innerHTML = `<h3>${workout.charAt(0).toUpperCase() + workout.slice(1)}</h3>`;
            workoutData[workout].filter(entry => entry.date === session.startTime.split(',')[0]).forEach(entry => {
                const div = document.createElement('div');
                div.className = 'history-item';
                let text = `${entry.exercise} - `;
                entry.sets.forEach((set, i) => {
                    text += `Set ${i + 1}: ${set.weight} kg x ${set.reps} reps${i < entry.sets.length - 1 ? ', ' : ''}`;
                });
                div.textContent = text;
                workoutDiv.appendChild(div);
            });
            historyDetails.appendChild(workoutDiv);
        }
    });

    const progressData = {};
    workouts.forEach(workout => {
        if (workoutData[workout]) {
            workoutData[workout].forEach(entry => {
                if (!progressData[entry.exercise]) progressData[entry.exercise] = [];
                const maxWeight = Math.max(...entry.sets.map(set => set.weight));
                progressData[entry.exercise].push({ date: entry.date, weight: maxWeight });
            });
        }
    });

    if (Object.keys(progressData).length > 0) {
        progressChartCanvas.style.display = 'block';
        if (progressChart) progressChart.destroy();

        const datasets = Object.entries(progressData).map(([exercise, data]) => ({
            label: exercise,
            data: data.map(d => ({ x: d.date, y: d.weight })),
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            fill: false,
            tension: 0.1
        }));

        progressChart = new Chart(progressChartCanvas, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                scales: {
                    x: { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Max Weight (kg)' } }
                },
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Progress Over Time' }
                }
            }
        });
    }
}
