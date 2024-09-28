document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.getElementById('nav-menu');

    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
});

let currentExercise = 1;
let totalExercises = 7;
let exerciseTime = 30; // Time for each exercise in seconds (variable)
let breakTime = 60; // Break time in seconds
let exerciseTimerInterval = null;
let breakTimerInterval = null;
let progressBarIncrement = 100 / totalExercises;
let isTransitioning = false;
let isWorkoutPaused = false;
let isSpeaking = false;

// Function to start the workout
function startWorkout() {
    document.getElementById('start-workout-section').style.display = 'none';
    document.getElementById('exercise-container').style.display = 'block';
    startExercise(1);
}

// Function to start the exercise with a timer
function startExercise(exerciseNumber) {
    if (isWorkoutPaused) return;

    let exerciseElement = document.getElementById(`exercise${exerciseNumber}`);
    exerciseElement.style.display = 'block';

    announceExercise(exerciseNumber);

    exerciseTimerInterval = setTimeout(() => {
        completeExercise(exerciseNumber);
    }, exerciseTime * 1000); // Automatically complete exercise after the timer ends
}

// Function to announce the current exercise
function announceExercise(exerciseNumber) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
    }

    let exerciseElement = document.getElementById(`exercise${exerciseNumber}`);
    let exerciseName = exerciseElement.querySelector('h2').innerText;

    let utterance = new SpeechSynthesisUtterance(exerciseName);
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
    isSpeaking = true;

    utterance.onend = function() {
        isSpeaking = false;
    };
}

// Function to complete the current exercise
function completeExercise(exerciseNumber) {
    if (isTransitioning || isWorkoutPaused) return;

    isTransitioning = true;

    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
    }

    document.getElementById(`exercise${exerciseNumber}`).style.display = 'none';
    updateProgressBar();

    if (exerciseNumber < totalExercises) {
        document.getElementById('break-container').style.display = 'block';
        startBreakTimer();
    } else {
        completeWorkout();
        isTransitioning = false;
    }
}

// Function to start the break timer
function startBreakTimer() {
    let breakStartUtterance = new SpeechSynthesisUtterance('Break Time');
    breakStartUtterance.lang = 'en-US';
    breakStartUtterance.volume = 1.0;
    speechSynthesis.speak(breakStartUtterance);

    if (breakTimerInterval) {
        clearInterval(breakTimerInterval);
    }

    document.getElementById('break-timer').innerText = breakTime;

    breakTimerInterval = setInterval(() => {
        if (breakTime > 0) {
            breakTime--;
            document.getElementById('break-timer').innerText = breakTime;

            if (breakTime <= 10 && breakTime > 0) {
                let countdownUtterance = new SpeechSynthesisUtterance(breakTime.toString());
                countdownUtterance.lang = 'en-US';
                countdownUtterance.volume = 1.0;
                speechSynthesis.speak(countdownUtterance);
            }
        } else {
            clearInterval(breakTimerInterval);
            breakTimerInterval = null;
            document.getElementById('break-container').style.display = 'none';

            playWhistleSound();
        }
    }, 1000);
}

// Function to play the whistle sound and start the next exercise
function playWhistleSound() {
    let whistleSound = document.getElementById('whistle-sound');
    if (whistleSound) {
        whistleSound.play().catch(error => {
            console.error('Failed to play whistle sound:', error);
        });
    }

    setTimeout(() => {
        if (currentExercise < totalExercises) {
            startExercise(++currentExercise);
        } else {
            completeWorkout();
        }
        isTransitioning = false;
    }, 0);
}

// Function to update the progress bar
function updateProgressBar() {
    let progressElement = document.querySelector('.progress');
    progressElement.style.width = `${currentExercise * progressBarIncrement}%`;
}

// Function to complete the workout
function completeWorkout() {
    stopAllMusic();
    announceWorkoutCompleted();
    document.getElementById('training-completed-section').style.display = 'block';
}

// Function to announce workout completion
function announceWorkoutCompleted() {
    let utterance = new SpeechSynthesisUtterance('Workout Completed');
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
}

// Attach link to the button
document.getElementById('completed-link-btn').addEventListener('click', () => {
    window.location.href = 'your-link-here'; // Replace 'your-link-here' with the actual URL you want to navigate to
});
