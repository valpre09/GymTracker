console.log('Script loaded!');

// Pre-defined exercises
const defaultExerciseData = {
    chest: {
        exercises: ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Push-Ups']
    },
    back: {
        exercises: ['Deadlift', 'Pull-Up', 'Bent-Over Row', 'Lat Pulldown']
    },
    legs: {
        exercises: ['Squat', 'Leg Press', 'Lunges', 'Leg Curl']
    }
};

// Load or initialize exercise data from localStorage with fallback
let exerciseData;
try {
    exerciseData = JSON.parse(localStorage.getItem('exerciseData')) || { ...defaultExerciseData };
    console.log('exerciseData loaded:', exerciseData);
} catch (e) {
    console.warn('Failed to parse exerciseData from localStorage, using default:', e);
    exerciseData = { ...defaultExerciseData };
}

// Load data from localStorage or initialize empty object
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || {};

// DOM elements
const workoutList = document.getElementById('workout-list');
const exerciseInput = document.getElementById('exercise-input');
const exerciseForm = document.getElementById('exercise-form');
const exerciseName = document.getElementById('exercise-name');
const customExerciseInput = document.getElementById('custom-exercise');
const addCustomExerciseBtn = document.getElementById('add-custom-exercise');
const setsContainer = document.getElementById('sets-container');
const addSetBtn = document.getElementById('add-set');
const removeSetBtn = document.getElementById('remove-set');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const progressChartCanvas = document.getElementById('progress-chart');
let progressChart = null; // Store chart instance

// Populate exercises when workout is selected
workoutList.addEventListener('change', function () {
    const selectedWorkout = workoutList.value;
    console.log('Workout selected:', selectedWorkout);
    
    exerciseName.innerHTML = '<option value="">-- Select an Exercise --</option>';
    setsContainer.innerHTML = '';
    customExerciseInput.value = '';

    if (selectedWorkout) {
        exerciseInput.style.display = 'block';
        console.log('Populating exercises for:', selectedWorkout);

        // Populate exercise dropdown
        if (exerciseData[selectedWorkout] && exerciseData[selectedWorkout].exercises) {
            exerciseData[selectedWorkout].exercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise;
                option.textContent = exercise;
                exerciseName.appendChild(option);
            });
            console.log('Exercise dropdown populated');
        } else {
            console.warn(`No exercises found for ${selectedWorkout}`);
        }

        generateSets(4); // Default to 4 sets
        displayHistory(selectedWorkout);
    } else {
        exerciseInput.style.display = 'none';
        historyList.innerHTML = '';
        clearHistoryBtn.style.display = 'none';
        progressChartCanvas.style.display = 'none';
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
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
        exerciseName.value = newExercise; // Auto-select the new exercise
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
    console.log(`Generated ${numSets} sets`);
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
    customExerciseInput.value = '';
    generateSets(4); // Reset to 4 sets after submission
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

// Display workout history with max weight, edit option, and progress graph
function displayHistory(workout) {
    historyList.innerHTML = '';
    clearHistoryBtn.style.display = workoutData[workout]?.length ? 'block' : 'none';

    if (workoutData[workout] && Array.isArray(workoutData[workout])) {
        // Calculate max weights per exercise
        const maxWeights = {};
        workoutData[workout].forEach(entry => {
            if (entry.sets && Array.isArray(entry.sets)) {
                entry.sets.forEach(set => {
                    if (!maxWeights[entry.exercise] || set.weight > maxWeights[entry.exercise]) {
                        maxWeights[entry.exercise] = set.weight;
                    }
                });
            } else {
                console.warn(`Invalid entry detected in ${workout}:`, entry);
            }
        });

        // Display max weights
        if (Object.keys(maxWeights).length > 0) {
            const maxDiv = document.createElement('div');
            maxDiv.className = 'history-item';
            maxDiv.innerHTML = '<strong>Max Weights:</strong> ' + Object.entries(maxWeights)
                .map(([ex, wt]) => `${ex}: ${wt} kg`)
                .join(', ');
            historyList.appendChild(maxDiv);
        }

        // Prepare data for progress graph
        const progressData = {};
        workoutData[workout].forEach(entry => {
            if (entry.sets && Array.isArray(entry.sets)) {
                const maxWeight = Math.max(...entry.sets.map(set => set.weight));
                if (!progressData[entry.exercise]) {
                    progressData[entry.exercise] = [];
                }
                progressData[entry.exercise].push({ date: entry.date, weight: maxWeight });
            }
        });

        // Display progress graph
        if (Object.keys(progressData).length > 0) {
            progressChartCanvas.style.display = 'block';
            if (progressChart) {
                progressChart.destroy();
            }

            const datasets = Object.entries(progressData).map(([exercise, data]) => ({
                label: exercise,
                data: data.map(d => ({ x: d.date, y: d.weight })),
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                fill: false,
                tension: 0.1
            }));

            progressChart = new Chart(progressChartCanvas, {
                type: 'line',
                data: {
                    datasets: datasets
                },
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
        } else {
            progressChartCanvas.style.display = 'none';
        }

        // Display history entries
        workoutData[workout].forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            let historyText = `${entry.date}: ${entry.exercise} - `;
            
            if (entry.sets && Array.isArray(entry.sets)) {
                entry.sets.forEach((set, i) => {
                    historyText += `Set ${i + 1}: ${set.weight} kg x ${set.reps} reps`;
                    if (i < entry.sets.length - 1) historyText += ', ';
                });
            } else {
                historyText += 'No set data available';
            }
            
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
    } else {
        progressChartCanvas.style.display = 'none';
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
    }
}

// Edit the last entry
function editLastEntry(workout, index) {
    const entry = workoutData[workout][index];
    exerciseName.value = entry.exercise;
    setsContainer.innerHTML = ''; // Clear current sets
    generateSets(entry.sets?.length || 4); // Load existing sets or default to 4
    
    if (entry.sets && Array.isArray(entry.sets)) {
        const weightInputs = document.querySelectorAll('.set-weight');
        const repsInputs = document.querySelectorAll('.set-reps');
        entry.sets.forEach((set, i) => {
            weightInputs[i].value = set.weight;
            repsInputs[i].value = set.reps;
        });
    }

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
            date: entry.date
        });
        localStorage.setItem('workoutData', JSON.stringify(workoutData));
        alert('Entry updated successfully!');
        exerciseForm.reset();
        customExerciseInput.value = '';
        generateSets(4); // Reset to 4 sets after submission
        displayHistory(workout);
        exerciseForm.onsubmit = null; // Reset to default submit handler
    };
}
