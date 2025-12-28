const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Create 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Setup multer to save uploaded audio files
const upload = multer({
    dest: uploadDir, // Files will be saved in the 'uploads' folder
    limits: { fileSize: 50 * 1024 * 1024 }, // Max size 50MB
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint for uploading audio files
app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log the uploaded file details for debugging
    console.log('File received:', req.file);

    // Create a unique file path to avoid collisions
    const filePath = path.join(uploadDir, `${Date.now()}.mp3`);

    // Rename the file to the new unique name
    try {
        fs.renameSync(req.file.path, filePath);
        console.log(`File saved at: ${filePath}`);
    } catch (error) {
        console.error('Error renaming file:', error);
        return res.status(500).json({ message: 'Error saving file' });
    }

    // Respond with the file URL (publicly accessible)
    res.json({ url: `/uploads/${path.basename(filePath)}`, name: path.basename(filePath) });
});

// Endpoint to list saved files
app.get('/list-files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
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

// Serve uploaded files as static content
app.use('/uploads', express.static(uploadDir));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

