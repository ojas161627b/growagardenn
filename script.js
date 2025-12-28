// Get references to HTML elements
const startButton = document.getElementById('start-recording');
const stopButton = document.getElementById('stop-recording');
const audioPlayer = document.getElementById('audio-player');
const showSavedButton = document.getElementById('show-saved-button');
const savedFilesContainer = document.getElementById('saved-files-container');
const savedFilesList = document.getElementById('saved-files-list');

// Set up variables for recording
let mediaRecorder;
let audioChunks = [];

// Start recording when the "Start Recording" button is clicked
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    stopButton.style.display = 'inline-block';
    document.getElementById('status').innerText = 'Recording...';

    // Get access to the microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayer.src = audioUrl;
                audioPlayer.style.display = 'inline-block';

                // Show the download link
                const downloadLink = document.getElementById('download-link');
                downloadLink.href = audioUrl;
                downloadLink.download = 'recording.mp3';
                downloadLink.style.display = 'inline-block';

                // Reset for next recording
                audioChunks = [];
            };

            mediaRecorder.start();
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            document.getElementById('status').innerText = 'Could not access microphone.';
        });
});

// Stop recording when the "Stop Recording" button is clicked
stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startButton.style.display = 'inline-block';
    stopButton.style.display = 'none';
    document.getElementById('status').innerText = 'Click "Start Recording" to begin.';
    
    // Upload the recording
    uploadRecording();
});

// Upload the recorded audio to the server
function uploadRecording() {
    const formData = new FormData();
    formData.append('audio', audioPlayer.src); // Send audio as form data

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload successful:', data);
    })
    .catch(error => {
        console.error('Upload failed:', error);
    });
}

// Show saved MP3 files when the "Show Saved MP3 Files" button is clicked
showSavedButton.addEventListener('click', () => {
    console.log('Fetching saved files...');  // Log request to console

    fetch('/list-files')  // Endpoint to get all saved MP3 files
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch saved files');
            }
            return response.json();
        })
        .then(files => {
            console.log('Fetched saved files:', files);  // Log fetched files to console
            savedFilesList.innerHTML = '';  // Clear existing list

            if (files.length === 0) {
                savedFilesList.innerHTML = '<li>No saved files found.</li>';
            } else {
                files.forEach(file => {
                    const listItem = document.createElement('li');
                    const audioElement = document.createElement('audio');
                    audioElement.src = file.url;
                    audioElement.controls = true;

                    const downloadLink = document.createElement('a');
                    downloadLink.href = file.url;
                    downloadLink.textContent = file.name;
                    downloadLink.download = file.name;

                    listItem.appendChild(audioElement);
                    listItem.appendChild(downloadLink);
                    savedFilesList.appendChild(listItem);
                });
            }

            savedFilesContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching saved files:', error);
            savedFilesContainer.style.display = 'none';
            alert('There was an issue fetching saved files.');
        });
});

