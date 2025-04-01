const API_BASE_URL = 'http://127.0.0.1:5000/api/auth';

// Check token validity
async function checkTokenValidity() {
  const token = localStorage.getItem('token');
  
  if (!token) return false;
  
  try {
    // You'll need to implement this endpoint in your auth routes
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

// Auto-redirect based on auth status
async function handleAuthRouting() {
  const isAuthenticated = await checkTokenValidity();
  const currentPath = window.location.pathname;
  
  // If on login/register page but already authenticated
  if ((currentPath.includes('login.html') || currentPath.includes('register.html') || currentPath === '/') && isAuthenticated) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // If on protected page but not authenticated
  if (currentPath.includes('dashboard.html') && !isAuthenticated) {
    window.location.href = 'login.html';
    return;
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if we need to handle auth routing
  if (!window.location.pathname.includes('/user/')) {
    handleAuthRouting();
  }
  
  // Setup any page-specific elements
  setupPageElements();
});

// 📌 Handle Registration
function setupPageElements() {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Registration failed');
        }
        
        const data = await response.json();
        console.log('Registration response:', data);  // Log the entire response
        localStorage.setItem('token', data.token); // Auto-login
        window.location.href = 'dashboard.html'; // Redirect to dashboard
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // 📌 Handle Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Login failed');
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html'; // Redirect to dashboard
      } catch (err) {
        alert(err.message);
      }
    });
  }
  
  // Logout button handling
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

// 📌 Logout Function
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}