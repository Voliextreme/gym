const API_BASE_URL = 'http://127.0.0.1:5000/api/auth';

// 📌 Handle Registration
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
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
        localStorage.setItem('token', data.token); // Auto-login
        window.location.href = 'index.html'; // Redirect to index
    } catch (err) {
        alert(err.message);
    }
});

// 📌 Handle Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
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
        window.location.href = 'index.html'; // Redirect to index
    } catch (err) {
        alert(err.message);
    }
});

// 📌 Restrict Access to Protected Pages (like Dashboard)
function protectRoute() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect if not logged in
    }
}

// 📌 Logout Function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// 📌 Auto-run protection on protected pages
if (window.location.pathname.includes('dashboard.html')) {
    protectRoute();
}
