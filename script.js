// Pre-defined exercises and suggested routines
const exerciseData = {
    chest: {
        exercises: ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Push-Ups'],
        routine: [
            { exercise: 'Bench Press', sets: 4, reps: 8 },
            { exercise: 'Incline Bench Press', sets: 3, reps: 10 },
            { exercise: 'Chest Fly', sets: 3, reps: 12 }
        ]
    },
    back: {
        exercises: ['Deadlift', 'Pull-Up', 'Bent-Over Row', 'Lat Pulldown'],
        routine: [
            { exercise: 'Deadlift', sets: 4, reps: 6 },
            { exercise: 'Pull-Up', sets: 3, reps: 8 },
            { exercise: 'Bent-Over Row', sets: 3, reps: 10 }
        ]
    },
    legs: {
        exercises: ['Squat', 'Leg Press', 'Lunges', 'Leg Curl'],
        routine: [
            { exercise: 'Squat', sets: 4, reps: 8 },
            { exercise: 'Leg Press', sets: 3, reps: 10 },
            { exercise: 'Lunges', sets: 3, reps: 12 }
        ]
    }
};

// Load data from localStorage or initialize empty object
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || {};

// DOM elements
const workoutList = document.getElementById('workout-list');
const exerciseInput = document.getElementById('exercise-input');
const exerciseForm = document.getElementById('exercise-form');
const exerciseName = document.getElementById('exercise-name');
const numSets = document.getElementById('num-sets');
const generateSetsBtn = document.getElementById('generate-sets');
const setsContainer = document.getElementById('sets-container');
const historyList = document.getElementById('history-list');
const suggestedRoutine = document.getElementById('suggested-routine');

// Populate exercises and show routine when workout is selected
workoutList.addEventListener('change', function () {
    const selectedWorkout = workoutList.value;
    exerciseName.innerHTML = '<option value="">-- Select an Exercise --</option>';
    suggestedRoutine.innerHTML = '';
    setsContainer.innerHTML = ''; // Clear any existing set inputs

    if (selectedWorkout) {
        exerciseInput.style.display = 'block';

        // Populate exercise dropdown
        exerciseData[selectedWorkout].exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            exerciseName.appendChild(option);
        });

        // Display suggested routine
        suggestedRoutine.innerHTML = '<h3>Suggested Routine</h3>';
        exerciseData[selectedWorkout].routine.forEach(item => {
            const div = document.createElement('div');
            div.className = 'routine-item';
            div.textContent = `${item.exercise}: ${item.sets} sets x ${item.reps} reps`;
            suggestedRoutine.appendChild(div);
        });

        displayHistory(selectedWorkout);
    } else {
        exerciseInput.style.display = 'none';
        historyList.innerHTML = '';
    }
});

// Generate set inputs dynamically
generateSetsBtn.addEventListener('click', function () {
    const num = parseInt(numSets.value);
    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of sets (at least 1)');
        return;
    }

    setsContainer.innerHTML = ''; // Clear existing set inputs
    for (let i = 1; i <= num; i++) {
        const setDiv = document.createElement('div');
        setDiv.className = 'set-input';
        setDiv.innerHTML = `
            <label>Set ${i}:</label>
            <input type="number" class="set-weight" min="0" step="0.5" placeholder="Weight (kg)" required>
        `;
        setsContainer.appendChild(setDiv);
    }
});

// Handle form submission
exerciseForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const workout = workoutList.value;
    const exercise = exerciseName.value;
    const setWeights = Array.from(document.querySelectorAll('.set-weight'))
        .map(input => parseFloat(input.value) || 0); // Get weights for each set
    const date = new Date().toLocaleDateString();

    if (!workoutData[workout]) {
        workoutData[workout] = [];
    }

    // Add exercise with set weights to workout data
    workoutData[workout].push({ exercise, setWeights, date });

    // Save to localStorage
    localStorage.setItem('workoutData', JSON.stringify(workoutData));

    // Clear form
    exerciseForm.reset();
    setsContainer.innerHTML = ''; // Clear set inputs

    // Update history display
    displayHistory(workout);
});

// Display workout history
function displayHistory(workout) {
    historyList.innerHTML = '';
    if (workoutData[workout]) {
        workoutData[workout].forEach(entry => {
            const div = document.createElement('div');
            div.className = 'history-item';
            let historyText = `${entry.date}: ${entry.exercise} - `;
            entry.setWeights.forEach((weight, index) => {
                historyText += `Set ${index + 1}: ${weight} kg`;
                if (index < entry.setWeights.length - 1) historyText += ', ';
            });
            div.textContent = historyText;
            historyList.appendChild(div);
        });
    }
}