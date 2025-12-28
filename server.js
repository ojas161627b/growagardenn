const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Setup multer to save uploaded audio files
const upload = multer({
    dest: 'uploads/', // Files will be saved in the 'uploads' folder
    limits: { fileSize: 50 * 1024 * 1024 }, // Max size 50MB
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint for uploading audio files
app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Move the uploaded file to the desired directory
    const filePath = path.join(__dirname, 'uploads', `${Date.now()}.mp3`);
    fs.renameSync(req.file.path, filePath); // Rename the file to avoid collisions

    // Respond with the file URL (publicly accessible)
    res.json({ url: `/uploads/${path.basename(filePath)}`, name: path.basename(filePath) });
});

// Endpoint to list saved files
app.get('/list-files', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file directory' });
        }
        const fileList = files.map(file => ({
            name: file,
            url: `/uploads/${file}`,
        }));
        res.json(fileList);
    });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

