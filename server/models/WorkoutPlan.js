const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const WorkoutPlan = require('../models/WorkoutPlan');
const auth = require('../middleware/auth');

// @route POST /api/workout
// @desc Create a workout plan for a student
// @access Private
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, name, type, exercises, notes } = req.body;
    
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    // Verify this student belongs to the logged-in trainer
    if (student.trainer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const workoutPlan = new WorkoutPlan({
      name,
      type,
      exercises,
      notes,
      student: studentId,
      trainer: req.user.id
    });
    
    await workoutPlan.save();
    
    // Add the workout plan to the student's workoutPlans array
    student.workoutPlans.push(workoutPlan._id);
    await student.save();
    
    res.json(workoutPlan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/workout/student/:studentId
// @desc Get all workout plans for a specific student
// @access Private
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({ 
      student: req.params.studentId,
      trainer: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(workoutPlans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/workout/public/:accessId/:type
// @desc Get a specific workout plan by student access ID and workout type (A, B, C, etc.)
// @access Public
router.get('/public/:accessId/:type', async (req, res) => {
  try {
    const student = await Student.findOne({ accessId: req.params.accessId });
    
    if (!student) {
      return res.status(404).json({ msg: 'Invalid access code' });
    }
    
    const workoutPlan = await WorkoutPlan.findOne({
      student: student._id,
      type: req.params.type
    }).sort({ createdAt: -1 });
    
    if (!workoutPlan) {
      return res.status(404).json({ msg: 'Workout plan not found' });
    }
    
    res.json({
      studentName: student.name,
      workout: workoutPlan
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;