
document.getElementById('bmr-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseInt(document.getElementById('height').value);
    const activityLevel = document.getElementById('activity-level').value;
    const goal = document.getElementById('goal').value;
    
    let bmr;
    
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    let calories;
    
    switch (activityLevel) {
        case 'sedentary':
            calories = bmr * 1.2;
            break;
        case 'lightly-active':
            calories = bmr * 1.375;
            break;
        case 'moderately-active':
            calories = bmr * 1.55;
            break;
        case 'very-active':
            calories = bmr * 1.725;
            break;
        case 'super-active':
            calories = bmr * 1.9;
            break;
        default:
            calories = bmr * 1.2;
    }
    
    let adjustedCalories;
    
    switch (goal) {
        case 'maintain':
            adjustedCalories = calories;
            break;
        case 'tone':
            adjustedCalories = calories - 500; // Caloric deficit for toning
            break;
        case 'mass':
            adjustedCalories = calories + 500; // Caloric surplus for gaining mass
            break;
        case 'healthy':
            adjustedCalories = calories;
            break;
        default:
            adjustedCalories = calories;
    }
    
    document.getElementById('result').innerHTML = `Your BMR is ${bmr.toFixed(2)} calories/day.<br>
        To maintain your weight, you need approximately ${calories.toFixed(2)} calories/day.<br>
        For your goal of ${goal.replace('-', ' ')}, you should consume around ${adjustedCalories.toFixed(2)} calories/day.`;
});


