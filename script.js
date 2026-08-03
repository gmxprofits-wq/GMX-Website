/**
 * GMX Platform Secure Authentication & Ecosystem Architecture (Fabric 1.21.11 Optimized)
 * Features: Dashboard, Mods Marketplace, 24-Hour Cooldown Spin Wheel, Daily Rewards, Gift Center, and Animated Modals
 */
document.addEventListener('DOMContentLoaded', () => {
    const DB_KEY = 'gmx_users_db';
    const SESSION_KEY = 'gmx_active_session';
    const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

    function getUsersDB() {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : {};
    }

    function saveUsersDB(db) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    async function hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password + "GMX_SALT_2026");
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const state = {
        currentUser: null,
        coins: 1250,
        activePage: 'dashboard',
        isSpinning: false,
        currentRotation: 0
    };

    const elements = {
        authOverlay: document.getElementById('authOverlay'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingText: document.getElementById('loadingText'),
        appWorkspace: document.getElementById('appWorkspace'),
        authTabs: document.querySelectorAll('.auth-tab'),
        authForms: document.querySelectorAll('.auth-form'),
        loginForm: document.getElementById('loginFormContainer'),
        registerForm: document.getElementById('registerFormContainer'),
        loginAlert: document.getElementById('loginAlert'),
        registerAlert: document.getElementById('registerAlert'),
        registerSuccess: document.getElementById('registerSuccess'),
        navItems: document.querySelectorAll('.nav-item'),
        pageViews: document.querySelectorAll('.page-view'),
        pageTitleHeading: document.getElementById('pageTitleHeading'),
        headerCoinDisplay: document.getElementById('headerCoinDisplay'),
        headerUsernameDisplay: document.getElementById('headerUsernameDisplay'),
        headerUserAvatar: document.getElementById('headerUserAvatar'),
        dashUsername: document.getElementById('dashUsername'),
        profileUsername: document.getElementById('profileUsername'),
        profileEmail: document.getElementById('profileEmail'),
        profileCoinBalance: document.getElementById('profileCoinBalance'),
        logoutBtn: document.getElementById('logoutBtn'),
        spinWheelBtn: document.getElementById('spinWheelBtn'),
        spinWheelElement: document.getElementById('spinWheelElement'),
        wheelTimerDisplay: document.getElementById('wheelTimerDisplay'),
        claimDailyBtn: document.getElementById('claimDailyBtn'),
        giftForm: document.getElementById('giftForm'),
        giftRecipient: document.getElementById('giftRecipient'),
        giftType: document.getElementById('giftType'),
        giftItemSelectContainer: document.getElementById('giftItemSelectContainer'),
        giftCoinAmountContainer: document.getElementById('giftCoinAmountContainer'),
        giftCoinsInput: document.getElementById('giftCoinsInput'),
        giftModSelect: document.getElementById('giftModSelect'),
        giftMessage: document.getElementById('giftMessage')
    };

    function checkActiveSession() {
        const activeUserJson = localStorage.getItem(SESSION_KEY);
        if (activeUserJson) {
            const userData = JSON.parse(activeUserJson);
            // Refresh from database to ensure fresh state (like gifts/inventory)
            const db = getUsersDB();
            const freshUser = db[userData.username] || userData;
            loginUserSession(freshUser, false);
        }
    }

    elements.authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-auth-target');
            elements.authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            elements.authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${target}FormContainer`) {
                    form.classList.add('active');
                }
            });
            if (elements.loginAlert) elements.loginAlert.style.display = 'none';
            if (elements.registerAlert) elements.registerAlert.style.display = 'none';
            if (elements.registerSuccess) elements.registerSuccess.style.display = 'none';
        });
    });

    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            elements.registerAlert.style.display = 'none';
            elements.registerSuccess.style.display = 'none';

            const email = document.getElementById('regEmail').value.trim();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                elements.registerAlert.textContent = "Please enter a valid email address.";
                elements.registerAlert.style.display = 'block';
                return;
            }

            const db = getUsersDB();
            if (db[username]) {
                elements.registerAlert.textContent = "Username is already taken. Choose another.";
                elements.registerAlert.style.display = 'block';
                return;
            }

            showLoader(true, "Creating secure GMX Profile...");
            const passwordHash = await hashPassword(password);

            setTimeout(() => {
                db[username] = {
                    email: email,
                    username: username,
                    passwordHash: passwordHash,
                    coins: 1250,
                    lastDailyClaim: null,
                    lastSpinTime: null,
                    inventory: [],
                    giftsInbox: [],
                    createdAt: new Date().toISOString()
                };
                saveUsersDB(db);
                showLoader(false);

                elements.registerSuccess.textContent = "Registration Successful! Redirecting to login portal...";
                elements.registerSuccess.style.display = 'block';

                setTimeout(() => {
                    elements.registerSuccess.style.display = 'none';
                    elements.registerForm.reset();
                    document.querySelector('[data-auth-target="login"]').click();
                    document.getElementById('loginUsername').value = username;
                }, 1500);
            }, 1000);
        });
    }

    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            elements.loginAlert.style.display = 'none';

            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            const db = getUsersDB();
            const user = db[username];

            if (!user) {
                elements.loginAlert.textContent = "Wrong username or password.";
                elements.loginAlert.style.display = 'block';
                return;
            }

            const passwordHash = await hashPassword(password);
            if (user.passwordHash !== passwordHash) {
                elements.loginAlert.textContent = "Wrong username or password.";
                elements.loginAlert.style.display = 'block';
                return;
            }

            showLoader(true, "Authenticating credentials & Loading profile...");

            setTimeout(() => {
                showLoader(false);
                loginUserSession(user, rememberMe);
            }, 1200);
        });
    }

    function loginUserSession(user, remember) {
        state.currentUser = user.username;
        state.coins = user.coins || 1250;

        if (remember) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        }

        if (elements.headerUsernameDisplay) elements.headerUsernameDisplay.textContent = user.username;
        if (elements.headerUserAvatar) elements.headerUserAvatar.textContent = user.username.substring(0, 2).toUpperCase();
        if (elements.dashUsername) elements.dashUsername.textContent = user.username;
        if (elements.profileUsername) elements.profileUsername.textContent = user.username;
        if (elements.profileEmail) elements.profileEmail.textContent = user.email;
        
        updateCoinDisplays();
        renderGiftsInbox();
        checkWheelCooldownStatus();

        if (elements.authOverlay) elements.authOverlay.style.display = 'none';
        if (elements.appWorkspace) elements.appWorkspace.style.display = 'block';

        checkIncomingGifts(user);
    }

    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(SESSION_KEY);
            window.location.reload();
        });
    }

    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.getAttribute('data-page');
            if (!targetPage) return;

            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            elements.pageViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${targetPage}-view`) {
                    view.classList.add('active');
                }
            });

            state.activePage = targetPage;
            if (elements.pageTitleHeading) elements.pageTitleHeading.textContent = item.textContent.trim();
            if (targetPage === 'gifts') {
                renderGiftsInbox();
            }
            if (targetPage === 'wheel') {
                checkWheelCooldownStatus();
            }
        });
    });

    // 24-Hour Cooldown Spin Wheel Logic
    function checkWheelCooldownStatus() {
        if (!state.currentUser) return;
        const db = getUsersDB();
        const user = db[state.currentUser];
        if (!user) return;

        const now = Date.now();
        const lastSpin = user.lastSpinTime || 0;
        const elapsed = now - lastSpin;

        if (elapsed < COOLDOWN_MS) {
            const remaining = COOLDOWN_MS - elapsed;
            elements.spinWheelBtn.disabled = true;
            startCooldownTimer(remaining);
        } else {
            elements.spinWheelBtn.disabled = false;
            if (elements.wheelTimerDisplay) {
                elements.wheelTimerDisplay.textContent = "Status: Ready to spin!";
            }
        }
    }

    let wheelTimerInterval = null;
    function startCooldownTimer(durationMs) {
        if (wheelTimerInterval) clearInterval(wheelTimerInterval);

        let timeLeft = durationMs;
        updateTimerText(timeLeft);

        wheelTimerInterval = setInterval(() => {
            timeLeft -= 1000;
            if (timeLeft <= 0) {
                clearInterval(wheelTimerInterval);
                elements.spinWheelBtn.disabled = false;
                if (elements.wheelTimerDisplay) {
                    elements.wheelTimerDisplay.textContent = "Status: Ready to spin!";
                }
            } else {
                updateTimerText(timeLeft);
            }
        }, 1000);
    }

    function updateTimerText(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        if (elements.wheelTimerDisplay) {
            elements.wheelTimerDisplay.textContent = `Cooldown active: ${hours}h ${minutes}m ${seconds}s remaining`;
        }
    }

    if (elements.spinWheelBtn && elements.spinWheelElement) {
        elements.spinWheelBtn.addEventListener('click', () => {
            if (state.isSpinning) return;

            const db = getUsersDB();
            const user = db[state.currentUser];
            const now = Date.now();
            if (user && user.lastSpinTime && (now - user.lastSpinTime < COOLDOWN_MS)) {
                showCustomAlert("You can only spin the wheel once every 24 hours! Please wait for the cooldown.", "warning");
                return;
            }

            state.isSpinning = true;
            elements.spinWheelBtn.disabled = true;

            const prizes = [100, 250, 500, 50, 1000, 200];
            const randomSegment = Math.floor(Math.random() * prizes.length);
            const degreesPerSegment = 360 / prizes.length;
            
            const extraSpins = 5 * 360;
            const targetDegree = extraSpins + (360 - (randomSegment * degreesPerSegment)) - (degreesPerSegment / 2);
            
            state.currentRotation += targetDegree;
            elements.spinWheelElement.style.transform = `rotate(${state.currentRotation}deg)`;

            setTimeout(() => {
                state.isSpinning = false;
                const wonAmount = prizes[randomSegment];
                state.coins += wonAmount;
                updateCoinDisplays();
                syncUserCoins();

                if (user) {
                    user.lastSpinTime = Date.now();
                    saveUsersDB(db);
                }

                showCustomAlert(`Congratulations! Won +${wonAmount} GMX Coins from spin wheel!`, 'success');
                checkWheelCooldownStatus();
            }, 4000);
        });
    }

    if (elements.claimDailyBtn) {
        elements.claimDailyBtn.addEventListener('click', () => {
            const db = getUsersDB();
            const user = db[state.currentUser];
            const todayStr = new Date().toDateString();

            if (user && user.lastDailyClaim === todayStr) {
                showCustomAlert("You have already claimed your daily reward today! Come back tomorrow.", "warning");
                return;
            }

            state.coins += 500;
            updateCoinDisplays();
            if (user) {
                user.lastDailyClaim = todayStr;
                user.coins = state.coins;
                saveUsersDB(db);
                if (localStorage.getItem(SESSION_KEY)) {
                    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
                }
            }
            showCustomAlert("Successfully claimed +500 GMX Coins daily reward stipend!", "success");
        });
    }

    window.purchaseMod = function(cost, modName) {
        if (state.coins >= cost) {
            state.coins -= cost;
            updateCoinDisplays();
            syncUserCoins();
            
            const db = getUsersDB();
            if (db[state.currentUser]) {
                if (!db[state.currentUser].inventory) db[state.currentUser].inventory = [];
                db[state.currentUser].inventory.push(modName);
                saveUsersDB(db);
            }

            showCustomAlert(`Successfully unlocked ${modName}! Added to your inventory.`, 'success');
        } else {
            showCustomAlert("Insufficient GMX Coins! Spin the wheel or claim daily rewards to get more.", 'error');
        }
    };

    if (elements.giftType) {
        elements.giftType.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'coins') {
                elements.giftCoinAmountContainer.style.display = 'block';
                elements.giftItemSelectContainer.style.display = 'none';
            } else {
                elements.giftCoinAmountContainer.style.display = 'none';
                elements.giftItemSelectContainer.style.display = 'block';
            }
        });
    }

    if (elements.giftForm) {
        elements.giftForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const recipientNameInput = elements.giftRecipient.value.trim();
            const type = elements.giftType.value;
            const message = elements.giftMessage.value.trim() || "Enjoy your gift from GMX Platform!";

            const db = getUsersDB();
            
            // Case-insensitive user key lookup for safety
            const recipientKey = Object.keys(db).find(k => k.toLowerCase() === recipientNameInput.toLowerCase());
            const recipientUser = recipientKey ? db[recipientKey] : null;

            if (!recipientUser) {
                showCustomAlert(`User "${recipientNameInput}" does not exist in the GMX network.`, "error");
                return;
            }

            if (recipientUser.username === state.currentUser) {
                showCustomAlert("You cannot send gifts to yourself!", "error");
                return;
            }

            const senderUser = db[state.currentUser];

            if (type === 'coins') {
                const amount = parseInt(elements.giftCoinsInput.value);
                if (isNaN(amount) || amount <= 0) {
                    showCustomAlert("Please enter a valid coin amount.", "error");
                    return;
                }
                if (state.coins < amount) {
                    showCustomAlert("You do not have enough coins to send this gift!", "error");
                    return;
                }

                // Deduct from sender
                state.coins -= amount;
                updateCoinDisplays();
                senderUser.coins = state.coins;

                // Push to recipient's giftsInbox
                if (!recipientUser.giftsInbox) recipientUser.giftsInbox = [];
                recipientUser.giftsInbox.push({
                    sender: state.currentUser,
                    type: 'coins',
                    amount: amount,
                    message: message,
                    timestamp: new Date().toISOString(),
                    claimed: false
                });

                // Save both sender and recipient updates back to the DB persistence layer
                db[state.currentUser] = senderUser;
                db[recipientUser.username] = recipientUser;
                saveUsersDB(db);

                showCustomAlert(`Successfully sent ${amount} GMX Coins to ${recipientUser.username} with custom message!`, "success");
                triggerGiftAnimationEffects();
                elements.giftForm.reset();

            } else {
                const modName = elements.giftModSelect.value;
                
                if (!senderUser.inventory || !senderUser.inventory.includes(modName)) {
                    showCustomAlert("You do not own this mod in your inventory to gift it!", "error");
                    return;
                }

                // Remove from sender inventory
                senderUser.inventory = senderUser.inventory.filter(item => item !== modName);

                // Push to recipient's giftsInbox
                if (!recipientUser.giftsInbox) recipientUser.giftsInbox = [];
                recipientUser.giftsInbox.push({
                    sender: state.currentUser,
                    type: 'mod',
                    modName: modName,
                    message: message,
                    timestamp: new Date().toISOString(),
                    claimed: false
                });

                // Save both sender and recipient updates back to the DB persistence layer
                db[state.currentUser] = senderUser;
                db[recipientUser.username] = recipientUser;
                saveUsersDB(db);

                showCustomAlert(`Successfully sent mod "${modName}" to ${recipientUser.username}!`, "success");
                triggerGiftAnimationEffects();
                elements.giftForm.reset();
            }
        });
    }

    function renderGiftsInbox() {
        const inboxListContainer = document.getElementById('giftsInboxList');
        if (!inboxListContainer) return;

        const db = getUsersDB();
        const user = db[state.currentUser];
        if (!user || !user.giftsInbox || user.giftsInbox.length === 0) {
            inboxListContainer.innerHTML = `<p class="text-muted" style="text-align:center; padding: 2rem;">No incoming gifts found in your inbox.</p>`;
            return;
        }

        let html = '';
        user.giftsInbox.forEach((gift, index) => {
            const giftTitle = gift.type === 'coins' ? `${gift.amount} GMX Coins` : `Mod: ${gift.modName}`;
            html += `
                <div class="mod-card" style="padding: 1.25rem; margin-bottom: 1rem; flex-direction: row; align-items: center; justify-content: space-between;">
                    <div>
                        <div class="mod-tags"><span class="mod-tag tag-pvp">Gift from @${gift.sender}</span></div>
                        <h3 style="font-size: 1.1rem; margin: 0.25rem 0;">${giftTitle}</h3>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">"${gift.message}"</p>
                    </div>
                    <div>
                        ${gift.claimed ? '<span class="text-gold" style="font-weight: 700;">Claimed</span>' : `<button class="btn-primary" onclick="claimGiftItem(${index})">Claim Gift</button>`}
                    </div>
                </div>
            `;
        });
        inboxListContainer.innerHTML = html;
    }

    window.claimGiftItem = function(index) {
        const db = getUsersDB();
        const user = db[state.currentUser];
        if (!user || !user.giftsInbox || !user.giftsInbox[index]) return;

        const gift = user.giftsInbox[index];
        if (gift.claimed) return;

        gift.claimed = true;
        if (gift.type === 'coins') {
            state.coins += gift.amount;
            updateCoinDisplays();
            user.coins = state.coins;
        } else {
            if (!user.inventory) user.inventory = [];
            user.inventory.push(gift.modName);
        }

        db[state.currentUser] = user;
        saveUsersDB(db);
        renderGiftsInbox();
        triggerGiftAnimationEffects();
        showCustomAlert("Gift successfully claimed and added to your account with festive alert animations!", "success");
    }

    function checkIncomingGifts(user) {
        if (user.giftsInbox && user.giftsInbox.some(g => !g.claimed)) {
            setTimeout(() => {
                showCustomAlert("🎁 You have unopened gifts waiting in your Gift Center Inbox!", "success");
            }, 1000);
        }
    }

    function showCustomAlert(message, type = 'success') {
        let alertBox = document.getElementById('gmxCustomAlertModal');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.id = 'gmxCustomAlertModal';
            alertBox.className = 'auth-overlay';
            alertBox.style.zIndex = '5000';
            document.body.appendChild(alertBox);
        }

        const borderColor = type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--accent)' : 'var(--danger)';
        const iconClass = type === 'success' ? 'fa-circle-check text-gold' : 'fa-triangle-exclamation';

        alertBox.innerHTML = `
            <div class="auth-container" style="border-color: ${borderColor}; animation: popInModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-size: 3rem; margin-bottom: 1rem;"><i class="fa-solid ${iconClass}"></i></div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">GMX Notification</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1rem; line-height: 1.5;">${message}</p>
                <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="document.getElementById('gmxCustomAlertModal').style.display='none'">Awesome, Thanks!</button>
            </div>
        `;
        alertBox.style.display = 'flex';
    }

    function triggerGiftAnimationEffects() {
        const burst = document.createElement('div');
        burst.style.position = 'fixed';
        burst.style.top = '0';
        burst.style.left = '0';
        burst.style.width = '100vw';
        burst.style.height = '100vh';
        burst.style.zIndex = '4000';
        burst.style.pointerEvents = 'none';
        burst.style.background = 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(3,7,18,0) 70%)';
        burst.style.animation = 'fadeInOutEffect 1.5s ease forwards';
        document.body.appendChild(burst);

        setTimeout(() => {
            burst.remove();
        }, 1500);
    }

    function syncUserCoins() {
        const db = getUsersDB();
        if (db[state.currentUser]) {
            db[state.currentUser].coins = state.coins;
            saveUsersDB(db);
            if (localStorage.getItem(SESSION_KEY)) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(db[state.currentUser]));
            }
        }
    }

    function updateCoinDisplays() {
        if (elements.headerCoinDisplay) elements.headerCoinDisplay.textContent = state.coins.toLocaleString();
        if (elements.profileCoinBalance) elements.profileCoinBalance.textContent = state.coins.toLocaleString();
    }

    function showLoader(show, text = "Loading...") {
        if (elements.loadingText) elements.loadingText.textContent = text;
        if (elements.loadingOverlay) elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    checkActiveSession();
});