
/**
 * SAMONYA DIGITAL UNIVERSE
 * Auth Controller & Logic
 */

// --- Constants ---
const DB_USERS = 'sdu_users';
const DB_SESSION = 'sdu_session';

// --- Helpers ---

// Get all users
function getUsers() {
    const users = localStorage.getItem(DB_USERS);
    return users ? JSON.parse(users) : [];
}

// Save users array
function saveUsers(users) {
    localStorage.setItem(DB_USERS, JSON.stringify(users));
}

// Get current session
function getSession() {
    const session = localStorage.getItem(DB_SESSION);
    return session ? JSON.parse(session) : null;
}

// Set session
function setSession(email) {
    localStorage.setItem(DB_SESSION, JSON.stringify({ email }));
}

// Clear session
function clearSession() {
    localStorage.removeItem(DB_SESSION);
}

// Find user by email
function findUser(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Update specific user
function updateUser(updatedUser) {
    let users = getUsers();
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        
        // Sync PFP to direct local storage key for Home Page shortcut requirement
        if (updatedUser.profile && updatedUser.profile.pfp) {
            localStorage.setItem('profilePicture', updatedUser.profile.pfp);
        }
    }
}

// Show alert message
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type}`;
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 4000);
    }
}

// Convert image file to Base64
function imageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Check Authentication & Profile Status
function checkAuth() {
    const session = getSession();
    const path = window.location.pathname.split('/').pop();
    
    // Pages that don't require auth
    // Note: home.html and pricing.html and free-access.html are semi-public or accessible for this flow
    const publicPages = ['login.html', 'signup.html', 'reset.html', 'pricing.html', 'free-access.html', 'home.html'];
    
    // 1. If not logged in and on a protected page
    if (!session && !publicPages.includes(path)) {
        window.location.href = 'login.html';
        return;
    }

    // 2. If logged in...
    if (session) {
        const user = findUser(session.email);
        
        // If user not found (deleted?), clear session
        if (!user) {
            clearSession();
            window.location.href = 'login.html';
            return;
        }

        // Apply saved theme immediately
        if (user.profile && user.profile.theme) {
            applyTheme(user.profile.theme);
        }

        // 3. Profile Completion Check
        const isProfileComplete = user.profileCompleted === true;

        if (path === 'login.html' || path === 'signup.html') {
            // If on login/signup but already logged in, go to dashboard
            window.location.href = 'dashboard.html';
        } else if (!isProfileComplete && path !== 'profile-setup.html') {
            // Force profile setup if incomplete
            window.location.href = 'profile-setup.html';
        } else if (isProfileComplete && path === 'profile-setup.html') {
            // Prevent accessing setup again if done
            // window.location.href = 'dashboard.html'; 
        }
    }
}

// Apply Theme
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
}

// --- Page Logic ---

// 1. SIGNUP
function initSignup() {
    const form = document.getElementById('signupForm');
    
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        if (password !== confirmPass) {
            showAlert('Passwords do not match');
            return;
        }

        if (findUser(email)) {
            showAlert('Email already registered');
            return;
        }

        const users = getUsers();
        const newUser = {
            username, // Temporary username, confirmed in setup
            email,
            password,
            profileCompleted: false, // FORCE SETUP FLAG
            profile: {} // Empty profile container
        };
        
        users.push(newUser);
        saveUsers(users);
        
        showAlert('Account created! Redirecting to login...', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
    });
}

// 2. LOGIN
function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const user = findUser(email);

        if (user && user.password === password) {
            setSession(email);
            
            // Redirect logic handled by checkAuth/manual check
            if (!user.profileCompleted) {
                showAlert('Welcome! Please complete your profile.', 'success');
                setTimeout(() => window.location.href = 'profile-setup.html', 1000);
            } else {
                showAlert('Welcome back!', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 1000);
            }
        } else {
            showAlert('Invalid email or password');
        }
    });
}

// 3. DASHBOARD
function initDashboard() {
    const session = getSession();
    if (!session) return; 

    const user = findUser(session.email);
    if (user && user.profile) {
        // Use profile data
        document.getElementById('dashUsername').textContent = user.username || user.profile.fullName;
        document.getElementById('dashEmail').textContent = user.email;
        document.getElementById('dashPfp').src = user.profile.pfp || 'https://via.placeholder.com/100/6A1BFF/ffffff?text=User';
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearSession();
        window.location.href = 'login.html';
    });
}

// 4. PROFILE SETTINGS (View/Edit after setup)
function initProfile() {
    const session = getSession();
    if (!session) return;

    const user = findUser(session.email);
    if (!user) return;

    // Load Data into fields (Simpler version of setup)
    const usernameInput = document.getElementById('username');
    const pfpPreview = document.getElementById('pfpPreviewImg');
    const pfpInput = document.getElementById('pfpInput');
    const themeToggle = document.getElementById('themeToggle');

    usernameInput.value = user.username;
    pfpPreview.src = user.profile.pfp || 'https://via.placeholder.com/100/6A1BFF/ffffff?text=User';
    themeToggle.checked = user.profile.theme === 'light';
    applyTheme(user.profile.theme);

    // Image Preview
    pfpInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            imageToBase64(e.target.files[0], (base64) => {
                pfpPreview.src = base64;
            });
        }
    });

    // Save Changes
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newUsername = usernameInput.value.trim();
        const newPass = document.getElementById('newPassword').value;
        const theme = themeToggle.checked ? 'light' : 'dark';
        const file = pfpInput.files[0];

        const doUpdate = (pfp) => {
            user.username = newUsername;
            user.profile.theme = theme;
            if (pfp) user.profile.pfp = pfp;
            if (newPass) user.password = newPass;

            updateUser(user);
            applyTheme(theme);
            showAlert('Profile updated successfully!', 'success');
        };

        if (file) {
             if (file.size > 500000) {
                showAlert('Profile image too large (Max 500KB)');
                return;
            }
            imageToBase64(file, doUpdate);
        } else {
            doUpdate(null);
        }
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
        if(confirm("Are you sure?")) {
            let users = getUsers();
            users = users.filter(u => u.email !== user.email);
            saveUsers(users);
            clearSession();
            localStorage.removeItem('profilePicture'); // Clear specific key
            window.location.href = 'login.html';
        }
    });
}

// 5. PROFILE SETUP (Mandatory)
function initProfileSetup() {
    const session = getSession();
    if (!session) return; // checkAuth handles redirect

    const user = findUser(session.email);
    if (!user) return;

    const form = document.getElementById('setupForm');
    const pfpInput = document.getElementById('pfpInput');
    const pfpPreview = document.getElementById('pfpPreviewImg');
    const bioInput = document.getElementById('bio');
    const bioCount = document.getElementById('bioCount');

    // Pre-fill known data
    if (user.username) document.getElementById('username').value = user.username;
    
    // Bio Character Count
    bioInput.addEventListener('input', () => {
        const len = bioInput.value.length;
        bioCount.textContent = `${len}/200`;
        if (len < 50 || len > 200) {
            bioCount.style.color = '#ef4444';
        } else {
            bioCount.style.color = '#94a3b8';
        }
    });

    // Image Preview
    pfpInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            imageToBase64(e.target.files[0], (base64) => {
                pfpPreview.src = base64;
            });
        }
    });

    // Theme Selection Visuals
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.radio-option').forEach(el => el.classList.remove('selected'));
            e.target.parentElement.classList.add('selected');
            // Preview theme immediately
            applyTheme(e.target.value);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Gather Data
        const fullName = document.getElementById('fullName').value.trim();
        const dob = document.getElementById('dob').value;
        const country = document.getElementById('country').value;
        const gender = document.getElementById('gender').value;
        const bio = bioInput.value.trim();
        const username = document.getElementById('username').value.trim();
        const theme = document.querySelector('input[name="theme"]:checked').value;
        const file = pfpInput.files[0];

        // Validations
        if (bio.length < 50 || bio.length > 200) {
            showAlert('Bio must be between 50 and 200 characters.');
            return;
        }

        const finalizeSetup = (pfpBase64) => {
            // Update User Object Structure
            user.username = username;
            user.profile = {
                fullName,
                dob,
                country,
                gender,
                bio,
                theme,
                pfp: pfpBase64 || user.profile.pfp || 'https://via.placeholder.com/100/6A1BFF/ffffff?text=User'
            };
            user.profileCompleted = true; // MARK COMPLETE

            updateUser(user);
            
            showAlert('Profile Setup Complete! Launching Dashboard...', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        };

        if (file) {
            if (file.size > 500000) { // 500KB
                showAlert('Image too large (Max 500KB)');
                return;
            }
            imageToBase64(file, finalizeSetup);
        } else {
            finalizeSetup(null);
        }
    });
}

// 6. RESET PASSWORD
function initReset() {
    const checkForm = document.getElementById('checkEmailForm');
    const resetForm = document.getElementById('resetPassForm');
    
    if (!checkForm) return;

    let targetEmail = '';

    checkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const user = findUser(email);

        if (user) {
            targetEmail = email;
            checkForm.style.display = 'none';
            resetForm.style.display = 'block';
            showAlert('Email verified. Enter new password.', 'success');
        } else {
            showAlert('Email not found.');
        }
    });

    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (pass !== confirm) {
            showAlert('Passwords do not match');
            return;
        }

        const user = findUser(targetEmail);
        if (user) {
            user.password = pass;
            updateUser(user);
            showAlert('Password reset! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'login.html', 1500);
        }
    });
}

// 7. PRICING & FREE PLAN ACTIVATION
function initPricing() {
    const freeBtn = document.getElementById('freePlanBtn');
    if (freeBtn) {
        freeBtn.addEventListener('click', () => {
            // Optional: Logic to update user plan state if logged in
            window.location.href = 'free-access.html';
        });
    }
}

function initFreeAccess() {
    const enterBtn = document.getElementById('enterFreeBtn');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Redirect to the main landing page
            window.location.href = 'home.html';
        });
    }
}

// 8. HOME PAGE LOGIC (Profile Shortcut)
function initHome() {
    const shortcut = document.getElementById('profile-shortcut');
    if (!shortcut) return;

    let pfpSrc = null;

    // 1. Priority: Check Logged In User Session (App source of truth)
    const session = getSession();
    if (session) {
        const user = findUser(session.email);
        if (user && user.profile && user.profile.pfp) {
            pfpSrc = user.profile.pfp;
        }
    }

    // 2. Fallback: Check explicit 'profilePicture' key as requested
    if (!pfpSrc) {
        pfpSrc = localStorage.getItem('profilePicture');
    }

    shortcut.innerHTML = ''; // Clear contents

    if (pfpSrc) {
        const img = document.createElement('img');
        img.src = pfpSrc;
        img.alt = "Profile";
        shortcut.appendChild(img);
    } else {
        // Default Avatar if no image
        shortcut.innerHTML = '<div class="default-avatar">👤</div>';
    }

    // Redirect on click
    shortcut.addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const page = document.body.id;
    if (page === 'page-login') initLogin();
    if (page === 'page-signup') initSignup();
    if (page === 'page-dashboard') initDashboard();
    if (page === 'page-profile') initProfile();
    if (page === 'page-setup') initProfileSetup(); 
    if (page === 'page-reset') initReset();
    if (page === 'page-pricing') initPricing();
    if (page === 'page-free-access') initFreeAccess();
    if (page === 'page-home') initHome();
});
