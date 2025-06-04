
// LOGIN.JS
class LoginManager {
    constructor() {
        this.initializeEventListeners();
        this.checkSavedCredentials();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        // Password toggle
        document.getElementById('passwordToggle').addEventListener('click', () => {
            this.togglePassword();
        });

        // Social login buttons
        document.querySelector('.google-btn').addEventListener('click', () => {
            this.handleSocialLogin('google');
        });

        document.querySelector('.github-btn').addEventListener('click', () => {
            this.handleSocialLogin('github');
        });

        // Input animations
        this.setupInputAnimations();
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    e.target.parentElement.classList.remove('focused');
                }
            });

            // Check if input has value on load
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate inputs
        if (!this.validateEmail(email)) {
            this.showAlert('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAlert('Password must be at least 6 characters long', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            await this.authenticateUser(email, password, rememberMe);
        } catch (error) {
            this.showAlert('Login failed: ' + error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async authenticateUser(email, password, rememberMe) {
        // Simulate API call delay
        await this.delay(1500);

        // Check stored credentials (for demo purposes)
        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const user = storedUsers.find(u => u.email === email && u.password === password);

        if (user) {
            // Save login session
            const loginData = {
                user: { id: user.id, email: user.email, username: user.username },
                timestamp: Date.now(),
                rememberMe: rememberMe
            };

            if (rememberMe) {
                localStorage.setItem('loginSession', JSON.stringify(loginData));
            } else {
                sessionStorage.setItem('loginSession', JSON.stringify(loginData));
            }

            this.showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect after success message
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // Demo credentials for testing
            if (email === 'demo@typingtest.com' && password === 'demo123') {
                const demoUser = {
                    user: { id: 'demo', email: email, username: 'Demo User' },
                    timestamp: Date.now(),
                    rememberMe: rememberMe
                };

                if (rememberMe) {
                    localStorage.setItem('loginSession', JSON.stringify(demoUser));
                } else {
                    sessionStorage.setItem('loginSession', JSON.stringify(demoUser));
                }

                this.showAlert('Welcome! Logging you in...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'typing-test.html';
                }, 1500);
            } else {
                throw new Error('Invalid email or password');
            }
        }
    }

    handleSocialLogin(provider) {
        this.showAlert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login will be available soon!`, 'error');
        
        // In a real application, you would integrate with OAuth providers
        // Example for Google: window.location.href = 'https://accounts.google.com/oauth/authorize?...';
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('passwordToggle');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showAlert(message, type) {
        const alertElement = document.getElementById('alertMessage');
        alertElement.textContent = message;
        alertElement.className = `alert alert-${type}`;
        alertElement.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 3000);
        }
    }

    setLoadingState(isLoading) {
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
            loginBtn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    checkSavedCredentials() {
        // Check if user is already logged in
        const sessionData = localStorage.getItem('loginSession') || sessionStorage.getItem('loginSession');
        
        if (sessionData) {
            const data = JSON.parse(sessionData);
            // Check if session is still valid (24 hours for remember me, 1 hour for regular)
            const sessionDuration = data.rememberMe ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
            
            if (Date.now() - data.timestamp < sessionDuration) {
                // User is still logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
                return;
            } else {
                // Session expired, clear it
                localStorage.removeItem('loginSession');
                sessionStorage.removeItem('loginSession');
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.login-btn, .social-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
