// Register Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    
    // Form validation rules
    const validators = {
        fullName: {
            validate: (value) => value.trim().length >= 2,
            message: 'Full name must be at least 2 characters long'
        },
        email: {
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        },
        username: {
            validate: (value) => /^[a-zA-Z0-9_]{3,20}$/.test(value),
            message: 'Username must be 3-20 characters (letters, numbers, underscore only)'
        },
        password: {
            validate: (value) => value.length >= 8,
            message: 'Password must be at least 8 characters long'
        },
        confirmPassword: {
            validate: (value) => value === document.getElementById('password').value,
            message: 'Passwords do not match'
        }
    };

    // Real-time validation for each field
    Object.keys(validators).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        field.addEventListener('blur', () => validateField(fieldName));
        field.addEventListener('input', () => {
            clearFieldError(fieldName);
            if (fieldName === 'password') {
                checkPasswordStrength(field.value);
            }
        });
    });

    // Password confirmation real-time check
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match');
        } else {
            clearFieldError('confirmPassword');
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    function validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const validator = validators[fieldName];
        const value = field.value.trim();
        
        if (!validator.validate(value)) {
            showFieldError(fieldName, validator.message);
            return false;
        } else {
            clearFieldError(fieldName);
            return true;
        }
    }

    function validateForm() {
        let isValid = true;
        
        // Validate all fields
        Object.keys(validators).forEach(fieldName => {
            if (!validateField(fieldName)) {
                isValid = false;
            }
        });
        
        // Check terms agreement
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            alert('Please agree to the Terms and Conditions');
            isValid = false;
        }
        
        return isValid;
    }

    function showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        field.classList.add('error');
        field.classList.remove('success');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        field.classList.remove('error');
        field.classList.add('success');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    function checkPasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        const strength = calculatePasswordStrength(password);
        
        strengthElement.className = 'password-strength';
        
        if (password.length === 0) {
            strengthElement.textContent = '';
            return;
        }
        
        switch (strength.level) {
            case 'weak':
                strengthElement.classList.add('strength-weak');
                strengthElement.textContent = '🔴 Weak password';
                break;
            case 'fair':
                strengthElement.classList.add('strength-fair');
                strengthElement.textContent = '🟡 Fair password';
                break;
            case 'good':
                strengthElement.classList.add('strength-good');
                strengthElement.textContent = '🟢 Good password';
                break;
            case 'strong':
                strengthElement.classList.add('strength-strong');
                strengthElement.textContent = '🟢 Strong password';
                break;
        }
    }

    function calculatePasswordStrength(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 25;
        
        // Character variety
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;
        
        if (score < 30) return { level: 'weak', score };
        if (score < 60) return { level: 'fair', score };
        if (score < 90) return { level: 'good', score };
        return { level: 'strong', score };
    }

    function submitForm() {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Creating Account...';
        
        // Simulate API call
        setTimeout(() => {
            const formData = new FormData(form);
            const userData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                username: formData.get('username'),
                password: formData.get('password')
            };
            
            // Store user data (in real app, send to server)
            localStorage.setItem('registeredUser', JSON.stringify(userData));
            
            // Show success message
            showSuccessMessage();
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        }, 1500);
    }

    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = 'Account created successfully! Redirecting to login...';
        
        form.parentNode.insertBefore(successDiv, form);
        
        // Reset form
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        
        // Clear all field states
        Object.keys(validators).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            field.classList.remove('error', 'success');
        });
    }

    // Check if user is already logged in
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'typing-test.html';
    }
});