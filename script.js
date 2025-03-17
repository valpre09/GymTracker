// Pre-defined exercises by category
const defaultExerciseData = {
    chest: { exercises: ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Push-Ups'] },
    back: { exercises: ['Deadlift', 'Pull-Up', 'Bent-Over Row', 'Lat Pulldown'] },
    legs: { exercises: ['Squat', 'Leg Press', 'Lunges', 'Leg Curl'] },
    arms: { exercises: ['Bicep Curl', 'Tricep Dip', 'Hammer Curl', 'Overhead Press'] },
    core: { exercises: ['Plank', 'Russian Twist', 'Leg Raise', 'Crunches'] }
};

// Load or initialize data
let exerciseData = JSON.parse(localStorage.getItem('exerciseData')) || { ...defaultExerciseData };
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || {};
let sessionData = JSON.parse(localStorage.getItem('sessionData')) || [];

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
const historyTableBody = document.getElementById('history-table-body');
const pbDisplay = document.getElementById('pb-display');
const pbWeight = document.getElementById('pb-weight');
const progressChartCanvas = document.getElementById('progress-chart');
let progressChart = null;
let timerInterval = null;
let timerSeconds = 0;
let currentSession = { workout: null, totalMass: 0, startTime: null };

// Populate workouts
function populateWorkoutList() {
    workoutList.innerHTML = '<option value="">-- Choose a Workout --</option>';
    console.log('Populating workout list with exerciseData:', exerciseData);
    Object.keys(exerciseData).forEach(workout => {
        const option = document.createElement('option');
        option.value = workout;
        option.textContent = workout.charAt(0).toUpperCase() + workout.slice(1) + ' Day';
        workoutList.appendChild(option);
    });
}
populateWorkoutList();

// Handle workout selection (single workout)
workoutList.addEventListener('change', function () {
    console.log('Workout changed to:', workoutList.value);
    const selectedWorkout = workoutList.value;
    exerciseName.innerHTML = '<option value="">-- Select an Exercise --</option>';
    setsContainer.innerHTML = '';
    customExerciseInput.value = '';
    saveHistoryBtn.style.display = selectedWorkout ? 'block' : 'none';
    currentSession.workout = selectedWorkout;

    if (selectedWorkout && exerciseData[selectedWorkout]) {
        console.log('Populating exercises for:', selectedWorkout, 'with:', exerciseData[selectedWorkout].exercises);
        exerciseInput.style.display = 'block';
        exerciseData[selectedWorkout].exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            exerciseName.appendChild(option);
        });
        generateSets(4);
    } else {
        exerciseInput.style.display = 'none';
        console.log('No exercises available for:', selectedWorkout);
    }
    // Clear history when changing workout
    historyTableBody.innerHTML = '';
    pbDisplay.style.display = 'none';
    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }
    progressChartCanvas.style.display = 'none';
});

// Handle exercise selection (filter history dynamically)
exerciseName.addEventListener('change', function () {
    const selectedExercise = exerciseName.value;
    console.log('Exercise changed to:', selectedExercise);
    displayHistorySummary(selectedExercise);
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
    const workout = workoutList.value;
    const newExercise = customExerciseInput.value.trim();
    if (newExercise && workout && !exerciseData[workout].exercises.includes(newExercise)) {
        exerciseData[workout].exercises.push(newExercise);
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        
        const option = document.createElement('option');
        option.value = newExercise;
        option.textContent = newExercise;
        exerciseName.appendChild(option);
        exerciseName.value = newExercise;
        customExerciseInput.value = '';
        alert('Custom exercise added!');
        displayHistorySummary(newExercise); // Update history for the new exercise
    } else if (!newExercise) {
        alert('Please enter an exercise name');
    } else {
        alert('This exercise already exists');
    }
});

// Generate set inputs with checkboxes
function generateSets(numSets) {
    setsContainer.innerHTML = '';
    for (let i = 1; i <= numSets; i++) {
        const setDiv = document.createElement('div');
        setDiv.className = 'set-input';
        setDiv.innerHTML = `
            <label>Set ${i}:</label>
            <input type="number" class="set-weight" min="0" step="0.5" placeholder="Weight (kg)" required>
            <input type="number" class="set-reps" min="1" placeholder="Reps" required>
            <input type="checkbox" class="set-checkbox" id="set-checkbox-${i}">
            <label for="set-checkbox-${i}" class="set-checkbox-label">Save this set</label>
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
        <input type="checkbox" class="set-checkbox" id="set-checkbox-${currentSets + 1}">
        <label for="set-checkbox-${currentSets + 1}" class="set-checkbox-label">Save this set</label>
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

// Handle form submission (save only checked sets)
exerciseForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const workout = workoutList.value;
    const exercise = exerciseName.value;
    if (!exercise || !workout) {
        alert('Please select an exercise and a workout');
        return;
    }

    const setWeights = Array.from(document.querySelectorAll('.set-weight'))
        .map(input => parseFloat(input.value) || 0);
    const setReps = Array.from(document.querySelectorAll('.set-reps'))
        .map(input => parseInt(input.value) || 0);
    const setCheckboxes = Array.from(document.querySelectorAll('.set-checkbox'))
        .map(checkbox => checkbox.checked);
    const date = new Date().toLocaleDateString();

    // Validate inputs
    if (setWeights.some(w => w < 0) || setReps.some(r => r < 0)) {
        alert('Weights and reps must be non-negative');
        return;
    }

    // Only save checked sets
    const setsToSave = [];
    let totalMass = 0;
    setWeights.forEach((weight, i) => {
        if (setCheckboxes[i]) {
            setsToSave.push({ weight, reps: setReps[i] });
            totalMass += weight * setReps[i];
        }
    });

    if (setsToSave.length === 0) {
        alert('Please check at least one set to save.');
        return;
    }

    if (!workoutData[workout]) workoutData[workout] = [];
    workoutData[workout].push({ exercise, sets: setsToSave, date });
    currentSession.totalMass += totalMass;
    localStorage.setItem('workoutData', JSON.stringify(workoutData));

    if (timerInterval && currentSession.startTime) {
        currentSession.totalMass = totalMass; // Reset for simplicity, could accumulate
    }

    alert('Exercise saved successfully!');
    exerciseForm.reset();
    customExerciseInput.value = '';
    generateSets(4);
    displayHistorySummary(exercise); // Update history for the selected exercise
});

// Save to history manually (without timer)
saveHistoryBtn.addEventListener('click', function () {
    if (currentSession.workout && currentSession.totalMass > 0) {
        const date = new Date().toLocaleString();
        sessionData.push({
            workout: currentSession.workout,
            totalMass: currentSession.totalMass,
            duration: timerSeconds || 0,
            startTime: date
        });
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        currentSession = { workout: null, totalMass: 0, startTime: null };
        displayHistorySummary(exerciseName.value); // Update history for the current exercise
        alert('History saved manually!');
    } else {
        alert('No workout or mass logged to save.');
    }
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
        if (currentSession.workout && currentSession.totalMass > 0) {
            sessionData.push({
                workout: currentSession.workout,
                totalMass: currentSession.totalMass,
                duration: timerSeconds,
                startTime: currentSession.startTime
            });
            localStorage.setItem('sessionData', JSON.stringify(sessionData));
            currentSession = { workout: null, totalMass: 0, startTime: null };
            displayHistorySummary(exerciseName.value); // Update history for the current exercise
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
    currentSession = { workout: null, totalMass: 0, startTime: null };
});

// Display history summary (filtered by selected exercise)
function displayHistorySummary(selectedExercise) {
    console.log('Displaying history summary for exercise:', selectedExercise);
    historyTableBody.innerHTML = '';
    pbDisplay.style.display = 'none';
    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }
    progressChartCanvas.style.display = 'none';

    if (!selectedExercise) {
        historyTableBody.innerHTML = '<tr><td colspan="3">Select an exercise to view its history.</td></tr>';
        return;
    }

    // Gather all entries for the selected exercise
    let exerciseEntries = [];
    Object.keys(workoutData).forEach(workout => {
        workoutData[workout].forEach(entry => {
            if (entry.exercise === selectedExercise) {
                exerciseEntries.push({ workout, ...entry });
            }
        });
    });

    exerciseEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display the most recent entry in the table
    if (exerciseEntries.length > 0) {
        const latestEntry = exerciseEntries[0];
        const row = document.createElement('tr');
        const setsText = latestEntry.sets.map((set, i) => `Set ${i + 1}: ${set.weight} kg x ${set.reps} reps`).join(', ');
        const totalMass = latestEntry.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        row.innerHTML = `
            <td>${latestEntry.date}</td>
            <td>${setsText}</td>
            <td>${totalMass}</td>
        `;
        historyTableBody.appendChild(row);

        // Calculate and display Personal Best (highest weight)
        const maxWeight = Math.max(...exerciseEntries.flatMap(entry => entry.sets.map(set => set.weight)));
        if (maxWeight > 0) {
            pbDisplay.style.display = 'block';
            pbWeight.textContent = `${maxWeight} kg (on ${exerciseEntries.find(entry => entry.sets.some(set => set.weight === maxWeight)).date})`;
        }

        // Display progress chart
        const progressData = {};
        progressData[selectedExercise] = exerciseEntries.map(entry => ({
            date: new Date(entry.date), // Ensure date is a Date object
            weight: Math.max(...entry.sets.map(set => set.weight))
        }));

        console.log('Progress data for chart:', progressData);

        if (progressData[selectedExercise].length > 1) { // Chart.js needs at least 2 data points to render a line
            progressChartCanvas.style.display = 'block';
            if (progressChart) progressChart.destroy();

            const datasets = [{
                label: selectedExercise,
                data: progressData[selectedExercise].map(d => ({ x: d.date, y: d.weight })),
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                fill: false,
                tension: 0.1
            }];

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
                                parser: 'MM/DD/YYYY', // Match the date format in localStorage
                                displayFormats: { day: 'MM/DD/YYYY' }
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
                        title: { display: true, text: 'Progress Over Time' }
                    }
                }
            });
        } else {
            console.log('Not enough data points to render chart (need at least 2).');
            progressChartCanvas.style.display = 'none';
        }
    } else {
        historyTableBody.innerHTML = '<tr><td colspan="3">No history available for this exercise.</td></tr>';
    }
}
