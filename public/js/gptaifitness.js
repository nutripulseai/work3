document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.getElementById('nav-menu');

    // Toggle menu visibility
    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Load chat history when the page loads
    loadChatHistory();
});

// Fetch user email dynamically from a meta tag
const userEmail = document.querySelector('meta[name="user-email"]').getAttribute('content');

async function sendMessage() {
    const inputField = document.getElementById('input');
    const messagesContainer = document.getElementById('messages');
    const loadingIndicator = document.getElementById('loading');

    console.log('Send button clicked'); // Debug message

    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    try {
        // Show loading indicator
        loadingIndicator.style.display = 'block';

        // Check subscription status before sending message
        const response = await fetch(`/check-subscription?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        console.log('Subscription check response:', data); // Debug log

        if (!data.active) {
            displaySubscriptionPrompt();
            loadingIndicator.style.display = 'none'; // Hide loading indicator
            return;
        }

        // Proceed with sending the message if subscription is active
        const sendMessageResponse = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (sendMessageResponse.status === 403) {
            displaySubscriptionPrompt();
            loadingIndicator.style.display = 'none'; // Hide loading indicator
            return;
        }

        const responseData = await sendMessageResponse.json();
        const botMessage = formatMessage(responseData.reply.trim());

        // Hide loading animation
        loadingIndicator.style.display = 'none';

        // Add AI's message to the chat with copy button
        const botMessageElement = `
            <div class="ai-message">
                <p>${botMessage}</p>
                <button class="copy-button" onclick="copyToClipboard(this)">Copy</button>
            </div>
        `;
        messagesContainer.innerHTML += botMessageElement;

        // Save the message to localStorage
        saveMessageToLocalStorage('bot', responseData.reply.trim());

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        displaySubscriptionPrompt();
        loadingIndicator.style.display = 'none'; // Hide loading indicator
    }
}

function displaySubscriptionPrompt() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML += `
        <div class="subscription-prompt">
            <p>You need an active subscription to talk to the chat. Please <a href="/plan" target="_blank">buy a subscription</a> to continue.</p>
            <button class="close-prompt" onclick="this.parentElement.remove()">Close</button>
        </div>
    `;
}

function formatMessage(message) {
    // Replace newline characters with <br> tags
    return message.replace(/\n/g, '<br>');
}

function copyToClipboard(button) {
    // Get the text content of the message
    const messageText = button.previousElementSibling.innerHTML.trim();

    // Use the Clipboard API for copying text
    navigator.clipboard.writeText(messageText.replace(/<br>/g, '\n')).then(() => {
        alert('Message copied to clipboard!');
    }).catch(err => {
        console.error('Error copying text: ', err);
    });
}

function saveMessageToLocalStorage(sender, message) {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ sender, message });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function loadChatHistory() {
    const messagesContainer = document.getElementById('messages');
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

    chatHistory.forEach(entry => {
        const formattedMessage = formatMessage(entry.message);
        if (entry.sender === 'user') {
            messagesContainer.innerHTML += `<div class="user-message">${formattedMessage}</div>`;
        } else if (entry.sender === 'bot') {
            messagesContainer.innerHTML += `
                <div class="ai-message">
                    <p>${formattedMessage}</p>
                    <button class="copy-button" onclick="copyToClipboard(this)">Copy</button>
                </div>
            `;
        }
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
