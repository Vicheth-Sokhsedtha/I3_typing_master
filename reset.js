
// RESET-PASSWORD.JS
class ResetPasswordManager {
    constructor() {
        this.currentStep = 1;
        this.resendCountdown = 0;
        this.resendTimer = null;
        this.userEmail = '';
        this.initializeEventListeners();
        this.checkURLParams();
    }

    initializeEventListeners() {
        // Email form submission
        document.getElementById('emailForm').addEventListener('submit', (e) => {
            this.handleEmailSubmission(e);
        });

        // Password form submission
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            this.handlePasswordReset(e);
        });

        // Resend email button
        document.getElementById('resendBtn').addEventListener('click', () => {
            this.resendEmail();
        });

        // Password toggles
        document.getElementById('passwordToggle1').addEventListener('click', () => {
            this.togglePassword('newPassword', 'passwordToggle1');
        });

        document.getElementById('passwordToggle2').addEventListener('click', () => {
            this.togglePassword('confirmPassword', 'passwordToggle2');
        });

        // Password strength checker
        document.getElementById('newPassword').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
            this.validatePasswordRequirements(e.target.value);
        });

        // Confirm password validation
        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.validatePasswordMatch();
        });
    }

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (token && email) {
            // User clicked on reset link from email
            this.userEmail = decodeURIComponent(email);
            this.goToStep(3);
        }
    }

    async handleEmailSubmission(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;

        if (!this.validateEmail(email)) {
            this.showAlert('emailAlert', 'Please enter a valid email address', 'error');
            return;
        }

        this.setLoadingState('sendBtn', true);

        try {
            await this.sendResetEmail(email);
            this.userEmail = email;
            document.getElementById('sentEmail').textContent = email;
            this.goToStep(2);
            this.startResendCountdown();
        } catch (error) {
            this.showAlert('emailAlert', error.message, 'error');
        } finally {
            this.setLoadingState('sendBtn', false);
        }
    }

    async sendResetEmail(email) {
        // Simulate API call
        await this.delay(2000);

        // Check if email exists (demo purposes)
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const userExists = registeredUsers.some(user => user.email === email) || email === 'demo@typingtest.com';

        if (!userExists) {
            throw new Error('No account found with this email address');
        }

        // Simulate sending email
        const resetToken = this.generateResetToken();
        const resetData = {
            email: email,
            token: resetToken,
            timestamp: Date.now(),
            expires: Date.now() + (15 * 60 * 1000) // 15 minutes
        };

        localStorage.setItem('passwordResetToken', JSON.stringify(resetData));
        
        // In a real application, you would send an actual email here
        console.log(`Reset link: ${window.location.origin}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`);
    }

    async handlePasswordReset(e) {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!this.validateNewPassword(newPassword, confirmPassword)) {
            return;
        }

        this.setLoadingState('updateBtn', true);

        try {
            await this.updatePassword(newPassword);
            this.goToStep(4);
        } catch (error) {
            this.showAlert('passwordAlert', error.message, 'error');
        } finally {
            this.setLoadingState('updateBtn', false);
        }
    }

    async updatePassword(newPassword) {
        // Simulate API call
        await this.delay(1500);

        // Update password in localStorage (demo purposes)
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const userIndex = registeredUsers.findIndex(user => user.email === this.userEmail);

        if (userIndex !== -1) {
            registeredUsers[userIndex].password = newPassword;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }

        // Clear reset token
        localStorage.removeItem('passwordResetToken');
    }

    validateNewPassword(newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            this.showAlert('passwordAlert', 'Passwords do not match', 'error');
            return false;
        }

        if (!this.isPasswordStrong(newPassword)) {
            this.showAlert('passwordAlert', 'Password does not meet requirements', 'error');
            return false;
        }

        return true;
    }

    checkPasswordStrength(password) {
        const strengthMeter = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        let score = 0;
        let strength = 'weak';

        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 0:
            case 1:
                strength = 'weak';
                strengthText.textContent = 'Very weak password';
                break;
            case 2:
                strength = 'weak';
                strengthText.textContent = 'Weak password';
                break;
            case 3:
                strength = 'fair';
                strengthText.textContent = 'Fair password';
                break;
            case 4:
                strength = 'good';
                strengthText.textContent = 'Good password';
                break;
            case 5:
                strength = 'strong';
                strengthText.textContent = 'Strong password';
                break;
        }

        strengthMeter.className = `strength-fill ${strength}`;
    }

    validatePasswordRequirements(password) {
        const requirements = {
            lengthReq: password.length >= 8,
            upperReq: /[A-Z]/.test(password),
            lowerReq: /[a-z]/.test(password),
            numberReq: /[0-9]/.test(password),
            specialReq: /[^A-Za-z0-9]/.test(password)
        };

        Object.keys(requirements).forEach(reqId => {
            const element = document.getElementById(reqId);
            if (requirements[reqId]) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        });
    }

    validatePasswordMatch() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmPassword && newPassword !== confirmPassword) {
            confirmInput.style.borderColor = '#ff4757';
            confirmInput.setCustomValidity('Passwords do not match');
        } else {
            confirmInput.style.borderColor = '#e1e5e9';
            confirmInput.setCustomValidity('');
        }
    }
    togglePassword(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggleButton = document.getElementById(toggleId);

        if (input.type === 'password') {
            input.type = 'text';
            toggleButton.textContent = '🙈'; // Hide icon
        } else {
            input.type = 'password';
            toggleButton.textContent = '👁️'; // Show icon
        }
    }
    goToStep(step) {
        this.currentStep = step;
        const steps = document.querySelectorAll('.step');
        steps.forEach((el, index) => {
            el.style.display = (index + 1 === step) ? 'block' : 'none';
        });

        // Update navigation footer visibility
        document.getElementById('navFooter').style.display = (step === 1 || step === 2) ? 'block' : 'none';
    }
    startResendCountdown() {
        this.resendCountdown = 60;
        const countdownElement = document.getElementById('countdown');
        countdownElement.style.display = 'inline';
        countdownElement.textContent = `(${this.resendCountdown}s)`;

        if (this.resendTimer) {
            clearInterval(this.resendTimer);
        }

        this.resendTimer = setInterval(() => {
            this.resendCountdown--;
            countdownElement.textContent = `(${this.resendCountdown}s)`;

            if (this.resendCountdown <= 0) {
                clearInterval(this.resendTimer);
                countdownElement.style.display = 'none';
                document.getElementById('resendBtn').disabled = false;
            }
        }, 1000);
    }
    resendEmail() {
        if (this.resendCountdown > 0) {
            return; // Prevent resending if countdown is active
        }

        this.setLoadingState('resendBtn', true);

        this.sendResetEmail(this.userEmail)
            .then(() => {
                this.showAlert('emailAlert', 'Reset link sent successfully!', 'success');
                this.startResendCountdown();
            })
            .catch(error => {
                this.showAlert('emailAlert', error.message, 'error');
            })
            .finally(() => {
                this.setLoadingState('resendBtn', false);
            });
    }
}