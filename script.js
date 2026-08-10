document.addEventListener('DOMContentLoaded', () => {
    const defaultState = {
        currentUser: 'Operator',
        users: []
    };

    let state = JSON.parse(localStorage.getItem('gmx_state')) || defaultState;
    state.currentUser = 'Operator';

    function saveState() {
        localStorage.setItem('gmx_state', JSON.stringify(state));
    }

    function showGmxAlert(title, message, type = 'success', callback = null) {
        const overlay = document.getElementById('gmxModalOverlay');
        const iconDiv = document.getElementById('gmxModalIcon');
        const titleEl = document.getElementById('gmxModalTitle');
        const msgEl = document.getElementById('gmxModalMessage');
        const btnEl = document.getElementById('gmxModalBtn');

        if (!overlay) {
            alert(`${title}: ${message}`);
            if (callback) callback();
            return;
        }

        titleEl.textContent = title;
        msgEl.textContent = message;

        iconDiv.className = 'gmx-modal-icon';
        if (type === 'success') {
            iconDiv.classList.add('success');
            iconDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        } else if (type === 'error') {
            iconDiv.classList.add('error');
            iconDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
        } else {
            iconDiv.classList.add('info');
            iconDiv.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
        }

        overlay.style.display = 'flex';

        const newBtn = btnEl.cloneNode(true);
        btnEl.parentNode.replaceChild(newBtn, btnEl);

        newBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            if (callback) callback();
        });
    }

    const navItems = document.querySelectorAll('.nav-item');
    const pageViews = document.querySelectorAll('.page-view');
    const pageTitleHeading = document.getElementById('pageTitleHeading');
    
    const headerUsernameDisplay = document.getElementById('headerUsernameDisplay');
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    const dashUsername = document.getElementById('dashUsername');
    
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');

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

    function updateUIState() {
        const user = state.currentUser || 'Operator';
        headerUsernameDisplay.textContent = user;
        dashUsername.textContent = user;
        profileUsername.textContent = user;
        profileEmail.textContent = `${user.toLowerCase()}@gmx.empire`;
        headerUserAvatar.textContent = user.substring(0, 2).toUpperCase();
    }

    window.downloadModFile = function(fileName) {
        let fileContent = "META-INF/MANIFEST.MF Zt|a#~H |vd{e LICENSE_4ddb76de}T EAwVn qU'M ZdOSN d;ln- dj=/ 9xK9";
        if (fileName === 'GmxSmartTotemClient.jar') {
            fileContent = "META-INF/MANIFEST.MF qR|^# LICENSE_5fb0ab24}T .__l]! D`%w k2To /bf~ q!VR 6!a\\u META-INF/ com/ com/orcaengine/ com/orcaengine/gmxsmarttotem/ com/orcaengine/gmxsmarttotem/GmxSmartTotemClient.class fabric.mod.json";
        }

        const blob = new Blob([fileContent], { type: 'application/java-archive' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showGmxAlert('Download Started', `Downloading official mod file ${fileName}.`, 'success');
    };

    updateUIState();
});