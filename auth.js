document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if we're on the registration page
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Check if we're on the forgot password page
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }

    // Social login buttons
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', signInWithGoogle);
    }

    const facebookLoginBtn = document.getElementById('facebookLogin');
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', signInWithFacebook);
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Handle email/password login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('input[name="remember"]').checked;
    
    try {
        // Set persistence based on remember me
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await firebase.auth().setPersistence(persistence);
        
        // Sign in with email and password
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // Redirect to the page they were on or home
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'index.html';
        window.location.href = redirectUrl;
        
    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error));
    }
}

// Handle user registration
async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const fullName = document.getElementById('fullName').value;
    
    // Basic validation
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    try {
        // Create user with email and password
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({
            displayName: fullName
        });
        
        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: fullName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'buyer' // Default role
        });
        
        // Send email verification
        await user.sendEmailVerification();
        
        // Redirect to dashboard or home
        window.location.href = 'account.html';
        
    } catch (error) {
        console.error('Registration error:', error);
        showError(getErrorMessage(error));
    }
}

// Handle password reset
async function handleResetPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showSuccess('Password reset email sent. Please check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        showError(getErrorMessage(error));
    }
}

// Google Sign-In
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create user document if it doesn't exist
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'buyer' // Default role
            });
        }
        
        // Redirect to home or previous page
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'index.html';
        window.location.href = redirectUrl;
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        showError(getErrorMessage(error));
    }
}

// Facebook Sign-In
async function signInWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create user document if it doesn't exist
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'buyer' // Default role
            });
        }
        
        // Redirect to home or previous page
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'index.html';
        window.location.href = redirectUrl;
        
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        showError(getErrorMessage(error));
    }
}

// Handle user logout
async function handleLogout() {
    try {
        await firebase.auth().signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to log out. Please try again.');
    }
}

// Helper function to show error messages
function showError(message) {
    // Create or find error message container
    let errorContainer = document.querySelector('.error-message');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        
        // Insert after the form title or at the beginning of the form
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(errorContainer, form.firstChild);
        } else {
            document.body.prepend(errorContainer);
        }
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// Helper function to show success messages
function showSuccess(message) {
    // Similar to showError but with success styling
    let successContainer = document.querySelector('.success-message');
    
    if (!successContainer) {
        successContainer = document.createElement('div');
        successContainer.className = 'success-message';
        
        // Insert after the form title or at the beginning of the form
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(successContainer, form.firstChild);
        } else {
            document.body.prepend(successContainer);
        }
    }
    
    successContainer.textContent = message;
    successContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successContainer.style.display = 'none';
    }, 5000);
}

// Helper function to get user-friendly error messages
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please use a different email or sign in.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many failed login attempts. Please try again later or reset your password.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in was canceled. Please try again.';
        default:
            return error.message || 'An error occurred. Please try again.';
    }
}

// Export functions for use in other modules
window.authModule = {
    handleLogin,
    handleRegister,
    handleResetPassword,
    signInWithGoogle,
    signInWithFacebook,
    handleLogout,
    showError,
    showSuccess
};
