
let currentExercise = 1;
let totalExercises = 40;
let breakTime = 30;
let progressBarIncrement = 100 / totalExercises;
let breakTimerInterval = null;
let isTransitioning = false;
let isWorkoutPaused = false;
let isSpeaking = false;
let exerciseTimerInterval = null;
const totalCalories = 800; // Total calories to be burned in the workout
const caloriesPerExercise = totalCalories / totalExercises; // Calories burned per exercise
let caloriesBurned = 0; // Initialize calories burned



function startExerciseTimer(duration) {
    // Clear any existing exercise timer intervals
    if (exerciseTimerInterval) {
        clearInterval(exerciseTimerInterval);
        exerciseTimerInterval = null;
    }

    // Ensure the timer is visible
    const timerDisplay = document.getElementById('exercise-timer');
    timerDisplay.innerText = duration; // Set initial timer display
    timerDisplay.style.display = 'block';

    let exerciseTime = duration; // Initialize exercise time

    // Stop any ongoing speech synthesis
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    // Set up the interval to update the exercise timer
    exerciseTimerInterval = setInterval(() => {
        // Update the remaining time
        if (exerciseTime > 0) {
            exerciseTime--;
            timerDisplay.innerText = exerciseTime; // Update the timer display

            // Announce the countdown only if it's the last 10 seconds
            if (exerciseTime <= 10 && exerciseTime > 0 && !speechSynthesis.speaking) {
                let countdownUtterance = new SpeechSynthesisUtterance(exerciseTime.toString());
                countdownUtterance.lang = 'en-US';
                countdownUtterance.volume = 1.0;
                speechSynthesis.speak(countdownUtterance);
            }
        } else {
            // Clear the timer when exercise time is over
            clearInterval(exerciseTimerInterval);
            exerciseTimerInterval = null;
            timerDisplay.innerText = '0'; // Show 0 when timer ends

            // Announce "Exercise Complete"
            let exerciseCompleteUtterance = new SpeechSynthesisUtterance('Exercise Complete');
            exerciseCompleteUtterance.lang = 'en-US';
            exerciseCompleteUtterance.volume = 1.0;
            speechSynthesis.speak(exerciseCompleteUtterance);

            // Complete the exercise when timer ends
            completeExercise();
        }

        // Debugging output
        console.log(`Exercise time: ${exerciseTime}`);
    }, 1000);

    // Debugging output
    console.log(`Exercise timer started for ${duration} seconds`);
}






const exerciseDurations = {
    1: 60, // Exercise 1 duration in seconds
    2: 60, // Exercise 2 duration in seconds
    3: 60, // Exercise 3 duration in seconds
    4: 60, // Exercise 3 duration in seconds
    5: 60, // Exercise 3 duration in seconds
    6: 60, // Exercise 3 duration in seconds
    7: 60, // Exercise 3 duration in seconds
    8: 60, // Exercise 3 duration in seconds
    9: 60, // Exercise 3 duration in seconds
    10: 60, // Exercise 1 duration in seconds
    11: 60, // Exercise 2 duration in seconds
    12: 60, // Exercise 3 duration in seconds
    13: 60, // Exercise 3 duration in seconds
    14: 60, // Exercise 3 duration in seconds
    15: 60, // Exercise 3 duration in seconds
    16: 60, // Exercise 3 duration in seconds
    17: 60, // Exercise 3 duration in seconds
    18: 60, // Exercise 3 duration in seconds
    19: 60, // Exercise 1 duration in seconds
    20: 60, // Exercise 2 duration in seconds
    21: 60, // Exercise 3 duration in seconds
    22: 60, // Exercise 3 duration in seconds
    23: 60, // Exercise 3 duration in seconds
    24: 60, // Exercise 3 duration in seconds
    25: 60, // Exercise 3 duration in seconds
    26: 60, // Exercise 3 duration in seconds
    27: 60, // Exercise 3 duration in seconds
    28: 60, // Exercise 1 duration in seconds
    29: 60, // Exercise 2 duration in seconds
    30: 60, // Exercise 3 duration in seconds
    31: 60, // Exercise 3 duration in seconds
    32: 60, // Exercise 3 duration in seconds
    33: 60, // Exercise 3 duration in seconds
    34: 60, // Exercise 3 duration in seconds
    35: 60, // Exercise 3 duration in seconds
    36: 60, // Exercise 3 duration in seconds
    37: 60, // Exercise 1 duration in seconds
    38: 60, // Exercise 2 duration in seconds
    39: 60, // Exercise 3 duration in seconds
    40: 120, // Exercise 3 duration in seconds
};
// Function to open the song library modal
function openSongLibrary() {
document.getElementById('song-library').style.display = 'block';
}

// Function to close the song library modal
function closeSongLibrary() {
document.getElementById('song-library').style.display = 'none';
}

// Add event listeners for opening and closing the song library modal
document.getElementById('open-directory-btn').addEventListener('click', openSongLibrary);
document.querySelector('.close-btn').addEventListener('click', closeSongLibrary);

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
if (event.target === document.getElementById('song-library')) {
    closeSongLibrary();
}
});

// Function to play a specific song
function playSong(songId) {
    stopAllMusic();
    let song = document.getElementById(songId);
    if (song) {
        song.volume = 0.3;
        song.play().catch(error => {
            console.error(`Failed to play song with ID ${songId}:`, error);
        });
        song.onended = function() {
            let nextSongId = getNextSongId(songId);
            if (nextSongId) {
                playSong(nextSongId);
            }
        };
    } else {
        console.error(`Song with ID ${songId} not found.`);
    }
}

// Function to get the ID of the next song
function getNextSongId(currentSongId) {
let songIds = ['song1', 'song2', 'song3', 'song4', 'song5', 'song6', 'song7', 'song8', 'song9', 'song10', 'song11', 'song12', 'song13', 'song14', 'song15', 'song16', 'song17', 'song18', 'song19', 'song20', 'song21', 'song22', 'song23', 'song24', 'song25', 'song26', 'song27', 'song28', 'song29', 'song30', 'song31', 'song32', 'song33', 'song34', 'song35', 'song36', 'song37', 'song38','song39', 'song40', 'song41', 'song42', 'song43', 'song44', 'song45', 'song46', 'song47', 'song48', 'song49', 'song50', 'whistle-sound'];
let currentIndex = songIds.indexOf(currentSongId);
return songIds[currentIndex + 1] || null;
}

// Function to stop all music
function stopAllMusic() {
let songs = document.querySelectorAll('audio[id^="song"]');
songs.forEach(song => {
    song.pause();
    song.currentTime = 0;
});
}

// Function to start the workout
function startWorkout() {
document.getElementById('start-workout-section').style.display = 'none';
document.getElementById('exercise-container').style.display = 'block';

// Make the exercise timer visible
document.getElementById('exercise-timer').style.display = 'block';

startExercise(1);
}

// Function to start the exercise
function startExercise(exerciseNumber) {
    if (isWorkoutPaused) return;

    // Hide the previous exercise if it's not the first exercise
    if (currentExercise > 1) {
        let previousExerciseElement = document.getElementById(`exercise${currentExercise}`);
        if (previousExerciseElement) {
            previousExerciseElement.style.display = 'none';
        }
    }

    // Update currentExercise to the new exercise
    currentExercise = exerciseNumber;

    let exerciseElement = document.getElementById(`exercise${exerciseNumber}`);
    if (exerciseElement) {
        exerciseElement.style.display = 'block';

        // Get the duration for the current exercise
        let exerciseDuration = exerciseDurations[exerciseNumber] || 30; // Default to 30 seconds if not defined

        // Show the exercise timer and hide the break timer
        document.getElementById('exercise-timer').style.display = 'block';
        document.getElementById('break-container').style.display = 'none';

        // Get the exercise name from the <h2> element
        let exerciseName = exerciseElement.querySelector('h2') ? exerciseElement.querySelector('h2').innerText : 'Exercise';

        // Cancel any ongoing speech to avoid overlap
        speechSynthesis.cancel();

        // Create and speak the exercise name
        let exerciseNameUtterance = new SpeechSynthesisUtterance(exerciseName);
        exerciseNameUtterance.lang = 'en-US';
        exerciseNameUtterance.volume = 1.0;

        // Start the exercise timer immediately
        startExerciseTimer(exerciseDuration);

        // Start the speech
        speechSynthesis.speak(exerciseNameUtterance);

        // Handle completion of speech
        exerciseNameUtterance.onend = () => {
            console.log(`Starting Exercise ${exerciseNumber}: ${exerciseName}`);
        };

        // Log current state for debugging
        console.log(`Starting Exercise ${exerciseNumber}: ${exerciseName}`);
    } else {
        console.error(`Exercise element with ID exercise${exerciseNumber} not found.`);
    }
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

function completeExercise() {
    if (isTransitioning || isWorkoutPaused) return;

    isTransitioning = true;

    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
    }

    // Hide the current exercise
    let currentExerciseNumber = currentExercise;
    let currentExerciseElement = document.getElementById(`exercise${currentExerciseNumber}`);
    if (currentExerciseElement) {
        currentExerciseElement.style.display = 'none';
    }

    updateProgressBar();

    // Hide the exercise timer
    document.getElementById('exercise-timer').style.display = 'none';

    // Determine if there's a need for a break and transition accordingly
    if (currentExercise < totalExercises) {
        // Show and start the break timer only if there are more exercises
        document.getElementById('break-container').style.display = 'block';
        startBreakTimer();
    } else {
        // End workout if all exercises are completed
        stopAllMusic();
        document.getElementById('training-completed-section').style.display = 'block';
        console.log('All exercises completed.');
        isTransitioning = false; // Reset transitioning flag
        return; // Exit function
    }

    // Move to the next exercise after the break
    setTimeout(() => {
        if (currentExercise < totalExercises) {
            currentExercise++; // Move to the next exercise
            startExercise(currentExercise); // Start the next exercise
        }
        isTransitioning = false; // Ensure this is reset
    }, breakDuration * 1000); // Assuming breakDuration is in seconds
}


// Function to start exercise timer



// Function to start the break timer


function startBreakTimer() {
    // Announce the start of the break, if not a continuation of an added break
    if (typeof breakTime !== 'number' || breakTime <= 0) {
        breakTime = 30; // Default break time if not properly set
    }

    let breakStartUtterance = new SpeechSynthesisUtterance('Break Time');
    breakStartUtterance.lang = 'en-US';
    breakStartUtterance.volume = 1.0;
    speechSynthesis.speak(breakStartUtterance);

    // Clear any existing break timer intervals
    if (breakTimerInterval) {
        clearInterval(breakTimerInterval);
    }

    // Initialize the break time display
    document.getElementById('break-timer').innerText = breakTime;

    // Show the break container and hide the exercise timer
    document.getElementById('break-container').style.display = 'block';
    document.getElementById('exercise-timer').style.display = 'none';

    // Set up the interval to update the break timer
    breakTimerInterval = setInterval(() => {
        if (breakTime > 0) {
            breakTime--;
            document.getElementById('break-timer').innerText = breakTime;

            // Announce the countdown every second if it's 10 seconds or less
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

            // Play the whistle sound immediately
            playWhistleSound();

            // Transition to the next exercise or end the workout
            completeExercise(); // Ensure this function properly handles moving to the next exercise or ending the workout
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

// Start the next exercise immediately after playing the whistle sound
setTimeout(() => {
    if (currentExercise < totalExercises) {
        startExercise(++currentExercise);
    } else {
        stopAllMusic();
        document.getElementById('training-completed-section').style.display = 'block';
    }
    isTransitioning = false;
}, 0); // No delay
}

// Function to add break time
function addBreakTime() {
    // Ensure breakTime is defined and is a number
    if (typeof breakTime === 'number') {
        breakTime += 20; // Add 20 seconds to the current break time
        
        // Update the break timer display
        document.getElementById('break-timer').innerText = breakTime;

        // If the break timer is currently running, reset it with the updated time
        if (breakTimerInterval) {
            clearInterval(breakTimerInterval);
            startBreakTimer(); // Restart the timer with the updated break time
        }
    } else {
        console.error('breakTime is not a number');
    }
}
// Function to update the progress bar
function updateProgressBar() {
    // Select the progress bar and calories text elements
    let progressElement = document.querySelector('.progress');
    let caloriesTextElement = document.getElementById('calories-burned');

    // Calculate and update the width of the progress bar
    let progressPercentage = currentExercise * progressBarIncrement;
    progressElement.style.width = `${progressPercentage}%`;

    // Update calories burned
    caloriesBurned += caloriesPerExercise;
    caloriesTextElement.innerText = `${caloriesBurned.toFixed(0)}🔥`;

    // Calculate the width of the progress bar container
    let progressBarContainer = progressElement.parentElement;
    let containerWidth = progressBarContainer.offsetWidth;

    // Calculate the width of the calories text
    let textWidth = caloriesTextElement.offsetWidth;

    // Calculate the position of the calories text
    let maxLeftPosition = containerWidth - textWidth;
    let leftPosition = progressPercentage * containerWidth / 100 - textWidth / 2;

    // Ensure the text does not overflow the container
    leftPosition = Math.max(0, Math.min(leftPosition, maxLeftPosition));

    // Set the position of the calories text
    caloriesTextElement.style.left = `${leftPosition}px`;
}



// Function to pause the workout
function pauseWorkout() {
isWorkoutPaused = true;

if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
}
stopAllMusic();
}

// Function to resume the workout
function resumeWorkout() {
isWorkoutPaused = false;
if (currentExercise <= totalExercises) {
    startExercise(currentExercise);
}
}

// Function to complete the workout
function completeWorkout() {
stopAllMusic();
document.getElementById('training-completed-section').style.display = 'block';
}