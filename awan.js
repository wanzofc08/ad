const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let backendCodeVariable = '// Kode backend default';
let imageUrlsVariable = [];
let templateContentVariable = '<p>Tidak ada template yang diunggah.</p>';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diupload.' });
    }
    console.log('File uploaded:', req.file.originalname);
    res.json({ message: 'File berhasil diupload: ' + req.file.originalname });
});

app.post('/update-code', (req, res) => {
    const code = req.body.code;
    if (!code) {
        return res.status(400).json({ error: 'Kode tidak boleh kosong.' });
    }
    backendCodeVariable = code;
    res.json({ message: 'Kode berhasil disimpan.' });
});

app.post('/upload-template', upload.single('template'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file template yang diupload.' });
    }

    fs.readFile(req.file.path, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            templateContentVariable = '<p>Gagal membaca file template.</p>';
            return res.status(500).json({ error: 'Gagal membaca file template.' });
        }
        templateContentVariable = data;
        res.json({ message: 'Template berhasil diupload dan konten disimpan.' });
    });
});

app.get('/data', (req, res) => {
    const data = {
        backendCode: backendCodeVariable,
        imageUrls: imageUrlsVariable,
        templateContent: templateContentVariable
    };
    res.json(data);
});

app.post('/reset-data', (req, res) => {
    backendCodeVariable = '// Kode backend default';
    imageUrlsVariable = [];
    templateContentVariable = '<p>Tidak ada template yang diunggah.</p>';
    res.json({ message: 'Konten berhasil direset.' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/tolol', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
