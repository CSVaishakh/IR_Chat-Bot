document.getElementById('submitBtn').addEventListener('click', async () => {
    const imageInput = document.getElementById('imageInput').files[0];
    const questionInput = document.getElementById('questionInput').value;

    if (!imageInput && !questionInput) {
        alert("Please provide an image or a question!");
        return;
    }

    // If an image is uploaded, generate a caption first
    if (imageInput) {
        const formData = new FormData();
        formData.append('image', imageInput);

        // Call backend API for caption generation
        const captionResponse = await fetch('/generate-caption', {
            method: 'POST',
            body: formData
        });

        const captionData = await captionResponse.json();
        const caption = captionData.caption;

        // Add the caption to the chatbox
        addMessage(caption, "bot-message");
    }

    // If there's a question, submit it
    if (questionInput) {
        const caption = document.getElementById('messages').textContent; // Context for the question

        const formData = new FormData();
        formData.append('question', questionInput);
        formData.append('context', caption);

        const answerResponse = await fetch('/answer-question', {
            method: 'POST',
            body: formData
        });

        const answerData = await answerResponse.json();
        const answer = answerData.answer;

        // Add the user question and bot answer to the chatbox
        addMessage(questionInput, "user-message");
        addMessage(answer, "bot-message");

        // Clear input field
        document.getElementById('questionInput').value = '';
    }
});

function addMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', className);
    messageElement.innerText = text;
    document.getElementById('messages').appendChild(messageElement);

    // Scroll to the bottom of the chatbox to show the latest message
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
}
