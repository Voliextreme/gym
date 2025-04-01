// dashboard.js - Main dashboard initialization
import { checkAuth, setupLogout } from './auth.js';
import { loadStudents, setupStudentForm } from './students.js';

// Initialize dashboard
async function initDashboard() {
  // Check authentication
  const token = checkAuth();
  if (!token) return;
  
  // Setup logout button
  setupLogout();
  
  // Setup student form
  setupStudentForm();
  
  // Load students
  await loadStudents();
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard);