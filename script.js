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
const clearHistoryBtn = document.getElementById('clear-history');

// Populate exercises and show routine when workout is selected
workoutList.addEventListener('change', function () {
    const selectedWorkout = workoutList.value;
    exerciseName.innerHTML = '<option value="">-- Select an Exercise --</option>';
    suggestedRoutine.innerHTML = '';
    setsContainer.innerHTML = '';

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
        clearHistoryBtn.style.display = 'none';
    }
});

// Generate set inputs dynamically with reps input
generateSetsBtn.addEventListener('click', function () {
    const num = parseInt(numSets.value);
    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of sets (at least 1)');
        return;
    }

    setsContainer.innerHTML = '';
    for (let i = 1; i <= num; i++) {
        const setDiv = document.createElement('div');
        setDiv.className = 'set-input';
        setDiv.innerHTML = `
            <label>Set ${i}:</label>
            <input type="number" class="set-weight" min="0" step="0.5" placeholder="Weight (kg)" required>
            <input type="number" class="set-reps" min="1" placeholder="Reps" required>
        `;
        setsContainer.appendChild(setDiv);
    }
});

// Handle form submission
exerciseForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const workout = workoutList.value;
    const exercise = exerciseName.value;
    if (!exercise) {
        alert('Please select an exercise');
        return;
    }

    const setWeights = Array.from(document.querySelectorAll('.set-weight'))
        .map(input => parseFloat(input.value) || 0);
    const setReps = Array.from(document.querySelectorAll('.set-reps'))
        .map(input => parseInt(input.value) || 0);
    const date = new Date().toLocaleDateString();

    if (setWeights.some(w => w < 0) || setReps.some(r => r < 0)) {
        alert('Weights and reps must be non-negative');
        return;
    }

    if (!workoutData[workout]) {
        workoutData[workout] = [];
    }

    workoutData[workout].push({ exercise, sets: setWeights.map((w, i) => ({ weight: w, reps: setReps[i] })), date });
    localStorage.setItem('workoutData', JSON.stringify(workoutData));
    alert('Exercise logged successfully!');
    exerciseForm.reset();
    setsContainer.innerHTML = '';
    displayHistory(workout);
});

// Clear history
clearHistoryBtn.addEventListener('click', function () {
    const workout = workoutList.value;
    if (confirm(`Are you sure you want to clear the history for ${workout}?`)) {
        delete workoutData[workout];
        localStorage.setItem('workoutData', JSON.stringify(workoutData));
        displayHistory(workout);
        alert('History cleared!');
    }
});

// Display workout history with max weight and edit option
function displayHistory(workout) {
    historyList.innerHTML = '';
    clearHistoryBtn.style.display = workoutData[workout]?.length ? 'block' : 'none';

    if (workoutData[workout]) {
        // Calculate max weights per exercise
        const maxWeights = {};
        workoutData[workout].forEach(entry => {
            entry.sets.forEach(set => {
                if (!maxWeights[entry.exercise] || set.weight > maxWeights[entry.exercise]) {
                    maxWeights[entry.exercise] = set.weight;
                }
            });
        });

        // Display max weights
        const maxDiv = document.createElement('div');
        maxDiv.className = 'history-item';
        maxDiv.innerHTML = '<strong>Max Weights:</strong> ' + Object.entries(maxWeights)
            .map(([ex, wt]) => `${ex}: ${wt} kg`)
            .join(', ');
        historyList.appendChild(maxDiv);

        // Display history entries
        workoutData[workout].forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            let historyText = `${entry.date}: ${entry.exercise} - `;
            entry.sets.forEach((set, i) => {
                historyText += `Set ${i + 1}: ${set.weight} kg x ${set.reps} reps`;
                if (i < entry.sets.length - 1) historyText += ', ';
            });
            div.innerHTML = `<span>${historyText}</span>`;
            
            // Add edit button for the last entry
            if (index === workoutData[workout].length - 1) {
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.textContent = 'Edit';
                editBtn.addEventListener('click', () => editLastEntry(workout, index));
                div.appendChild(editBtn);
            }
            historyList.appendChild(div);
        });
    }
}

// Edit the last entry
function editLastEntry(workout, index) {
    const entry = workoutData[workout][index];
    exerciseName.value = entry.exercise;
    numSets.value = entry.sets.length;
    generateSetsBtn.click(); // Regenerate set inputs
    
    const weightInputs = document.querySelectorAll('.set-weight');
    const repsInputs = document.querySelectorAll('.set-reps');
    entry.sets.forEach((set, i) => {
        weightInputs[i].value = set.weight;
        repsInputs[i].value = set.reps;
    });

    // Remove the old entry when the form is submitted
    exerciseForm.onsubmit = function (e) {
        e.preventDefault();
        workoutData[workout].splice(index, 1); // Remove old entry
        const setWeights = Array.from(document.querySelectorAll('.set-weight'))
            .map(input => parseFloat(input.value) || 0);
        const setReps = Array.from(document.querySelectorAll('.set-reps'))
            .map(input => parseInt(input.value) || 0);
        workoutData[workout].push({
            exercise: exerciseName.value,
            sets: setWeights.map((w, i) => ({ weight: w, reps: setReps[i] })),
            date: entry.date // Keep original date
        });
        localStorage.setItem('workoutData', JSON.stringify(workoutData));
        alert('Entry updated successfully!');
        exerciseForm.reset();
        setsContainer.innerHTML = '';
        displayHistory(workout);
        exerciseForm.onsubmit = null; // Reset to default submit handler
    };
}
