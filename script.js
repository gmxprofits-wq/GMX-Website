// GMX Client Ecosystem Core Logic - Fabric 1.21.11 Optimized

document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage State Initialization
    const defaultState = {
        currentUser: null,
        users: [],
        coins: 1250,
        unlockedMods: ['GMX Auto Axe'],
        lastSpinTime: 0,
        lastDailyClaim: 0,
        giftsInbox: []
    };

    let state = JSON.parse(localStorage.getItem('gmx_state')) || defaultState;

    function saveState() {
        localStorage.setItem('gmx_state', JSON.stringify(state));
    }

    // DOM Elements
    const authOverlay = document.getElementById('authOverlay');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');
    
    // Fixed selectors to target forms correctly by ID instead of reusing containers
    const loginForm = document.getElementById('loginFormContainer');
    const registerForm = document.getElementById('registerFormContainer').querySelector('form') || document.getElementById('registerFormContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const navItems = document.querySelectorAll('.nav-item');
    const pageViews = document.querySelectorAll('.page-view');
    const pageTitleHeading = document.getElementById('pageTitleHeading');
    
    const headerCoinDisplay = document.getElementById('headerCoinDisplay');
    const headerUsernameDisplay = document.getElementById('headerUsernameDisplay');
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    const dashUsername = document.getElementById('dashUsername');
    
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profileCoinBalance = document.getElementById('profileCoinBalance');

    // Authentication Tabs Switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.getAttribute('data-auth-target');
            if (target === 'login') {
                loginFormContainer.classList.add('active');
                registerFormContainer.classList.remove('active');
            } else {
                registerFormContainer.classList.add('active');
                loginFormContainer.classList.remove('active');
            }
        });
    });

    // Navigation Routing
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            pageViews.forEach(view => view.classList.remove('active'));
            const activeView = document.getElementById(`${pageId}-view`);
            if (activeView) activeView.classList.add('active');

            pageTitleHeading.textContent = item.textContent.trim();
        });
    });

    // Register Handler
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value.trim();
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const alertBox = document.getElementById('registerAlert');
        const successBox = document.getElementById('registerSuccess');

        alertBox.style.display = 'none';
        successBox.style.display = 'none';

        if (state.users.some(u => u.username === username)) {
            alertBox.textContent = 'Username is already taken on the GMX network.';
            alertBox.style.display = 'block';
            return;
        }

        const newUser = { email, username, password };
        state.users.push(newUser);
        saveState();

        successBox.textContent = 'Account successfully initialized! You can now log in.';
        successBox.style.display = 'block';
        registerForm.reset();

        setTimeout(() => {
            document.querySelector('[data-auth-target="login"]').click();
            successBox.style.display = 'none';
        }, 1500);
    });

    // Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const alertBox = document.getElementById('loginAlert');

        alertBox.style.display = 'none';

        const foundUser = state.users.find(u => u.username === username && u.password === password);
        
        // Allow default 'Operator' or registered users
        if (foundUser || username === 'Operator') {
            triggerLoadingSequence('Authenticating Fabric 1.21.11 Session...', () => {
                state.currentUser = username;
                saveState();
                updateUIState();
                authOverlay.style.display = 'none';
            });
        } else {
            alertBox.textContent = 'Invalid credentials or unregistered operator username.';
            alertBox.style.display = 'block';
        }
    });

    // Logout Handler
    logoutBtn.addEventListener('click', () => {
        triggerLoadingSequence('Terminating Secure Session...', () => {
            state.currentUser = null;
            saveState();
            authOverlay.style.display = 'flex';
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        });
    });

    // Loading Sequence Simulation
    function triggerLoadingSequence(text, callback) {
        loadingText.textContent = text;
        loadingOverlay.style.display = 'flex';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            if (callback) callback();
        }, 800);
    }

    // Update UI Bindings
    function updateUIState() {
        const user = state.currentUser || 'Operator';
        headerUsernameDisplay.textContent = user;
        dashUsername.textContent = user;
        profileUsername.textContent = user;
        profileEmail.textContent = `${user.toLowerCase()}@gmx.empire`;
        headerUserAvatar.textContent = user.substring(0, 2).toUpperCase();
        
        headerCoinDisplay.textContent = state.coins.toLocaleString();
        profileCoinBalance.textContent = state.coins.toLocaleString();
        
        renderGiftsInbox();
    }

    // Mod Purchase System
    window.purchaseMod = function(cost, modName) {
        if (state.unlockedMods.includes(modName)) {
            alert(`You already own ${modName}!`);
            return;
        }
        if (state.coins < cost) {
            alert('Insufficient GMX coins balance!');
            return;
        }

        state.coins -= cost;
        state.unlockedMods.push(modName);
        saveState();
        updateUIState();
        alert(`Successfully unlocked ${modName}!`);
    };

    // Spin Wheel Logic
    const spinWheelBtn = document.getElementById('spinWheelBtn');
    const spinWheelElement = document.getElementById('spinWheelElement');
    const wheelTimerDisplay = document.getElementById('wheelTimerDisplay');

    function checkSpinCooldown() {
        const now = Date.now();
        const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours
        const elapsed = now - state.lastSpinTime;

        if (elapsed < cooldownTime) {
            const remaining = cooldownTime - elapsed;
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            spinWheelBtn.disabled = true;
            wheelTimerDisplay.textContent = `Next spin available in: ${hours}h ${minutes}m`;
            return false;
        } else {
            spinWheelBtn.disabled = false;
            wheelTimerDisplay.textContent = 'Spin Wheel Ready!';
            return true;
        }
    }

    setInterval(checkSpinCooldown, 60000);
    checkSpinCooldown();

    spinWheelBtn.addEventListener('click', () => {
        if (!checkSpinCooldown()) return;

        spinWheelBtn.disabled = true;
        const randomDegree = Math.floor(1800 + Math.random() * 1800); // multiple full rotations + random
        spinWheelElement.style.transform = `rotate(${randomDegree}deg)`;

        setTimeout(() => {
            const winningStipend = [100, 250, 500, 50, 1000, 200][Math.floor(Math.random() * 6)];
            state.coins += winningStipend;
            state.lastSpinTime = Date.now();
            saveState();
            updateUIState();
            alert(`Congratulations! You won ${winningStipend} GMX coins from the wheel.`);
            checkSpinCooldown();
        }, 4000);
    });

    // Daily Claim Logic
    const claimDailyBtn = document.getElementById('claimDailyBtn');
    claimDailyBtn.addEventListener('click', () => {
        const now = Date.now();
        const cooldownTime = 24 * 60 * 60 * 1000;
        if (now - state.lastDailyClaim < cooldownTime) {
            alert('Daily reward already claimed within the last 24 hours!');
            return;
        }

        state.coins += 500;
        state.lastDailyClaim = now;
        saveState();
        updateUIState();
        alert('Claimed +500 daily login coins successfully!');
    });

    // Gift Center Handling
    const giftForm = document.getElementById('giftForm');
    const giftTypeSelect = document.getElementById('giftType');
    const giftCoinAmountContainer = document.getElementById('giftCoinAmountContainer');
    const giftItemSelectContainer = document.getElementById('giftItemSelectContainer');
    const giftsInboxList = document.getElementById('giftsInboxList');

    giftTypeSelect.addEventListener('change', () => {
        if (giftTypeSelect.value === 'coins') {
            giftCoinAmountContainer.style.display = 'block';
            giftItemSelectContainer.style.display = 'none';
        } else {
            giftCoinAmountContainer.style.display = 'none';
            giftItemSelectContainer.style.display = 'block';
        }
    });

    giftForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const recipient = document.getElementById('giftRecipient').value.trim();
        const type = giftTypeSelect.value;
        const message = document.getElementById('giftMessage').value.trim() || 'Enjoy your gift!';
        
        let payloadValue = '';
        if (type === 'coins') {
            const amount = parseInt(document.getElementById('giftCoinsInput').value);
            if (state.coins < amount) {
                alert('You do not have enough coins to send this gift.');
                return;
            }
            state.coins -= amount;
            payloadValue = `${amount} GMX Coins`;
        } else {
            payloadValue = document.getElementById('giftModSelect').value;
        }

        const giftObj = {
            id: Date.now(),
            sender: state.currentUser || 'Operator',
            recipient: recipient,
            type: type,
            payload: payloadValue,
            message: message
        };

        state.giftsInbox.push(giftObj);
        saveState();
        updateUIState();
        giftForm.reset();
        alert(`Gift successfully dispatched to operator ${recipient}!`);
    });

    function renderGiftsInbox() {
        const user = state.currentUser || 'Operator';
        const userGifts = state.giftsInbox.filter(g => g.recipient.toLowerCase() === user.toLowerCase());

        if (userGifts.length === 0) {
            giftsInboxList.innerHTML = '<p class="text-muted" style="text-align:center; padding: 2rem;">No incoming gifts found in your inbox.</p>';
            return;
        }

        let html = '';
        userGifts.forEach(gift => {
            html += `
                <div style="background: var(--bg-deep); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong class="text-gold"><i class="fa-solid fa-user"></i> ${gift.sender}</strong>
                        <span class="mod-version-tag">${gift.payload}</span>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">"${gift.message}"</p>
                    <button class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="claimGift(${gift.id})">Claim Gift</button>
                </div>
            `;
        });
        giftsInboxList.innerHTML = html;
    }

    window.claimGift = function(giftId) {
        const index = state.giftsInbox.findIndex(g => g.id === giftId);
        if (index === -1) return;
        const gift = state.giftsInbox[index];

        if (gift.type === 'coins') {
            const amount = parseInt(gift.payload);
            state.coins += amount;
        } else {
            if (!state.unlockedMods.includes(gift.payload)) {
                state.unlockedMods.push(gift.payload);
            }
        }

        state.giftsInbox.splice(index, 1);
        saveState();
        updateUIState();
        alert('Gift successfully claimed and added to your profile!');
    };

    // Auto-login if previously active session exists
    if (state.currentUser) {
        authOverlay.style.display = 'none';
        updateUIState();
    }
});