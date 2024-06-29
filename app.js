const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const {unlink} = require("fs");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

// In-memory poster storage
let posters = [
];

// Routes
app.get('/api/posters', (req, res) => {
    res.json(posters);
});

app.post('/api/posters', upload.single('image'), (req, res) => {
    const {title, x, y, width, height} = req.body;
    const newPoster = {
        id: posters.length + 1,
        title,
        imageUrl: `/uploads/${req.file.filename}`,
        x: parseInt(x),
        y: parseInt(y),
        width: parseFloat(width),
        height: parseFloat(height)
    };
    console.log("Saved", newPoster);
    posters.push(newPoster);
    res.status(201).json(newPoster);
});

app.put('/api/posters/:id', (req, res) => {
    const {id} = req.params;
    const {x, y, width, height} = req.body;
    const posterIndex = posters.findIndex(p => p.id === parseInt(id));
    if (posterIndex !== -1) {
        posters[posterIndex] = {...posters[posterIndex], x, y, width, height};
        console.log("Updated", posters[posterIndex]);
        res.json(posters[posterIndex]);
    } else {
        res.status(404).json({message: 'Poster not found'});
    }
});

app.delete('/api/posters/:id', async (req, res) => {
    const {id} = req.params;
    const posterIndex = posters.findIndex(p => p.id === parseInt(id));
    if (posterIndex !== -1) {
        console.log(posters[posterIndex].imageUrl)
        unlink(path.join(__dirname, posters[posterIndex].imageUrl), (err) => {
            console.log('Deleted');
        })
        posters.splice(posterIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).json({message: 'Poster not found'});
    }
});

app.post('/api/authenticate', (req, res) => {
    const { password } = req.body;
    if (password === 'admin') {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});