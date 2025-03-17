// Pre-defined exercises by category
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
    setsContainer.appendChild(setDiv
