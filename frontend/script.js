document.getElementById('submitBtn').addEventListener('click', async () => {
    const imageInput = document.getElementById('imageInput').files[0];
    const questionInput = document.getElementById('questionInput').value;

    if (!imageInput && !questionInput) {
        alert("Please provide an image or a question!");
        return;
    }

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
        addMessage(caption, "bot-message");
    }
    if (questionInput) {
        const caption = document.getElementById('messages').textContent;

        const formData = new FormData();
        formData.append('question', questionInput);
        formData.append('context', caption);

        const answerResponse = await fetch('/answer-question', {
            method: 'POST',
            body: formData
        });

        const answerData = await answerResponse.json();
        const answer = answerData.answer;
        addMessage(questionInput, "user-message");
        addMessage(answer, "bot-message");

        document.getElementById('questionInput').value = '';
    }
});

function addMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', className);
    messageElement.innerText = text;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
}
