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
