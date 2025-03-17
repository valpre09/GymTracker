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
const historyDetails = document.getElementById('history-details');
const progressChartCanvas = document.getElementById('progress-chart');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const stopTimerBtn = document.getElementById('stop-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const saveHistoryBtn = document .getElementById('save-history');
let progressChart = null;
let timerInterval = null;
let timerSeconds = 0;
let currentSession = { workout: null, totalMass: 0, startTime: null };

// Populate workouts
function populateWorkoutList() {
 workoutList.innerHTML = '<option value="">-- Choose a Workout --</option>';
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
 const selectedWorkout = workoutList.value;
 exerciseName.innerHTML = '<option value="">-- Select an Exercise --</option>';
 setsContainer.innerHTML = '';
 customExerciseInput.value = '';
 saveHistoryBtn.style.display = selectedWorkout ? 'block' : 'none';
 currentSession.workout = selectedWorkout;

 if (selectedWorkout) {
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
 } else if (!newExercise) {
 alert('Please enter an exercise name');
 } else {
 alert('This exercise already exists');
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

// Handle form submission (save to history immediately)
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
 const date = new Date().toLocaleDateString();
 const totalMass = setWeights.reduce((sum, weight, i) => sum + weight * setReps[i], 0);

 if (setWeights.some(w => w < 0) || setReps.some(r => r < 0)) {
 alert('Weights and reps must be non-negative');
 return;
 }

 if (!workoutData[workout]) workoutData[workout] = [];
 workoutData[workout].push({ exercise, sets: setWeights.map((w, i) => ({ weight: w, reps: setReps[i] })), date });
 currentSession.totalMass += totalMass;
 localStorage.setItem('workoutData', JSON.stringify(workoutData));

 if (timerInterval && currentSession.startTime) {
 currentSession.totalMass = totalMass; // Reset for simplicity, could accumulate
 }

 alert('Exercise logged successfully!');
 exerciseForm.reset();
 customExerciseInput.value = '';
 generateSets(4);
 displayHistorySummary();
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
 displayHistorySummary();
 alert('History saved manually!');
 } else {
 alert('No workout or mass logged to save.');
 }
});

// Timer functions
function updateTimer() {
 timerSeconds++;
 const hours = Math.floor(timerSeconds / 
