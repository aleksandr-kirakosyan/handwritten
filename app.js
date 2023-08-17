const express = require('express');
const handwritten = require('handwritten.js');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-pdf', (req, res) => {
    const rawtext = req.body.text;

    if (rawtext) {
        handwritten(rawtext).then((converted) => {
            const outputPath = path.join(__dirname, 'output.pdf');
            const pdfStream = converted.pipe(fs.createWriteStream(outputPath));
            
            pdfStream.on('finish', () => {
                res.download(outputPath, 'output.pdf', (err) => {
                    if (err) {
                        res.status(500).send('Error downloading PDF.');
                    }
                    // Delete the generated PDF after download (optional)
                    fs.unlinkSync(outputPath);
                });
            });
        });
    } else {
        res.status(400).send('Text input is required.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
