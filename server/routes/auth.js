const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Validation middleware
const validateRegister = [
  check('email').isEmail().withMessage('Invalid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// @route POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    user = new User({ 
      email, 
      password,
      role: 'trainer' 
    });
    
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    
    const payload = { 
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    // Try to sign the JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT Error:', err);
          return res.status(500).json({ msg: 'Token generation failed' });
        }

        console.log('JWT successfully created');
        return res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route POST /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'No User Found' });
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) {
            console.error('JWT Error:', err);
            return res.status(500).json({ msg: 'Token generation failed' });
          }

          console.log('JWT successfully created');
          return res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route GET /api/auth/verify
// @desc Verify token is valid
// @access Private
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;