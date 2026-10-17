/* ---------- ALPHABET MAP ---------- */
const letterToCode = {
  A: ":",     B: "::",    C: ":::",   D: "::::",   E: ":::::",
  F: ":,",    G: "::,",   H: ":::,",  I: "::::,",  J: "::::,'",
  K: "::,?",  L: ":,?'",  M: "::,?'",
  N: ",,,",   O: ",,,,",  P: ",,,,?", Q: ",,,,?'", R: ",,,?'",
  S: ",,?''", T: ",",     U: ",,",    V: ",,?'",   W: ",:,",
  X: ",::,",  Y: ",,:,",  Z: ",,,,:"
};

const codeToLetter = {};
for (const [letter, code] of Object.entries(letterToCode)) {
  codeToLetter[code] = letter;
}

const ADMIN_PASSCODE = "444";

let currentUser = null;
let isAdmin = false;
let translationCount = 0;

/* ---------- STORAGE ---------- */
function getInviteCodes() {
  const raw = localStorage.getItem("colonCodeInvites");
  return raw ? JSON.parse(raw) : [];
}
function saveInviteCodes(list) {
  localStorage.setItem("colonCodeInvites", JSON.stringify(list));
}
function getUsers() {
  const raw = localStorage.getItem("colonCodeUsers");
  return raw ? JSON.parse(raw) : [];
}
function saveUsers(list) {
  localStorage.setItem("colonCodeUsers", JSON.stringify(list));
}
function getSession() {
  const raw = localStorage.getItem("colonCodeSession");
  return raw ? JSON.parse(raw) : null;
}
function saveSession(s) {
  localStorage.setItem("colonCodeSession", JSON.stringify(s));
}
function clearSession() {
  localStorage.removeItem("colonCodeSession");
}

/* ---------- GENERATORS ---------- */
function generateId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "USER-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) id += "-";
  }
  return id;
}

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

/* ---------- GATE / LOGIN ---------- */
function showUserLogin() {
  document.getElementById("gate").style.display = "flex";
  document.getElementById("adminGate").style.display = "none";
  document.getElementById("mainSite").style.display = "none";
}

function showAdminLogin() {
  document.getElementById("gate").style.display = "none";
  document.getElementById("adminGate").style.display = "flex";
  document.getElementById("mainSite").style.display = "none";
}

function submitGate() {
  const codeEl = document.getElementById("gateCode");
  const nameEl = document.getElementById("gateName");
  const err = document.getElementById("gateError");

  const code = codeEl.value.trim().toUpperCase();
  const name = nameEl.value.trim();
  err.textContent = "";

  if (!code) { err.textContent = "⚠ Please enter your invite code."; codeEl.focus(); return; }
  if (!name) { err.textContent = "⚠ Please enter your username."; nameEl.focus(); return; }
  if (name.length < 2) { err.textContent = "⚠ Username must be at least 2 characters."; return; }

  const invites = getInviteCodes();
  const invite = invites.find(i => i.code === code);

  if (!invite) {
    err.textContent = "❌ Invalid code. Ask admin for a valid invite code.";
    return;
  }

  const users = getUsers();

  /* CASE 1: Fresh code → register new user */
  if (!invite.used) {
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      err.textContent = "⚠ Username already taken. Choose another.";
      return;
    }

    invite.used = true;
    invite.ownerName = name;
    invite.firstUsedAt = new Date().toISOString();
    invite.useCount = 1;
    invite.lastUsedAt = invite.firstUsedAt;
    saveInviteCodes(invites);

    const user = {
      id: generateId(),
      name: name,
      inviteCode: code,
      registeredAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);

    saveSession({ userId: user.id, isAdmin: false });
    enterSite(user, false);
    return;
  }

  /* CASE 2: Used code → only original owner can log back in */
  if (invite.used && invite.ownerName) {
    if (name.toLowerCase() !== invite.ownerName.toLowerCase()) {
      err.textContent = "❌ This code belongs to another user. Enter the correct username.";
      return;
    }

    const user = users.find(u => u.inviteCode === code);
    if (!user) {
      err.textContent = "❌ Something went wrong. Ask admin to reset your code.";
      return;
    }

    invite.useCount = (invite.useCount || 1) + 1;
    invite.lastUsedAt = new Date().toISOString();
    saveInviteCodes(invites);

    saveSession({ userId: user.id, isAdmin: false });
    enterSite(user, false);
    return;
  }

  err.textContent = "❌ Unknown error. Ask admin for help.";
}

function submitAdminGate() {
  const passEl = document.getElementById("gateAdminPass");
  const err = document.getElementById("gateAdminError");
  err.textContent = "";

  if (passEl.value === ADMIN_PASSCODE) {
    saveSession({ userId: "ADMIN", isAdmin: true, name: "Admin" });
    enterSite({ id: "ADMIN", name: "Admin" }, true);
  } else {
    err.textContent = "❌ Incorrect passcode.";
    passEl.value = "";
    passEl.focus();
  }
}

function enterSite(user, admin) {
  currentUser = user;
  isAdmin = admin;

  document.getElementById("gate").style.display = "none";
  document.getElementById("adminGate").style.display = "none";
  document.getElementById("mainSite").style.display = "block";

  document.getElementById("userName").textContent = user.name || "Guest";
  document.getElementById("userId").textContent = "ID: " + (user.id || "—");
  document.getElementById("userAvatar").textContent =
    (user.name || "G").charAt(0).toUpperCase();

  if (admin) {
    document.getElementById("adminSection").style.display = "block";
    renderAdminPanel();
  } else {
    document.getElementById("adminSection").style.display = "none";
  }

  buildLegend();
}

function logout() {
  clearSession();
  currentUser = null;
  isAdmin = false;
  translationCount = 0;

  document.getElementById("mainSite").style.display = "none";
  document.getElementById("gateCode").value = "";
  document.getElementById("gateName").value = "";
  document.getElementById("gateError").textContent = "";
  document.getElementById("gateAdminPass").value = "";
  document.getElementById("gateAdminError").textContent = "";

  showUserLogin();
}

/* ---------- TRANSLATION ---------- */
function lettersToCode() {
  const input = document.getElementById('letterInput').value.toUpperCase();
  const output = document.getElementById('letterOutput');

  if (!input.trim()) {
    output.textContent = "Please enter some letters first.";
    output.classList.add('error');
    return;
  }
  output.classList.remove('error');

  const words = input.split(/\s+/).filter(w => w.length > 0);
  const unknown = [];
  const codedWords = [];

  words.forEach(word => {
    const letterCodes = [];
    for (const char of word) {
      if (letterToCode[char]) letterCodes.push(letterToCode[char]);
      else unknown.push(char);
    }
    if (letterCodes.length > 0) codedWords.push(letterCodes.join(" "));
  });

  let result = codedWords.join("  ");
  output.textContent = result || "No valid letters found.";

  if (unknown.length > 0) {
    output.textContent += "\n\n⚠ Unknown characters skipped: " + unknown.join(" ");
    output.classList.add('error');
  }

  translationCount++;
  updateStats();
}

function codeToLetters() {
  const raw = document.getElementById('codeInput').value;
  const output = document.getElementById('codeOutput');

  if (!raw.trim()) {
    output.textContent = "Please enter some code first.";
    output.classList.add('error');
    return;
  }
  output.classList.remove('error');

  const rawWords = raw.trim().split(/ {2,}|\n+/);
  const unknown = [];
  const decodedWords = [];

  rawWords.forEach(rawWord => {
    const tokens = rawWord.trim().split(/\s+/).filter(t => t.length > 0);
    let decodedWord = "";
    tokens.forEach(token => {
      if (codeToLetter[token]) decodedWord += codeToLetter[token];
      else { decodedWord += "?"; unknown.push(token); }
    });
    if (decodedWord) decodedWords.push(decodedWord);
  });

  let result = decodedWords.join(" ");
  output.textContent = result || "No valid codes found.";

  if (unknown.length > 0) {
    output.textContent += "\n\n⚠ Unknown codes: " + unknown.join("  |  ");
    output.classList.add('error');
  }

  translationCount++;
  updateStats();
}

function updateStats() {
  if (isAdmin) renderAdminPanel();
}

/* ---------- COPY / TOAST / CLEAR ---------- */
function copyOutput(id, event) {
  const el = document.getElementById(id);
  const text = el.textContent;
  if (!text || text.includes("will appear here")) {
    showToast("Nothing to copy yet!");
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast("✓ Copied to clipboard!");
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast("✓ Copied to clipboard!");
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function clearField(inputId, outputId) {
  document.getElementById(inputId).value = "";
  const out = document.getElementById(outputId);
  out.textContent = "Your " + (inputId.includes("code") ? "decoded text" : "code") + " will appear here…";
  out.classList.remove('error');
}

/* ---------- LEGEND ---------- */
let legendBuilt = false;
function toggleLegend() {
  const grid = document.getElementById('legendGrid');
  const btn = document.getElementById('legendToggle');
  grid.classList.toggle('hidden');
  btn.textContent = grid.classList.contains('hidden') ? "Show" : "Hide";
}

function buildLegend() {
  if (legendBuilt) return;
  const grid = document.getElementById('legendGrid');
  grid.innerHTML = "";
  for (const [letter, code] of Object.entries(letterToCode)) {
    const div = document.createElement('div');
    div.innerHTML = `<span>${letter}</span><span>${code}</span>`;
    grid.appendChild(div);
  }
  legendBuilt = true;
}

/* ---------- ADMIN PANEL ---------- */
function generateInvite() {
  const note = document.getElementById("codeLabel").value.trim();
  const code = generateInviteCode();

  const invites = getInviteCodes();
  invites.push({
    code: code,
    note: note,
    used: false,
    ownerName: null,
    useCount: 0,
    createdAt: new Date().toISOString()
  });
  saveInviteCodes(invites);

  document.getElementById("codeLabel").value = "";
  renderAdminPanel();
  showToast("✓ Invite code created: " + code);
}

function deleteInvite(code) {
  if (!confirm("Delete this code? The owner will lose access.")) return;
  let invites = getInviteCodes();
  invites = invites.filter(i => i.code !== code);
  saveInviteCodes(invites);
  renderAdminPanel();
  showToast("✓ Invite deleted");
}

function copyInvite(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast("✓ Code copied: " + code);
  });
}

function deleteUser(userId) {
  if (!confirm("Delete this user? Their code will be released.")) return;
  let users = getUsers();
  const user = users.find(u => u.id === userId);
  users = users.filter(u => u.id !== userId);
  saveUsers(users);

  if (user && user.inviteCode) {
    let invites = getInviteCodes();
    const inv = invites.find(i => i.code === user.inviteCode);
    if (inv) {
      inv.used = false;
      inv.ownerName = null;
      inv.useCount = 0;
      saveInviteCodes(invites);
    }
  }

  renderAdminPanel();
  showToast("✓ User deleted");
}

function renderAdminPanel() {
  if (!isAdmin) return;

  const invites = getInviteCodes();
  const users = getUsers();

  document.getElementById("statUsers").textContent = users.length;
  document.getElementById("statUnused").textContent = invites.filter(i => !i.used).length;
  document.getElementById("statUsed").textContent = invites.filter(i => i.used).length;
  document.getElementById("statAdminId").textContent = "ADMIN";

  const inviteList = document.getElementById("inviteList");
  inviteList.innerHTML = "";
  if (invites.length === 0) {
    inviteList.innerHTML = `<p style="color:var(--muted);font-size:0.82rem;text-align:center;padding:10px;">No codes yet. Generate one above.</p>`;
  } else {
    [...invites].reverse().forEach(inv => {
      const row = document.createElement("div");
      row.className = "invite-item";

      let statusHTML = "";
      if (!inv.used) {
        statusHTML = `<span class="invite-status unused">● Available</span>`;
      } else {
        statusHTML = `<span class="invite-status used">✓ ${escapeHtml(inv.ownerName || "used")} · ${inv.useCount || 1}× logins</span>`;
      }

      row.innerHTML = `
        <div>
          <div class="invite-code">${inv.code}</div>
          ${inv.note ? `<div class="invite-note">${escapeHtml(inv.note)}</div>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          ${statusHTML}
          <button class="copy-btn" data-copy="${inv.code}">📋</button>
          <button class="copy-btn" data-del="${inv.code}">🗑</button>
        </div>
      `;
      inviteList.appendChild(row);
    });

    inviteList.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", (e) => copyInvite(e.target.dataset.copy));
    });
    inviteList.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", (e) => deleteInvite(e.target.dataset.del));
    });
  }

  const userList = document.getElementById("userList");
  userList.innerHTML = "";
  if (users.length === 0) {
    userList.innerHTML = `<p style="color:var(--muted);font-size:0.82rem;text-align:center;padding:10px;">No users yet.</p>`;
  } else {
    [...users].reverse().forEach(u => {
      const inv = invites.find(i => i.code === u.inviteCode);
      const logins = inv ? (inv.useCount || 1) : 1;
      const lastLogin = inv && inv.lastUsedAt ? formatDate(inv.lastUsedAt) : "—";

      const row = document.createElement("div");
      row.className = "user-row";
      row.innerHTML = `
        <div class="user-row-avatar">${escapeHtml((u.name || "?").charAt(0).toUpperCase())}</div>
        <div class="user-row-info">
          <span class="user-row-name">${escapeHtml(u.name)}</span>
          <span class="user-row-meta">${u.id} · code: ${u.inviteCode || "—"} · ${logins} login${logins !== 1 ? "s" : ""}</span>
          <span class="user-row-meta">last login: ${lastLogin}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          <span class="user-row-date">joined ${formatDate(u.registeredAt)}</span>
          <button class="copy-btn" data-deluser="${u.id}">🗑</button>
        </div>
      `;
      userList.appendChild(row);
    });

    userList.querySelectorAll("[data-deluser]").forEach(btn => {
      btn.addEventListener("click", (e) => deleteUser(e.target.dataset.deluser));
    });
  }
}

/* ---------- HELPERS ---------- */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ---------- INIT ---------- */
window.addEventListener("DOMContentLoaded", () => {
  buildLegend();

  // Allow typing on inputs even if gates overlap
  const gateCode = document.getElementById("gateCode");
  const gateName = document.getElementById("gateName");
  const gateAdminPass = document.getElementById("gateAdminPass");

  if (gateCode) gateCode.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && gateName) gateName.focus();
  });
  if (gateName) gateName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGate();
  });
  if (gateAdminPass) gateAdminPass.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitAdminGate();
  });

  const session = getSession();
  if (session) {
    if (session.isAdmin) {
      currentUser = { id: "ADMIN", name: "Admin" };
      isAdmin = true;
      enterSite(currentUser, true);
    } else {
      const users = getUsers();
      const user = users.find(u => u.id === session.userId);
      if (user) {
        currentUser = user;
        isAdmin = false;
        enterSite(user, false);
      } else {
        clearSession();
        showUserLogin();
      }
    }
  } else {
    showUserLogin();
  }
});