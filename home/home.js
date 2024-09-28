
document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.getElementById('nav-menu');

    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
});
// Wait for the DOM to load before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Event listener for subscription plan buttons
    const choosePlanButtons = document.querySelectorAll('.choose-plan-btn');
    const paypalButtonContainer = document.getElementById('paypal-button-container');
  
    choosePlanButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const selectedPlan = event.target.getAttribute('data-plan');
  
        // Show PayPal button container
        paypalButtonContainer.style.display = 'block';
  
        // Load the PayPal button dynamically
        loadPayPalButton(selectedPlan);
      });
    });
  });
  
  // Function to load the PayPal button dynamically
  function loadPayPalButton(plan) {
    // Remove any existing PayPal buttons
    document.getElementById('paypal-button-container').innerHTML = '';
  
    // Load PayPal Button
    paypal.Buttons({
      createSubscription: function(data, actions) {
        return actions.subscription.create({
          'plan_id': plan // Use the selected plan ID
        });
      },
      onApprove: function(data, actions) {
        alert('Subscription successful! Thank you for subscribing.');
        // Here you can redirect the user or update the UI accordingly
      },
      onError: function(err) {
        console.error('Error during subscription process:', err);
        alert('An error occurred during the subscription process. Please try again.');
      }
    }).render('#paypal-button-container');
  }
  


  <script src="https://www.paypal.com/sdk/js?client-id=AXWvcXW-loOIGLx0Md-LSeTPDUyeL_V2BTm3b2bop-5oGje-IyMUEIboCz6KBgPPXrZ2AXvOa6X_GcOE&vault=true&intent=subscription"></script>


