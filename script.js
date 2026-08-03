// GMX Ecosystem JavaScript Core & Functionality

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application states
    initAuthTabs();
    initModStore();
    initDailyWheel();
    initNavigation();
});

// Authentication System
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetFormId = tab.getAttribute('data-target');
            
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            const targetForm = document.getElementById(targetFormId);
            if (targetForm) targetForm.classList.add('active');
        });
    });
}

// Custom Modal Notification System
function showGmxModal(title, message, type = 'info') {
    let overlay = document.getElementById('gmxModalOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gmxModalOverlay';
        overlay.innerHTML = `
            <div class="gmx-modal-card">
                <div class="gmx-modal-icon" id="gmxModalIcon"></div>
                <h3 id="gmxModalTitle"></h3>
                <p id="gmxModalMessage"></p>
                <button class="btn-primary" onclick="closeGmxModal()" style="width: 100%; justify-content: center;">OK</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    const iconEl = document.getElementById('gmxModalIcon');
    const titleEl = document.getElementById('gmxModalTitle');
    const messageEl = document.getElementById('gmxModalMessage');

    titleEl.textContent = title;
    messageEl.textContent = message;
    
    iconEl.className = `gmx-modal-icon ${type}`;
    if (type === 'success') iconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    else if (type === 'error') iconEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
    else iconEl.innerHTML = '<i class="fa-solid fa-circle-info"></i>';

    overlay.style.display = 'flex';
}

function closeGmxModal() {
    const overlay = document.getElementById('gmxModalOverlay');
    if (overlay) overlay.style.display = 'none';
}

// Simulated Mod Store & Dynamic Mod Upload Interactions
function initModStore() {
    // Bind purchase actions to existing buy buttons
    bindBuyButtons();

    // Handle dynamic mod uploads and appending them to the store grid
    const uploadForm = document.getElementById('uploadModForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const titleInput = document.getElementById('modTitleInput');
            const descInput = document.getElementById('modDescInput');
            const priceInput = document.getElementById('modPriceInput');
            const versionInput = document.getElementById('modVersionInput');
            const categoryInput = document.getElementById('modCategoryInput');

            if (!titleInput || !descInput || !priceInput) return;

            const modTitle = titleInput.value.trim();
            const modDesc = descInput.value.trim();
            const modPrice = priceInput.value.trim();
            const modVersion = versionInput ? versionInput.value.trim() : 'v1.0';
            const modCategory = categoryInput ? categoryInput.value.trim() : 'Utility';

            addNewModCard({
                title: modTitle,
                description: modDesc,
                price: modPrice,
                version: modVersion,
                category: modCategory
            });

            uploadForm.reset();
            showGmxModal('Mod Uploaded', `Successfully uploaded "${modTitle}" to the GMX ecosystem store grid!`, 'success');
        });
    }
}

function bindBuyButtons() {
    const buyButtons = document.querySelectorAll('.btn-buy');
    
    buyButtons.forEach(btn => {
        // Prevent duplicate event bindings
        if (btn.getAttribute('data-bound') === 'true') return;
        btn.setAttribute('data-bound', 'true');

        btn.addEventListener('click', (e) => {
            const modCard = e.target.closest('.mod-card');
            const modName = modCard ? modCard.querySelector('h3').textContent : 'Item';
            showGmxModal('Purchase Confirmed', `You have successfully unlocked access to ${modName} within the GMX ecosystem.`, 'success');
        });
    });
}

function addNewModCard(modData) {
    const modsGrid = document.querySelector('.mods-grid');
    if (!modsGrid) return;

    const card = document.createElement('div');
    card.className = 'mod-card';
    card.innerHTML = `
        <div class="mod-img-wrap">
            <i class="fa-solid fa-cube"></i>
            <span class="mod-version-tag">${escapeHtml(modData.version)}</span>
        </div>
        <div class="mod-card-body">
            <div class="mod-tags">
                <span class="mod-tag tag-pvp">${escapeHtml(modData.category)}</span>
            </div>
            <h3>${escapeHtml(modData.title)}</h3>
            <p>${escapeHtml(modData.description)}</p>
            <div class="mod-card-footer">
                <span class="mod-price text-gold">${escapeHtml(modData.price)}</span>
                <button class="btn-buy"><i class="fa-solid fa-cart-shopping"></i> Buy</button>
            </div>
        </div>
    `;

    modsGrid.prepend(card);
    bindBuyButtons(); // Re-bind buttons to include the newly injected card
}

// Daily Spin Wheel Logic
let isSpinning = false;
function initDailyWheel() {
    const spinBtn = document.getElementById('spinWheelBtn');
    if (!spinBtn) return;

    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;

        const wheel = document.querySelector('.wheel');
        const randomDegree = Math.floor(Math.random() * 3600) + 720; // Multiple full rotations + random offset
        
        if (wheel) {
            wheel.style.transform = `rotate(${randomDegree}deg)`;
        }

        setTimeout(() => {
            isSpinning = false;
            showGmxModal('Reward Claimed!', 'Your daily spin reward has been credited to your GMX balance.', 'success');
        }, 4000); // Matches CSS transition duration
    });
}

// Navigation View Switcher
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageViews = document.querySelectorAll('.page-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetViewId = item.getAttribute('data-view');
            if (!targetViewId) return;

            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            pageViews.forEach(view => view.classList.remove('active'));

            item.classList.add('active');
            const targetView = document.getElementById(targetViewId);
            if (targetView) targetView.classList.add('active');
        });
    });
}

// Utility Security Helper
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}