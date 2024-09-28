document.addEventListener('DOMContentLoaded', () => {
    // Example: You can add functionalities here, e.g., handling button clicks or AJAX requests.

    // Example: Adding event listener to the "Renew Subscription" button
    const renewButton = document.querySelector('.btn-renew');
    if (renewButton) {
        renewButton.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Redirecting to subscription renewal page...');
            window.location.href = renewButton.href;
        });
    }

    // Example: Adding event listener to the "Subscribe Now" button
    const subscribeButton = document.querySelector('.btn-subscribe');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Redirecting to subscription page...');
            window.location.href = subscribeButton.href;
        });
    }
});
