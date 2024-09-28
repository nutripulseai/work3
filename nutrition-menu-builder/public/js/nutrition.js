document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.getElementById('nav-menu');

    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
});



// nutrition.js

// Initialize weekly calories and day-wise calories
let weeklyCalories = 0;
const dayCalories = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
};

// Function to add a recipe to a selected day
const addRecipeToDay = (recipeName, recipeCalories) => {
    const day = prompt("Enter the day of the week (Monday-Sunday):").toLowerCase();

    if (dayCalories.hasOwnProperty(day)) {
        // Add the recipe to the day's recipe list
        const dayRecipes = document.getElementById(`${day}-recipes`);
        const recipeItem = document.createElement('div');
        recipeItem.textContent = `${recipeName} (${recipeCalories} Calories)`;
        dayRecipes.appendChild(recipeItem);

        // Update the calorie count for the day
        dayCalories[day] += recipeCalories;
        document.getElementById(`${day}-calories`).textContent = dayCalories[day];

        // Update the weekly total calories and the chart
        updateWeeklyCalories();
        updateCaloriesChart();
    } else {
        alert("Invalid day. Please enter a day between Monday and Sunday.");
    }
};

// Function to update the total weekly calories
const updateWeeklyCalories = () => {
    weeklyCalories = Object.values(dayCalories).reduce((total, dayCal) => total + dayCal, 0);
    document.getElementById('weekly-calories').textContent = weeklyCalories;
};

// Initialize Chart.js and store the chart instance
let caloriesChart;

// Function to initialize the chart
const initializeChart = () => {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    caloriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Calories per Day',
                data: Object.values(dayCalories),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value) { return value; }
                    }
                }
            }
        }
    });
};

// Function to update the chart data
const updateCaloriesChart = () => {
    if (caloriesChart) {
        caloriesChart.data.datasets[0].data = Object.values(dayCalories);
        caloriesChart.update();
    }
};

// Function to show the selected category and hide others
const showCategory = (category) => {
    // Hide all recipe lists
    const allCategories = document.querySelectorAll('.recipe-list');
    allCategories.forEach(list => {
        list.style.display = 'none';
    });

    // Show the selected category's recipe list
    const selectedCategory = document.getElementById(`${category}-list`);
    if (selectedCategory) {
        selectedCategory.style.display = 'flex';
    }
};

// Initialize the chart when the page loads
window.onload = () => {
    initializeChart();
};



function toggleRecipeDetails(button) {
    const preparationDiv = button.nextElementSibling;

    if (preparationDiv.style.display === "none" || preparationDiv.style.display === "") {
        preparationDiv.style.display = "block";
        button.textContent = "Hide Recipe";
    } else {
        preparationDiv.style.display = "none";
        button.textContent = "View Recipe";
    }
}
