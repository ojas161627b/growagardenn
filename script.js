const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const statusText = document.getElementById("status");
const audioPlayer = document.getElementById("audio-player");
const downloadLink = document.getElementById("download-link");

let mediaRecorder;
let audioChunks = [];

startButton.addEventListener("click", async () => {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create media recorder
        mediaRecorder = new MediaRecorder(stream);

        // Collect audio chunks
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        // Start recording
        mediaRecorder.start();
        statusText.textContent = "Recording...";

        // Show stop button and hide start button
        startButton.style.display = "none";
        stopButton.style.display = "inline-block";

        stopButton.addEventListener("click", () => {
            // Stop recording when the stop button is clicked
            mediaRecorder.stop();
            statusText.textContent = "Stopped recording.";

            // Automatically save the file after recording
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;

            // Prepare the form data to upload
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.wav");

            // Upload the audio file to the server
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Audio uploaded successfully:', data);
            })
            .catch(error => {
                console.error('Error uploading audio:', error);
            });

            // Create a download link
            downloadLink.href = audioUrl;
            downloadLink.download = "recording.wav";
            downloadLink.style.display = "block";
            downloadLink.textContent = "Download Recording";
        });
    } catch (error) {
        statusText.textContent = "Microphone access denied or error occurred.";
        console.error(error);
    }
});

