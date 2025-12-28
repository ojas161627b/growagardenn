const startButton = document.getElementById("start-recording");
const statusText = document.getElementById("status");
const audioPlayer = document.getElementById("audio-player");
const downloadLink = document.getElementById("download-link");

startButton.addEventListener("click", async () => {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create a media recorder
        const mediaRecorder = new MediaRecorder(stream);

        // Store audio data
        let audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        // When the recording stops
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;

            // Create a downloadable link
            downloadLink.href = audioUrl;
            downloadLink.download = "recording.wav";  // File name
            downloadLink.style.display = "block";  // Show the download link
            downloadLink.textContent = "Download Recording";  // Link text
        };

        // Start recording
        mediaRecorder.start();
        statusText.textContent = "Recording...";

        // Automatically stop recording after 5 seconds (adjust if needed)
        setTimeout(() => {
            mediaRecorder.stop();
            statusText.textContent = "Stopped recording.";
        }, 5000);  // Stops after 5 seconds
    } catch (error) {
        statusText.textContent = "Microphone access denied or error occurred.";
        console.error(error);
    }
});