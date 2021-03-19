const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');

// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));


// @route   POST api/users
// @desc    Register User
// @access  Public
router.post('/', async (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const { name, email, password, access } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        }

        user = new User({
            name,
            email,
            password,
            access
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt)
        await user.save();

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