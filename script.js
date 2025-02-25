body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1, h2 {
    color: #333;
}

section {
    margin-bottom: 30px;
}

/* Form Styling */
#exercise-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

    .form-group label {
        font-weight: bold;
        margin-bottom: 5px;
        color: #333; /* Darker color for better contrast (accessibility) */
    }

    .form-group select,
    .form-group input {
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #fafafa;
        transition: border-color 0.3s;
    }

        .form-group select:focus,
        .form-group input:focus {
            border-color: #28a745;
            border-width: 2px; /* Thicker border for better focus visibility (accessibility) */
            outline: none;
        }

button {
    padding: 8px 16px; /* Reduced padding for smaller size */
    background: linear-gradient(45deg, #28a745, #34d058); /* Gradient for modern look */
    color: white;
    border: none;
    border-radius: 6px; /* Slightly larger radius for modern feel */
    font-size: 14px; /* Smaller font size */
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
    transition: background 0.3s, transform 0.1s, box-shadow 0.3s;
}

    button:hover {
        background: linear-gradient(45deg, #218838, #28a745); /* Darker gradient on hover */
        transform: translateY(-2px); /* Slight lift on hover */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Enhanced shadow on hover */
    }

    button:active {
        transform: translateY(0); /* Reset on click */
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Reduced shadow on click */
    }

/* History and Routine Styling */
#history-list, #suggested-routine {
    margin-top: 15px;
}

.history-item, .routine-item {
    padding: 12px;
    border-bottom: 1px solid #eee;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 5px;
    animation: fadeIn 0.5s ease-in; /* Fade-in animation for visual feedback */
}

#suggested-routine {
    padding: 15px;
    background-color: #f0f0f0;
    border-radius: 4px;
}

    #suggested-routine h3 {
        margin-top: 0;
        font-size: 18px;
        color: #444;
    }

/* Set Inputs Styling */
#sets-container {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.set-input {
    display: flex;
    align-items: center;
    gap: 10px;
}

    .set-input label {
        font-weight: bold;
        color: #333; /* Darker color for better contrast (accessibility) */
        width: 60px;
    }

    .set-input input {
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #fafafa;
        flex-grow: 1;
    }

        .set-input input:focus {
            border-color: #28a745;
            border-width: 2px; /* Thicker border for better focus visibility (accessibility) */
            outline: none;
        }

/* Animation for History Items */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Responsive Design */
@media (max-width: 600px) {
    .container {
        margin: 20px;
        padding: 15px;
    }
    .set-input {
        flex-direction: column;
        align-items: flex-start;
    }
}
