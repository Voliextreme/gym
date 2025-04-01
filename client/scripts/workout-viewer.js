// workout-viewer.js - For the public workout viewing page

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Initialize the workout viewer
async function initWorkoutViewer() {
  // Get the access ID and workout type from the URL
  const urlPath = window.location.pathname;
  const match = urlPath.match(/\/user\/([^\/]+)\/workout-([A-F])/);
  
  if (!match) {
    showError('Invalid workout URL');
    return;
  }
  
  const accessId = match[1];
  const workoutType = match[2];
  
  try {
    // Fetch the workout data
    const response = await fetch(`${API_BASE_URL}/workout/public/${accessId}/${workoutType}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Workout not found');
    }
    
    const data = await response.json();
    displayWorkout(data.studentName, data.workout);
  } catch (error) {
    console.error('Error loading workout:', error);
    showError(error.message);
  }
}

// Display the workout
function displayWorkout(studentName, workout) {
  const container = document.getElementById('workoutContainer');
  
  document.title = `${workout.name} - ${studentName}'s Workout`;
  
  let exercisesHtml = '';
  workout.exercises.forEach((exercise, index) => {
    exercisesHtml += `
      <div class="exercise">
        <div class="exercise-header">
          <h3>${index + 1}. ${exercise.name}</h3>
          <div class="exercise-details">
            <span class="sets">${exercise.sets} Sets</span>
            <span class="reps">${exercise.reps}</span>
            ${exercise.rest ? `<span class="rest">Rest: ${exercise.rest}</span>` : ''}
          </div>
        </div>
        ${exercise.notes ? `<div class="notes">${exercise.notes}</div>` : ''}
      </div>
    `;
  });
  
  container.innerHTML = `
    <div class="workout-header">
      <h1>${workout.name}</h1>
      <h2>Workout Plan ${workout.type} for ${studentName}</h2>
      <p class="workout-date">Last updated: ${new Date(workout.createdAt).toLocaleDateString()}</p>
    </div>
    
    <div class="workout-exercises">
      ${exercisesHtml}
    </div>
    
    ${workout.notes ? `
      <div class="workout-notes">
        <h3>Additional Notes</h3>
        <div>${workout.notes}</div>
      </div>
    ` : ''}
    
    <div class="workout-navigation">
      ${['A', 'B', 'C', 'D', 'E', 'F'].map(type => `
        <a href="/user/${match[1]}/workout-${type}" class="workout-nav-link ${type === workout.type ? 'active' : ''}">
          Workout ${type}
        </a>
      `).join('')}
    </div>
  `;
}

// Show error message
function showError(message) {
  const container = document.getElementById('workoutContainer');
  container.innerHTML = `
    <div class="error-message">
      <h2>Error</h2>
      <p>${message}</p>
      <p>Please check the URL or contact your trainer.</p>
    </div>
  `;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initWorkoutViewer);