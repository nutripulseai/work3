
document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.getElementById('nav-menu');

    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
});


let currentExercise = 1;
let totalExercises = 5;
let breakTime = 60;
let progressBarIncrement = 100 / totalExercises;
let breakTimerInterval = null;
let isTransitioning = false;
let isWorkoutPaused = false;
let isSpeaking = false;

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
    startExercise(1);
}

// Function to start the exercise
function startExercise(exerciseNumber) {
    if (isWorkoutPaused) return;
    
    let exerciseElement = document.getElementById(`exercise${exerciseNumber}`);
    exerciseElement.style.display = 'block';

    announceExercise(exerciseNumber);
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
        stopAllMusic();
        alert('Workout Complete!');
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

    breakTime = 60;
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

            // Play the whistle sound immediately
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

    // Start the next exercise immediately after playing the whistle sound
    setTimeout(() => {
        if (currentExercise < totalExercises) {
            startExercise(++currentExercise);
        } else {
            stopAllMusic();
            alert('Workout Complete!');
        }
        isTransitioning = false;
    }, 0); // No delay
}

// Function to add break time
function addBreakTime() {
    breakTime += 20;
    document.getElementById('break-timer').innerText = breakTime;
}

// Function to update the progress bar
function updateProgressBar() {
    let progressElement = document.querySelector('.progress');
    progressElement.style.width = `${currentExercise * progressBarIncrement}%`;
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
        stopAllMusic();
        document.getElementById('training-completed-section').style.display = 'block';
        isTransitioning = false;
    }
}

// Function to add a link to the button
document.getElementById('completed-link-btn').addEventListener('click', function() {
    window.location.href = 'YOUR_LINK_HERE';
});










function completeWorkout() {
    stopAllMusic();  // Stop any ongoing music
    announceWorkoutCompleted();  // Play the voice announcement

    // Show the training completed section
    document.getElementById('training-completed-section').style.display = 'block';
}

function announceWorkoutCompleted() {
    let utterance = new SpeechSynthesisUtterance('Workout Completed');
    utterance.lang = 'en-US';  // Use English
    utterance.volume = 1.0;    // Set volume (0.0 to 1.0)
    utterance.rate = 1;        // Set speech rate (0.1 to 10)
    utterance.pitch = 1;       // Set pitch (0 to 2)

    // Speak the announcement
    speechSynthesis.speak(utterance);
}

// Attach link to the button
document.getElementById('completed-link-btn').addEventListener('click', () => {
    window.location.href = 'your-link-here'; // Replace 'your-link-here' with the actual URL you want to navigate to
});

// Function to handle button click
