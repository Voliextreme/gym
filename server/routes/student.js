const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const WorkoutPlan = require('../models/WorkoutPlan');
const auth = require('../middleware/auth');

// @route POST /api/student
// @desc Create a new student
// @access Private (trainer only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    
    const existingStudent = await Student.findOne({ 
      phoneNumber, 
      trainer: req.user.id 
    });
    
    if (existingStudent) {
      return res.status(400).json({ msg: 'Student with this phone number already exists' });
    }
    
    const student = new Student({
      name,
      phoneNumber,
      trainer: req.user.id
    });
    
    await student.save();
    
    res.json({
      student,
      workoutUrl: `${req.protocol}://${req.get('host')}/user/${student.accessId}/workout-A`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/student
// @desc Get all students for a trainer
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find({ trainer: req.user.id }).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/student/:id
// @desc Get a student by ID
// @access Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    if (student.trainer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
