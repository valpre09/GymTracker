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
 exerciseData[newWorkout] = { 
