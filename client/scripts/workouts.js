// workouts.js - Workout related functions
import { API_BASE_URL, checkAuth } from './auth.js';

// Show the workout creation form for a student
function showWorkoutForm(studentId, studentName) {
  const workoutFormContainer = document.getElementById('workoutFormContainer');
  
  workoutFormContainer.innerHTML = `
    <h2>Create Workout for ${studentName}</h2>
    <form id="createWorkoutForm">
      <input type="hidden" id="workoutStudentId" value="${studentId}">
      
      <div class="form-group">
        <label for="workoutName">Workout Name</label>
        <input type="text" id="workoutName" required>
      </div>
      
      <div class="form-group">
        <label for="workoutType">Workout Type</label>
        <select id="workoutType" required>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
        </select>
      </div>
      
      <div id="exercisesContainer">
        <h3>Exercises</h3>
        <div class="exercise-entry">
          <input type="text" placeholder="Exercise Name" class="exercise-name" required>
          <input type="number" placeholder="Sets" class="exercise-sets" required>
          <input type="text" placeholder="Reps" class="exercise-reps" required>
          <input type="text" placeholder="Rest" class="exercise-rest">
          <textarea placeholder="Notes" class="exercise-notes"></textarea>
          <button type="button" class="remove-exercise">Remove</button>
        </div>
      </div>
      
      <button type="button" id="addExerciseBtn" class="btn">Add Exercise</button>
      
      <div class="form-group">
        <label for="workoutNotes">Overall Notes</label>
        <textarea id="workoutNotes"></textarea>
      </div>
      
      <button type="submit" class="btn">Create Workout</button>
    </form>
  `;
  
  // Add event listeners
  document.getElementById('createWorkoutForm').addEventListener('submit', createWorkout);
  document.getElementById('addExerciseBtn').addEventListener('click', addExerciseField);
  
  // Make the form visible
  workoutFormContainer.style.display = 'block';
  
  // Add remove exercise functionality
  document.querySelectorAll('.remove-exercise').forEach(btn => {
    btn.addEventListener('click', function() {
      if (document.querySelectorAll('.exercise-entry').length > 1) {
        this.parentElement.remove();
      } else {
        alert('You need at least one exercise');
      }
    });
  });
}

// Add a new exercise field
function addExerciseField() {
  const exercisesContainer = document.getElementById('exercisesContainer');
  const newExercise = document.createElement('div');
  newExercise.className = 'exercise-entry';
  newExercise.innerHTML = `
    <input type="text" placeholder="Exercise Name" class="exercise-name" required>
    <input type="number" placeholder="Sets" class="exercise-sets" required>
    <input type="text" placeholder="Reps" class="exercise-reps" required>
    <input type="text" placeholder="Rest" class="exercise-rest">
    <textarea placeholder="Notes" class="exercise-notes"></textarea>
    <button type="button" class="remove-exercise">Remove</button>
  `;
  
  exercisesContainer.appendChild(newExercise);
  
  // Add remove functionality to the new button
  newExercise.querySelector('.remove-exercise').addEventListener('click', function() {
    if (document.querySelectorAll('.exercise-entry').length > 1) {
      this.parentElement.remove();
    } else {
      alert('You need at least one exercise');
    }
  });
}

// Create a workout
async function createWorkout(e) {
  e.preventDefault();
  
  const studentId = document.getElementById('workoutStudentId').value;
  const name = document.getElementById('workoutName').value;
  const type = document.getElementById('workoutType').value;
  const notes = document.getElementById('workoutNotes').value;
  
  // Collect all exercises
  const exerciseEntries = document.querySelectorAll('.exercise-entry');
  const exercises = Array.from(exerciseEntries).map(entry => {
    return {
      name: entry.querySelector('.exercise-name').value,
      sets: entry.querySelector('.exercise-sets').value,
      reps: entry.querySelector('.exercise-reps').value,
      rest: entry.querySelector('.exercise-rest').value,
      notes: entry.querySelector('.exercise-notes').value
    };
  });
  
  const token = checkAuth();
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      },
      body: JSON.stringify({
        studentId,
        name,
        type,
        exercises,
        notes
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to create workout');
    }
    
    const result = await response.json();
    
    // Hide form
    document.getElementById('workoutFormContainer').style.display = 'none';
    
    alert('Workout created successfully!');
  } catch (error) {
    console.error('Error creating workout:', error);
    alert(error.message);
  }
}

// View workouts for a student
async function viewWorkouts(studentId, studentName) {
  const token = checkAuth();
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/workout/student/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load workouts');
    }
    
    const workouts = await response.json();
    displayWorkouts(workouts, studentName);
  } catch (error) {
    console.error('Error loading workouts:', error);
    alert('Failed to load workouts. Please try again.');
  }
}

// Display workouts in the UI
function displayWorkouts(workouts, studentName) {
  const workoutsContainer = document.getElementById('workoutsContainer');
  
  workoutsContainer.innerHTML = `<h2>Workouts for ${studentName}</h2>`;
  
  if (workouts.length === 0) {
    workoutsContainer.innerHTML += '<p>No workouts created yet.</p>';
    workoutsContainer.style.display = 'block';
    return;
  }
  
  workouts.forEach(workout => {
    let exercisesHtml = '';
    workout.exercises.forEach(exercise => {
      exercisesHtml += `
        <div class="exercise-item">
          <strong>${exercise.name}</strong> - ${exercise.sets} sets of ${exercise.reps}
          ${exercise.rest ? `<br>Rest: ${exercise.rest}` : ''}
          ${exercise.notes ? `<br>Notes: ${exercise.notes}` : ''}
        </div>
      `;
    });
    
    workoutsContainer.innerHTML += `
      <div class="workout-card">
        <h3>${workout.name} (Type ${workout.type})</h3>
        <p>Created: ${new Date(workout.createdAt).toLocaleDateString()}</p>
        <div class="exercises-list">
          ${exercisesHtml}
        </div>
        ${workout.notes ? `<div class="workout-notes"><strong>Overall Notes:</strong><br>${workout.notes}</div>` : ''}
      </div>
    `;
  });
  
  workoutsContainer.style.display = 'block';
}

// Make functions available globally
window.showWorkoutForm = showWorkoutForm;
window.viewWorkouts = viewWorkouts;

export { showWorkoutForm, viewWorkouts, createWorkout, addExerciseField };