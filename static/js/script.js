function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message to chat
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
        <div class="message user">
            <div class="message-content">${message}</div>
            <div class="message-avatar">You</div>
        </div>
    `;
    input.value = '';
    
    // Show typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'block';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send to AI
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: message})
    })
    .then(response => response.json())
    .then(data => {
        // Hide typing indicator
        typingIndicator.style.display = 'none';
        
        if (data.success) {
            chatMessages.innerHTML += `
                <div class="message ai">
                    <div class="message-avatar">AI</div>
                    <div class="message-content">
                        <strong>DiaMind:</strong> ${data.response}
                    </div>
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        typingIndicator.style.display = 'none';
        alert('Error sending message');
    });
}

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        chatInput.focus();
    }
});