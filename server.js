const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Create an 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up multer to store the file in the 'uploads' folder
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name based on timestamp
    }
});

const upload = multer({ storage: storage });

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static('public'));

// Route to handle the audio file upload
app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File uploaded:', req.file);
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

// Admin route to access files (you can set permissions here)
app.use('/admin', express.static(uploadsDir));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
