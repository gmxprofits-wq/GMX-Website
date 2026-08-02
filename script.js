// --- DATABASE & STATE MANAGEMENT ---
let db = {
    users: JSON.parse(localStorage.getItem('gmx_users')) || [],
    currentUser: JSON.parse(localStorage.getItem('gmx_current_user')) || null
};

// Official Store Catalog featuring the exact mods requested with real file handles
const storeCatalog = [
    { 
        id: 'mod_gmx', 
        type: 'mod', 
        name: 'GMX Performance Optimizer', 
        version: 'v1.jar (Fabric)', 
        tag: 'Performance', 
        tagClass: 'tag-perf', 
        icon: '⚡', 
        shortDesc: 'Powerful Minecraft performance mod designed to make your game run faster and smoother.',
        desc: 'GMX Performance Optimizer is a powerful Minecraft performance mod designed to make your game run faster and smoother. It optimizes rendering, reduces unnecessary lag, improves frame stability, and helps players get better FPS without changing normal gameplay.',
        features: [
            '🚀 FPS Boost Optimization',
            '⚡ Faster Chunk Rendering',
            '🧠 Memory Usage Improvements',
            '🎮 Reduced Stuttering',
            '🌎 Smoother World Loading',
            '✨ Particle Optimization',
            '👥 Entity Rendering Optimization',
            '💻 Low-End PC Support'
        ],
        price: 200, 
        fileName: 'GMX v1.jar',
        // Base64 simulated binary content for instant browser download simulation
        fileContent: 'UEsDBBQACAgI...GMX_PERFORMANCE_CORE_JAR_DATA' 
    },
    { 
        id: 'mod_crystal', 
        type: 'mod', 
        name: 'GMX Crystal Optimizer', 
        version: 'v1.jar (Fabric)', 
        tag: 'PvP & Optimization', 
        tagClass: 'tag-perf', 
        icon: '💎', 
        shortDesc: 'Improve Minecraft performance during intense fights with optimized crystal and explosion rendering.',
        desc: 'GMX Crystal Optimizer is designed for players who experience FPS drops during high-action situations. It reduces unnecessary visual effects and improves rendering performance while keeping Minecraft looking great.',
        features: [
            '💎 Crystal Rendering Optimization',
            '💥 Explosion Effect Optimization',
            '✨ Particle Reduction',
            '⚡ Better Frame Stability',
            '🖥️ Performance Settings Menu'
        ],
        price: 500, 
        fileName: 'GMXCrystalPerformance v1.jar',
        fileContent: 'UEsDBBQACAgI...GMX_CRYSTAL_OPTIMIZER_JAR_DATA'
    },
    { 
        id: 'mod_combathud', 
        type: 'mod', 
        name: 'GMX CombatHUD', 
        version: 'v1.jar (Fabric)', 
        tag: 'PvP Mod', 
        tagClass: 'tag-pvp', 
        icon: '⚔️', 
        shortDesc: 'A clean PvP information HUD that displays important gameplay statistics.',
        desc: 'GMX CombatHUD adds a customizable PvP overlay to Minecraft. It helps players view important information quickly with a modern and clean interface.',
        features: [
            '❤️ Health Display',
            '🛡️ Armor Durability',
            '⚔️ Weapon Durability',
            '📊 FPS Counter',
            '📍 Coordinates Display',
            '⏱️ Effect Timers',
            '🎮 Customizable HUD Layout'
        ],
        price: 300, 
        fileName: 'GMXCombatHUD v1.jar',
        fileContent: 'UEsDBBQACAgI...GMX_COMBAT_HUD_JAR_DATA'
    },
    { 
        id: 'mod_autoaxe', 
        type: 'mod', 
        name: 'GMX AutoAxe', 
        version: 'v1.jar (Fabric)', 
        tag: 'PvP Mod', 
        tagClass: 'tag-pvp', 
        icon: '🪓', 
        shortDesc: 'A smart PvP utility mod that helps players manage axe combat situations.',
        desc: 'GMX AutoAxe is a Minecraft PvP utility mod designed to improve combat efficiency and player experience. It provides helpful combat features and quality-of-life improvements for axe-based PvP while keeping gameplay controlled by the player.',
        features: [
            '🪓 Axe Combat Assistance',
            '⚡ Faster Item Switching',
            '🛡️ Shield Combat Awareness',
            '🎮 Customizable Settings',
            '⌨️ Keybind Support',
            '🖥️ Clean GMX Interface',
            '⚙️ Lightweight Performance'
        ],
        price: 350, 
        fileName: 'GMXAutoAxe v1.jar',
        fileContent: 'UEsDBBQACAgI...GMX_AUTO_AXE_JAR_DATA'
    }
];

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    if(db.currentUser) {
        initApp();
    }
});

function saveDatabase() {
    localStorage.setItem('gmx_users', JSON.stringify(db.users));
    if(db.currentUser) {
        localStorage.setItem('gmx_current_user', JSON.stringify(db.currentUser));
        const idx = db.users.findIndex(u => u.username === db.currentUser.username);
        if(idx !== -1) db.users[idx] = db.currentUser;
        localStorage.setItem('gmx_users', JSON.stringify(db.users));
    }
}

// --- ALERT SYSTEM ---
function showAlert(message, type = 'error') {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `gmx-alert ${type}`;
    let icon = '⚠️';
    if(type === 'success') icon = '✅';
    if(type === 'gold-alert') icon = '🪙';
    
    alert.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// --- AUTHENTICATION ---
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    if(tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if(db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        showAlert('Username already exists!', 'error');
        return;
    }

    const newUser = {
        username: username,
        password: password,
        coins: 1500,
        library: [],
        receivedGifts: [],
        sentGifts: [],
        rewardHistory: [],
        lastDailyClaim: 0,
        spinCooldown: 0
    };

    db.users.push(newUser);
    db.currentUser = newUser;
    saveDatabase();

    showAlert('Account created successfully!', 'success');
    document.getElementById('auth-overlay').classList.add('hidden');
    initApp();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if(!user) {
        showAlert('Wrong password or username!', 'error');
        return;
    }

    db.currentUser = user;
    saveDatabase();

    showAlert('Login successful!', 'success');
    document.getElementById('auth-overlay').classList.add('hidden');
    initApp();
}

function logoutUser() {
    db.currentUser = null;
    localStorage.removeItem('gmx_current_user');
    document.getElementById('auth-overlay').classList.remove('hidden');
}

function checkAuthState() {
    if(db.currentUser) {
        document.getElementById('auth-overlay').classList.add('hidden');
    } else {
        document.getElementById('auth-overlay').classList.remove('hidden');
    }
}

function initApp() {
    updateCoinDisplay();
    document.getElementById('nav-username').innerText = db.currentUser.username;
    navigate('home');
    checkIncomingGifts();
}

function updateCoinDisplay() {
    if(!db.currentUser) return;
    document.getElementById('nav-coin-balance').innerText = db.currentUser.coins.toLocaleString();
}

// --- ROUTER SYSTEM ---
function navigate(page) {
    const main = document.getElementById('main-content');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    event?.target?.classList?.add('active');

    switch(page) {
        case 'home': renderHome(main); break;
        case 'store': renderStore(main); break;
        case 'daily': renderDaily(main); break;
        case 'wheel': renderWheel(main); break;
        case 'gifts': renderGifts(main); break;
        case 'blog': renderBlog(main); break;
        case 'about': renderAbout(main); break;
        case 'profile': renderProfile(main); break;
        default: renderHome(main);
    }
}

// --- VIEW RENDERERS ---

function renderHome(container) {
    container.innerHTML = `
        <div class="hero-section">
            <h1>ELITE MINECRAFT <span class="highlight">MOD ECOSYSTEM</span></h1>
            <p>Access high-performance PvP optimization mods, custom overlays, and utility tools engineered for professional competition.</p>
            <div class="hero-btns">
                <button class="gmx-btn primary glow-red" onclick="navigate('store')">Browse Store</button>
                <button class="gmx-btn gold glow-gold" onclick="navigate('wheel')">Spin & Win</button>
            </div>
        </div>
        <h2 style="margin-bottom: 20px;">Featured GMX Mods</h2>
        <div class="store-grid">
            ${storeCatalog.slice(0, 2).map(mod => createModCardHTML(mod)).join('')}
        </div>
    `;
}

function renderStore(container) {
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2>GMX <span class="highlight">MOD STORE</span></h2>
            <p style="color:var(--text-muted)">Unlock mods using your GMX Coins.</p>
        </div>
        <div class="store-grid">
            ${storeCatalog.map(mod => createModCardHTML(mod)).join('')}
        </div>
    `;
}

function createModCardHTML(mod) {
    const owned = db.currentUser.library.some(item => item.id === mod.id);
    return `
        <div class="mod-card">
            <div class="mod-header">
                <div class="mod-icon">${mod.icon}</div>
                <div class="mod-title-area">
                    <h3>${mod.name}</h3>
                    <span class="tag ${mod.tagClass}">${mod.tag}</span>
                </div>
            </div>
            <div class="mod-body">
                <p>${mod.shortDesc}</p>
                <ul class="mod-features">
                    ${mod.features.slice(0, 4).map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>
            <div class="mod-footer">
                <div class="mod-price">🪙 ${mod.price} GMX</div>
                ${owned ? 
                    `<button class="gmx-btn gold" style="width:auto; padding:8px 16px;" onclick="downloadMod('${mod.id}')">Download .jar 📥</button>` :
                    `<button class="gmx-btn primary" style="width:auto; padding:8px 16px;" onclick="buyMod('${mod.id}')">Purchase</button>`
                }
            </div>
        </div>
    `;
}

function buyMod(modId) {
    const mod = storeCatalog.find(m => m.id === modId);
    if(!mod) return;

    if(db.currentUser.coins < mod.price) {
        showAlert('Not enough GMX Coins! Earn more via Daily Rewards or Spin Wheel.', 'error');
        return;
    }

    db.currentUser.coins -= mod.price;
    db.currentUser.library.push(mod);
    saveDatabase();
    updateCoinDisplay();

    showAlert(`Successfully purchased ${mod.name}! Added to your library.`, 'success');
    navigate('store');
}

// --- DIRECT MOD DOWNLOAD FUNCTION ---
function downloadMod(modId) {
    const mod = storeCatalog.find(m => m.id === modId);
    if(!mod) return;

    // Create a Blob containing the simulated mod binary data and trigger a file download
    const blob = new Blob([mod.fileContent], { type: 'application/java-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mod.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert(`Downloading ${mod.fileName}... Check your downloads!`, 'success');
}

function renderDaily(container) {
    const now = Date.now();
    const cooldownTime = 24 * 60 * 60 * 1000;
    const timePassed = now - db.currentUser.lastDailyClaim;
    const canClaim = timePassed >= cooldownTime;

    container.innerHTML = `
        <div class="daily-container">
            <div class="gmx-card daily-box">
                <h2>DAILY <span class="highlight">REWARD CLAIM</span></h2>
                <p>Claim 500 GMX Coins every 24 hours to fund your mod acquisitions.</p>
                <div class="coin-chest glow-gold-pulse">🪙</div>
                <div id="daily-timer-display" class="countdown-timer">
                    ${canClaim ? 'READY TO CLAIM!' : calculateCountdown(cooldownTime - timePassed)}
                </div>
                <button id="claim-btn" class="gmx-btn gold glow-gold" ${canClaim ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'} onclick="claimDailyReward()">
                    Claim 500 Coins
                </button>
            </div>
        </div>
    `;
}

function calculateCountdown(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `Reset in: ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(() => {
    const timerDisplay = document.getElementById('daily-timer-display');
    if(timerDisplay && db.currentUser) {
        const now = Date.now();
        const cooldownTime = 24 * 60 * 60 * 1000;
        const timePassed = now - db.currentUser.lastDailyClaim;
        if(timePassed < cooldownTime) {
            timerDisplay.innerText = calculateCountdown(cooldownTime - timePassed);
        } else {
            timerDisplay.innerText = 'READY TO CLAIM!';
            const btn = document.getElementById('claim-btn');
            if(btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
        }
    }
}, 1000);

function claimDailyReward() {
    db.currentUser.coins += 500;
    db.currentUser.lastDailyClaim = Date.now();
    db.currentUser.rewardHistory.push({ type: 'Daily Reward', amount: 500, date: new Date().toLocaleDateString() });
    saveDatabase();
    updateCoinDisplay();
    showAlert('Successfully claimed 500 GMX Coins!', 'success');
    renderDaily(document.getElementById('main-content'));
}

function renderWheel(container) {
    container.innerHTML = `
        <div class="wheel-container">
            <h2>GMX <span class="highlight">SPIN WHEEL</span></h2>
            <p>Test your luck and win up to 5,000 GMX Coins!</p>
            <div class="wheel-wrapper">
                <div class="wheel-pointer"></div>
                <div id="spin-wheel" class="spin-wheel">
                    <div class="wheel-slice" style="transform: rotate(0deg) skewY(-60deg); background:#111;">50 🪙</div>
                    <div class="wheel-slice" style="transform: rotate(60deg) skewY(-60deg); background:#1a1a22;">100 🪙</div>
                    <div class="wheel-slice" style="transform: rotate(120deg) skewY(-60deg); background:#111;">250 🪙</div>
                    <div class="wheel-slice" style="transform: rotate(180deg) skewY(-60deg); background:#1a1a22;">500 🪙</div>
                    <div class="wheel-slice" style="transform: rotate(240deg) skewY(-60deg); background:#111;">1000 🪙</div>
                    <div class="wheel-slice" style="transform: rotate(300deg) skewY(-60deg); background:#1a1a22; color:var(--gold-primary);">5000 🪙</div>
                </div>
            </div>
            <button id="spin-btn" class="gmx-btn primary glow-red" onclick="spinWheel()">Spin the Wheel (Cost: 100 🪙)</button>
        </div>
    `;
}

let isSpinning = false;
function spinWheel() {
    if(isSpinning) return;
    if(db.currentUser.coins < 100) {
        showAlert('You need at least 100 GMX Coins to spin!', 'error');
        return;
    }

    db.currentUser.coins -= 100;
    updateCoinDisplay();
    isSpinning = true;
    document.getElementById('spin-btn').disabled = true;

    const wheel = document.getElementById('spin-wheel');
    const rewards = [50, 100, 250, 500, 1000, 5000];
    const weights = [40, 30, 15, 10, 4, 1];
    
    let rand = Math.random() * 100;
    let cumulative = 0;
    let winningIndex = 0;
    for(let i=0; i<weights.length; i++) {
        cumulative += weights[i];
        if(rand <= cumulative) { winningIndex = i; break; }
    }

    const degreesPerSlice = 60;
    const targetDegree = 360 * 5 + (winningIndex * degreesPerSlice) + 30;
    wheel.style.transform = `rotate(${targetDegree}deg)`;

    setTimeout(() => {
        const wonAmount = rewards[winningIndex];
        db.currentUser.coins += wonAmount;
        db.currentUser.rewardHistory.push({ type: 'Spin Wheel', amount: wonAmount, date: new Date().toLocaleDateString() });
        saveDatabase();
        updateCoinDisplay();
        showAlert(`Congratulations! You won ${wonAmount} GMX Coins!`, 'gold-alert');
        isSpinning = false;
        document.getElementById('spin-btn').disabled = false;
    }, 4000);
}

function renderGifts(container) {
    container.innerHTML = `
        <div class="gift-center-grid">
            <div class="gmx-card">
                <h2>SEND A <span class="highlight">GIFT</span></h2>
                <p style="color:var(--text-muted); margin-bottom:20px;">Surprise another agent with a mod or custom package.</p>
                <form onsubmit="sendGift(event)">
                    <div class="input-group">
                        <label>Receiver Username</label>
                        <input type="text" id="gift-receiver" required placeholder="Enter exact username...">
                    </div>
                    <div class="input-group">
                        <label>Select Item</label>
                        <select id="gift-item-select">
                            ${storeCatalog.map(m => `<option value="${m.id}">${m.name} (${m.price} 🪙)</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Personal Message / Letter</label>
                        <textarea id="gift-message" rows="4" required placeholder="Hope you enjoy this GMX mod!"></textarea>
                    </div>
                    <button type="submit" class="gmx-btn primary glow-red">Dispatch Gift</button>
                </form>
            </div>
            <div class="gmx-card">
                <h2>GIFT <span class="highlight">HISTORY</span></h2>
                <p style="color:var(--text-muted); margin-bottom:20px;">Log of gifts dispatched to other players.</p>
                <div style="display:flex; flex-direction:column; gap:10px; max-height:350px; overflow-y:auto;">
                    ${db.currentUser.sentGifts.length === 0 ? '<p style="color:#666;">No gifts sent yet.</p>' : 
                        db.currentUser.sentGifts.map(g => `
                            <div style="background:#08080a; padding:12px; border-radius:6px; border:1px solid var(--border-color);">
                                <div style="font-family:var(--font-heading); font-size:14px; color:var(--gold-primary);">To: ${g.receiver}</div>
                                <div style="font-size:14px; color:#ccc;">Item: ${g.item.name}</div>
                                <div style="font-size:12px; font-style:italic; color:#888;">"${g.message}"</div>
                            </div>
                        `).join('')}
                </div>
            </div>
        </div>
    `;
}

function sendGift(e) {
    e.preventDefault();
    const receiverName = document.getElementById('gift-receiver').value.trim();
    const itemId = document.getElementById('gift-item-select').value;
    const message = document.getElementById('gift-message').value;

    if(receiverName.toLowerCase() === db.currentUser.username.toLowerCase()) {
        showAlert('You cannot gift items to yourself!', 'error');
        return;
    }

    const receiverUser = db.users.find(u => u.username.toLowerCase() === receiverName.toLowerCase());
    if(!receiverUser) {
        showAlert('Receiver username not found in GMX network!', 'error');
        return;
    }

    const mod = storeCatalog.find(m => m.id === itemId);
    if(db.currentUser.coins < mod.price) {
        showAlert('Not enough GMX Coins to purchase and send this gift!', 'error');
        return;
    }

    db.currentUser.coins -= mod.price;
    updateCoinDisplay();

    const giftPackage = {
        sender: db.currentUser.username,
        item: mod,
        message: message
    };

    receiverUser.receivedGifts.push(giftPackage);
    db.currentUser.sentGifts.push({ receiver: receiverName, item: mod, message: message });
    saveDatabase();

    showAlert(`Gift successfully dispatched to ${receiverName}!`, 'success');
    document.getElementById('gift-receiver').value = '';
    document.getElementById('gift-message').value = '';
    navigate('gifts');
}

let activeGiftData = null;
function checkIncomingGifts() {
    if(db.currentUser.receivedGifts && db.currentUser.receivedGifts.length > 0) {
        activeGiftData = db.currentUser.receivedGifts[0];
        document.getElementById('gift-sender-text').innerText = `From Agent: ${activeGiftData.sender}`;
        document.getElementById('gift-content-reveal').classList.add('hidden');
        document.getElementById('interactive-gift-box').classList.remove('hidden');
        document.getElementById('gift-modal').classList.remove('hidden');
    }
}

function openActiveGift() {
    document.getElementById('interactive-gift-box').classList.add('hidden');
    document.getElementById('gift-letter-display').innerText = `"${activeGiftData.message}"`;
    document.getElementById('gift-item-display').innerHTML = `
        <div style="background:#111; padding:15px; border-radius:6px; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px; text-align:left;">
            <span style="font-size:32px;">${activeGiftData.item.icon}</span>
            <div>
                <h4 style="font-size:16px;">${activeGiftData.item.name}</h4>
                <span class="tag ${activeGiftData.item.tagClass}">${activeGiftData.item.tag}</span>
            </div>
        </div>
    `;
    document.getElementById('gift-content-reveal').classList.remove('hidden');
}

function claimGiftContent() {
    if(!db.currentUser.library.some(i => i.id === activeGiftData.item.id)) {
        db.currentUser.library.push(activeGiftData.item);
    }
    db.currentUser.receivedGifts.shift();
    saveDatabase();

    document.getElementById('gift-modal').classList.add('hidden');
    showAlert('Gift successfully claimed and added to your library!', 'success');
    checkIncomingGifts();
}

function renderBlog(container) {
    container.innerHTML = `
        <h2>UPDATES <span class="highlight">BLOG</span></h2>
        <p style="color:var(--text-muted); margin-bottom:30px;">Latest patch notes and framework upgrades for GMX Mods.</p>
        <div style="display:flex; flex-direction:column; gap:20px;">
            <div class="gmx-card">
                <span class="tag tag-perf" style="margin-bottom:10px; display:inline-block;">Patch v1.4</span>
                <h3>GMX Core Engine & Crystal Optimization Update</h3>
                <p style="color:var(--text-muted); margin-top:10px;">We have updated all four core mods for Fabric 1.20+ with enhanced frame stability and direct file downloading features.</p>
            </div>
        </div>
    `;
}

function renderAbout(container) {
    container.innerHTML = `
        <h2>ABOUT <span class="highlight">GMX MODS</span></h2>
        <p style="color:var(--text-muted); margin-top:15px; line-height:1.6;">
            GMX Mods is an elite, high-performance platform engineered specifically for competitive Minecraft players. Every mod is fully tested for maximum frame stability and low-end PC support.
        </p>
    `;
}

function renderProfile(container) {
    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">⚡</div>
            <div>
                <h2 style="font-size:28px;">${db.currentUser.username}</h2>
                <p style="color:var(--text-muted);">Elite GMX Ecosystem Member</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div style="color:var(--text-muted); font-size:14px;">Coin Balance</div>
                <div class="stat-value">🪙 ${db.currentUser.coins.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <div style="color:var(--text-muted); font-size:14px;">Owned Mods</div>
                <div class="stat-value">${db.currentUser.library.length}</div>
            </div>
            <div class="stat-card">
                <div style="color:var(--text-muted); font-size:14px;">Gifts Received</div>
                <div class="stat-value">${db.currentUser.receivedGifts.length}</div>
            </div>
            <div class="stat-card">
                <div style="color:var(--text-muted); font-size:14px;">Gifts Sent</div>
                <div class="stat-value">${db.currentUser.sentGifts.length}</div>
            </div>
        </div>

        <h3 style="margin-bottom:15px;">Your Mod Library</h3>
        <div class="store-grid" style="margin-bottom:40px;">
            ${db.currentUser.library.length === 0 ? '<p style="color:#666;">No mods in library yet. Visit the store to unlock.</p>' :
                db.currentUser.library.map(mod => `
                    <div class="mod-card">
                        <div class="mod-header">
                            <div class="mod-icon">${mod.icon}</div>
                            <div class="mod-title-area">
                                <h3>${mod.name}</h3>
                                <span class="tag ${mod.tagClass}">${mod.tag}</span>
                            </div>
                        </div>
                        <div class="mod-body">
                            <p>${mod.shortDesc}</p>
                        </div>
                        <div class="mod-footer">
                            <span style="font-size:12px; color:var(--text-muted);">${mod.fileName}</span>
                            <button class="gmx-btn gold" style="width:auto; padding:8px 16px;" onclick="downloadMod('${mod.id}')">Download .jar 📥</button>
                        </div>
                    </div>
                `).join('')}
        </div>
    `;
}