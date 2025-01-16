// Install necessary dependencies before using this script:
// npm install express multer adm-zip

const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

// Serve a basic HTML file for uploads
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Upload a ZIP file</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="file" accept=".zip" required />
          <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

// Handle file upload and extraction
app.post('/upload', upload.single('file'), (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).send('No file uploaded.');
  }

  const zipPath = path.join(__dirname, uploadedFile.path);
  const extractPath = path.join(__dirname, 'extracted', path.basename(uploadedFile.originalname, '.zip'));

  try {
    // Extract the ZIP file
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // Check for EXE files
    const files = fs.readdirSync(extractPath);
    const exeFiles = files.filter(file => path.extname(file).toLowerCase() === '.exe');

    if (exeFiles.length === 0) {
      return res.send('No EXE files found in the ZIP.');
    }

    // For demonstration, just list the EXE files
    res.send(`Extracted EXE files: <ul>${exeFiles.map(file => `<li>${file}</li>`).join('')}</ul>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing the ZIP file.');
  } finally {
    // Clean up uploaded ZIP file
    fs.unlinkSync(zipPath);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
