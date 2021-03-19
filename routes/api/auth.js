const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth')

// Load Input Validation
const validateLoginInput = require('../../validation/login');
// Load User model
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Tests users route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch {
        console.log(err.message);
        res.status(500).send("Server Error")
    }
});

// @route   POST api/auth
// @desc    Authenticate User & get token
// @access  Public
router.post('/', async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            errors.user = 'Invalid Credenetials';
            return res.status(400).json(errors);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            errors.user = 'Invalid Credenetials';
            return res.status(400).json(errors);
        }

        const payload = {
            user: {
                id: user.id,
                access: user.access,
                name: user.name
            }
        };

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600000 }, (err, token) => {
            if (err)
                throw err;

            res.json({ token });
        })
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

module.exports = router;