export async function login(email, password) {
    const errorDiv = document.getElementById('loginError');
    const loginButton = document.getElementById('loginButton');
    try {
        loginButton.disabled = true;
        loginButton.classList.add('loading');
        errorDiv.classList.add('hidden');

        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || `Login failed: ${response.status}`);
        }

        const { token } = await response.json();
        localStorage.setItem('jwt', token);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    } finally {
        loginButton.disabled = false;
        loginButton.classList.remove('loading');
    }
}

export async function register(email, password) {
    const errorDiv = document.getElementById('registerError');
    const registerButton = document.getElementById('registerButton');
    try {
        registerButton.disabled = true;
        registerButton.classList.add('loading');
        errorDiv.classList.add('hidden');

        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || `Registration failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Registration successful:', data);

        // Auto-login after registration
        return await login(email, password);
    } catch (error) {
        console.error('Registration error:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    } finally {
        registerButton.disabled = false;
        registerButton.classList.remove('loading');
    }
}

export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('jwt');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const response = await fetch(url, options);
    if (response.status === 401) {
        localStorage.removeItem('jwt');
        window.location.href = 'login.html';
    }
    return response;
}

export function logout() {
    localStorage.removeItem('jwt');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');

    // Toggle between login and register forms
    showRegisterBtn.addEventListener('click', () => {
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        registerFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        if (!email || !password) {
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = 'Email and password are required';
            errorDiv.classList.remove('hidden');
            return;
        }
        await login(email, password);
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        if (!email || !password) {
            const errorDiv = document.getElementById('registerError');
            errorDiv.textContent = 'Email and password are required';
            errorDiv.classList.remove('hidden');
            return;
        }
        await register(email, password);
    });

    // Check if already logged in
    if (localStorage.getItem('jwt')) {
        window.location.href = 'index.html';
    }
});