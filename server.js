const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_SECRET_KEY = "CHANGE_THIS_TO_A_VERY_SECRET_KEY";
const allowedOrigin = 'https://tabcode.cfd';

let validPasscodes = new Set(['initial-code-123']);

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

const checkAdminAuth = (req, res, next) => {
    if (req.headers['x-admin-secret'] === ADMIN_SECRET_KEY) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

app.post('/validate-code', (req, res) => {
    const { code } = req.body;
    if (validPasscodes.has(code)) {
        return res.json({ success: true, message: 'Code is valid.' });
    } else {
        return res.json({ success: false, message: 'Code is invalid.' });
    }
});

app.get('/get-codes', checkAdminAuth, (req, res) => {
    res.json({ success: true, codes: Array.from(validPasscodes) });
});

app.post('/add-code', checkAdminAuth, (req, res) => {
    const { code } = req.body;
    if (code) {
        validPasscodes.add(code);
        console.log('Added code:', code);
        return res.json({ success: true, message: `Code "${code}" added.` });
    }
    res.status(400).json({ success: false, message: 'No code provided.' });
});

app.post('/delete-code', checkAdminAuth, (req, res) => {
    const { code } = req.body;
    if (code && validPasscodes.has(code)) {
        validPasscodes.delete(code);
        console.log('Deleted code:', code);
        return res.json({ success: true, message: `Code "${code}" deleted.` });
    }
    res.status(400).json({ success: false, message: 'Code not found or not provided.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Accepting requests from: ${allowedOrigin}`);
});

