// students.js - Student related functions
import { API_BASE_URL, checkAuth } from './auth.js';

// Load all students for the trainer
async function loadStudents() {
  const token = checkAuth();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/student`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load students');
    }
    
    const students = await response.json();
    displayStudents(students);
  } catch (error) {
    console.error('Error loading students:', error);
    alert('Failed to load students. Please try again.');
  }
}

// Display students in the UI
function displayStudents(students) {
  const studentsList = document.getElementById('studentsList');
  
  if (students.length === 0) {
    studentsList.innerHTML = '<p>No students added yet. Add your first student to get started!</p>';
    return;
  }
  
  let html = '';
  students.forEach(student => {
    html += `
      <div class="student-card" data-id="${student._id}">
        <h3>${student.name}</h3>
        <p>Phone: ${student.phoneNumber}</p>
        <p>Workout Link: <a href="${window.location.origin}/user/${student.accessId}/workout-A" target="_blank">
          ${window.location.origin}/user/${student.accessId}/workout-A
        </a></p>
        <div class="student-actions">
          <button onclick="showWorkoutForm('${student._id}', '${student.name}')">Add Workout</button>
          <button onclick="viewWorkouts('${student._id}', '${student.name}')">View Workouts</button>
        </div>
      </div>
    `;
  });
  
  studentsList.innerHTML = html;
}

// Add a new student
async function addStudent(e) {
  e.preventDefault();
  
  const name = document.getElementById('studentName').value;
  const phoneNumber = document.getElementById('studentPhone').value;
  
  if (!name || !phoneNumber) {
    alert('Please fill in all fields');
    return;
  }
  
  const token = checkAuth();
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      },
      body: JSON.stringify({ name, phoneNumber })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to add student');
    }
    
    const result = await response.json();
    
    // Clear form
    document.getElementById('studentName').value = '';
    document.getElementById('studentPhone').value = '';
    
    // Reload students
    await loadStudents();
    
    // Show success message with link
    alert(`Student added successfully!\nWorkout link: ${result.workoutUrl}`);
  } catch (error) {
    console.error('Error adding student:', error);
    alert(error.message);
  }
}

// Set up student form submission
function setupStudentForm() {
  document.getElementById('addStudentForm').addEventListener('submit', addStudent);
}

export { loadStudents, displayStudents, addStudent, setupStudentForm };