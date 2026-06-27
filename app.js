/* ==========================================
   PORTFOLIO OS — APP.JS
   ========================================== */

const state = {
  windows: {}, zIndex: 200, activeWindow: null, dark: false,
  termHistory: [], histIdx: -1, aiOpen: false, aiTyping: false
};

const APP_CONFIG = {
  about:    { title: '👤 About Me',   icon: '👤', w: 520, h: 440 },
  projects: { title: '🚀 Projects',   icon: '🚀', w: 600, h: 500 },
  skills:   { title: '⚙️ Skills',     icon: '⚙️', w: 540, h: 480 },
  resume:   { title: '📄 Resume',     icon: '📄', w: 520, h: 500 },
  terminal: { title: '💻 Terminal',   icon: '💻', w: 560, h: 400, mono: true },
  contact:  { title: '📬 Contact',    icon: '📬', w: 520, h: 540 },
  github:   { title: '🐙 GitHub',     icon: '🐙', w: 580, h: 520 }
};

// ===== TYPEWRITER =====
const TW_STRINGS = [
  'AI Engineer',
  'Full Stack Developer',
  'Research Intern @ NIT Trichy',
  'PyTorch | FastAPI | Next.js',
  'Building Intelligent Systems'
];
let twIdx = 0, twChar = 0, twDeleting = false;
function typewriterTick() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  const str = TW_STRINGS[twIdx];
  if (!twDeleting) {
    el.textContent = str.slice(0, ++twChar);
    if (twChar === str.length) { setTimeout(() => { twDeleting = true; setTimeout(typewriterTick, 40); }, 1800); return; }
  } else {
    el.textContent = str.slice(0, --twChar);
    if (twChar === 0) { twDeleting = false; twIdx = (twIdx + 1) % TW_STRINGS.length; }
  }
  setTimeout(typewriterTick, twDeleting ? 40 : 70);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  showBootScreen();
  updateClock();
  setInterval(updateClock, 1000);
  setupDesktopClick();
  setTimeout(typewriterTick, 2500);
});

// ===== BOOT SCREEN =====
function showBootScreen() {
  const boot = document.createElement('div');
  boot.id = 'boot-screen';
  boot.innerHTML = `
    <h1>⚡ Adharsh V S</h1>
    <p>AI Engineer &amp; Full Stack Developer</p>
    <div class="boot-bar"><div class="boot-bar-inner"></div></div>
    <p id="boot-msg" style="font-size:11px;color:#666;">Initializing portfolio OS...</p>
  `;
  document.body.appendChild(boot);
  const msgs = ['Loading AI modules...', 'Fetching projects...', 'Connecting to GitHub...', 'Starting UI...'];
  let i = 0;
  const iv = setInterval(() => { if (i < msgs.length) document.getElementById('boot-msg').textContent = msgs[i++]; }, 450);
  setTimeout(() => {
    clearInterval(iv);
    boot.style.opacity = '0';
    setTimeout(() => { boot.remove(); openApp('about'); }, 500);
  }, 2200);
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const el = document.getElementById('clock');
  if (el) el.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

// ===== THEME =====
function toggleTheme() {
  state.dark = !state.dark;
  document.documentElement.classList.toggle('dark', state.dark);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = state.dark ? '☀️' : '🌙';
}

// ===== OPEN APP =====
function openApp(id) {
  if (state.windows[id]) {
    const win = state.windows[id];
    if (win.classList.contains('minimized')) win.classList.remove('minimized');
    focusWindow(id); return;
  }
  createWindow(id);
}

// ===== CREATE WINDOW =====
function createWindow(id) {
  const cfg = APP_CONFIG[id];
  if (!cfg) return;
  const tpl = document.getElementById(`tpl-${id}`);
  if (!tpl) return;
  const content = tpl.content.cloneNode(true);
  const container = document.getElementById('windows-container');
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(cfg.w, vw - 60), h = Math.min(cfg.h, vh - 80);
  const offset = Object.keys(state.windows).length * 24;
  const left = Math.min(100 + offset, vw - w - 20);
  const top = Math.min(60 + offset, vh - h - 60);

  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.id = id;
  win.style.cssText = `width:${w}px;height:${h}px;left:${left}px;top:${top}px;`;
  win.innerHTML = `
    <div class="window-titlebar" data-id="${id}">
      <span class="window-title">${cfg.icon} ${cfg.title}</span>
      <div class="window-controls">
        <button class="wc-btn minimize" onclick="minimizeWindow('${id}')" title="Minimize">─</button>
        <button class="wc-btn maximize" onclick="maximizeWindow('${id}')" title="Maximize">□</button>
        <button class="wc-btn close" onclick="closeWindow('${id}')" title="Close">✕</button>
      </div>
    </div>
    <div class="window-body" id="body-${id}"></div>
  `;
  container.appendChild(win);
  document.getElementById(`body-${id}`).appendChild(content);
  state.windows[id] = win;
  focusWindow(id);
  makeDraggable(win);
  addTaskbarEntry(id, cfg);
  if (id === 'terminal') initTerminal();

  win.style.transform = 'scale(0.85)'; win.style.opacity = '0';
  win.style.transition = 'transform 0.18s ease-out, opacity 0.18s ease-out';
  requestAnimationFrame(() => { win.style.transform = 'scale(1)'; win.style.opacity = '1'; });
}

function focusWindow(id) {
  Object.entries(state.windows).forEach(([wid, w]) => {
    w.classList.remove('focused');
    const btn = document.querySelector(`.taskbar-app-btn[data-id="${wid}"]`);
    if (btn) btn.classList.remove('active');
  });
  const win = state.windows[id]; if (!win) return;
  state.zIndex++; win.style.zIndex = state.zIndex;
  win.classList.add('focused'); state.activeWindow = id;
  const btn = document.querySelector(`.taskbar-app-btn[data-id="${id}"]`);
  if (btn) btn.classList.add('active');
}

function minimizeWindow(id) {
  const win = state.windows[id]; if (!win) return;
  win.classList.add('minimized');
  const btn = document.querySelector(`.taskbar-app-btn[data-id="${id}"]`);
  if (btn) btn.classList.remove('active');
}

function maximizeWindow(id) {
  const win = state.windows[id]; if (!win) return;
  if (win.dataset.maximized === 'true') {
    win.style.left = win.dataset.prevLeft; win.style.top = win.dataset.prevTop;
    win.style.width = win.dataset.prevW; win.style.height = win.dataset.prevH;
    win.dataset.maximized = 'false';
  } else {
    win.dataset.prevLeft = win.style.left; win.dataset.prevTop = win.style.top;
    win.dataset.prevW = win.style.width; win.dataset.prevH = win.style.height;
    win.style.left = '0px'; win.style.top = '46px';
    win.style.width = window.innerWidth + 'px'; win.style.height = (window.innerHeight - 46) + 'px';
    win.dataset.maximized = 'true';
  }
}

function closeWindow(id) {
  const win = state.windows[id]; if (!win) return;
  win.style.transform = 'scale(0.85)'; win.style.opacity = '0'; win.style.transition = 'all 0.15s';
  setTimeout(() => { win.remove(); delete state.windows[id]; removeTaskbarEntry(id); if (state.activeWindow === id) state.activeWindow = null; }, 150);
}

function makeDraggable(win) {
  const titlebar = win.querySelector('.window-titlebar');
  let dragging = false, startX, startY, startLeft, startTop;
  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('wc-btn')) return;
    if (win.dataset.maximized === 'true') return;
    dragging = true; startX = e.clientX; startY = e.clientY;
    startLeft = parseInt(win.style.left) || 0; startTop = parseInt(win.style.top) || 0;
    focusWindow(win.dataset.id); document.body.style.cursor = 'move'; e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    win.style.left = Math.max(0, Math.min(startLeft + e.clientX - startX, window.innerWidth - 100)) + 'px';
    win.style.top = Math.max(46, Math.min(startTop + e.clientY - startY, window.innerHeight - 50)) + 'px';
  });
  document.addEventListener('mouseup', () => { if (dragging) { dragging = false; document.body.style.cursor = ''; } });
  win.addEventListener('mousedown', () => focusWindow(win.dataset.id));
}

function addTaskbarEntry(id, cfg) {
  const bar = document.getElementById('taskbar-apps');
  const btn = document.createElement('button');
  btn.className = 'taskbar-app-btn'; btn.dataset.id = id;
  btn.textContent = cfg.icon + ' ' + cfg.title.replace(/^.\s/, '');
  btn.onclick = () => {
    const win = state.windows[id]; if (!win) return;
    if (win.classList.contains('minimized')) { win.classList.remove('minimized'); focusWindow(id); }
    else if (state.activeWindow === id) minimizeWindow(id);
    else focusWindow(id);
  };
  bar.appendChild(btn);
}
function removeTaskbarEntry(id) { const btn = document.querySelector(`.taskbar-app-btn[data-id="${id}"]`); if (btn) btn.remove(); }

function setupDesktopClick() {
  document.getElementById('desktop').addEventListener('click', (e) => {
    if (e.target.id === 'desktop') document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  });
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });
  });
}

function openLink(url) { window.open(url, '_blank'); }

// ===== TERMINAL =====
const TERM_COMMANDS = {
  help: () => `Available commands:\n  whoami     — Who is Adharsh?\n  skills     — Tech stack\n  projects   — Featured projects\n  contact    — Contact info\n  education  — Academic background\n  experience — Work experience\n  clear      — Clear terminal\n  date       — Current date/time\n  ls         — List portfolio sections\n  open <app> — Open an app window`,
  whoami: () => `Adharsh V S\nAI Engineer & Full Stack Developer\nResearch Intern @ NIT Trichy\nSRM Institute of Science and Technology — CGPA: 9.3/10\nLocation: India | Email: vsadharsh0@gmail.com`,
  skills: () => `Languages:  Python, JavaScript, TypeScript, HTML/CSS, C++\nFrameworks: React, Next.js, Tailwind, Node.js, FastAPI, Streamlit\nAI/ML:      PyTorch, TensorFlow, Scikit-Learn, RL, pgvector, FAISS\nDatabases:  PostgreSQL, MongoDB, MySQL, Redis\nTools:      Docker, Git, GitHub, Postman`,
  projects: () => `1. PS-GRNN Digital Immune System — AI Intrusion Detection (PyTorch, Scapy)\n2. Dyslexia Reader AI           — Chrome Extension (JS, Chrome APIs)\n3. RL Traffic Management        — SUMO Simulator (Python, RL)\n4. Water Demand Forecaster      — ML Analytics (FastAPI, Chart.js)\n5. Xeno CRM                    — AI-native CRM (Next.js, PostgreSQL, Redis)`,
  contact: () => `📧  Email:    vsadharsh0@gmail.com\n💼  LinkedIn: linkedin.com/in/adharsh-v-s-8a691725b\n🐙  GitHub:   github.com/adharsh2006`,
  education: () => `B.Tech — SRM Institute of Science and Technology\nComputer Science with AI Specialization\nCGPA: 9.3/10  |  2022 – 2026`,
  experience: () => `Research Intern — NIT Trichy (2024)\n• AI-based network security systems\n• Grammar inference for protocol verification\n• Deep learning model development`,
  date: () => new Date().toString(),
  ls: () => `about/    projects/    skills/    resume/\nterminal/ contact/     github/`,
  open: (args) => {
    const app = args[0];
    if (APP_CONFIG[app]) { setTimeout(() => openApp(app), 200); return `Opening ${app}...`; }
    return `open: '${app}' not found. Available: ${Object.keys(APP_CONFIG).join(', ')}`;
  },
  clear: () => '__clear__'
};

function initTerminal() {
  const output = document.getElementById('terminal-output');
  const input = document.getElementById('terminal-input');
  if (!output || !input) return;
  addTermLine(output, 'info', '╔══════════════════════════════════════╗');
  addTermLine(output, 'info', '║  Welcome to Adharsh VS Portfolio OS  ║');
  addTermLine(output, 'info', '║  Type "help" to see all commands      ║');
  addTermLine(output, 'info', '╚══════════════════════════════════════╝');
  addTermLine(output, 'output', '');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim(); if (!cmd) return;
      state.termHistory.unshift(cmd); state.histIdx = -1;
      addTermLine(output, 'prompt', `adharsh@portfolio:~$ ${cmd}`);
      processCommand(cmd, output); input.value = '';
      output.scrollTop = output.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      if (state.histIdx < state.termHistory.length - 1) input.value = state.termHistory[++state.histIdx];
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      state.histIdx > 0 ? (input.value = state.termHistory[--state.histIdx]) : (state.histIdx = -1, input.value = '');
      e.preventDefault();
    }
  });
  input.focus();
}

function processCommand(cmdStr, output) {
  const parts = cmdStr.trim().split(/\s+/), cmd = parts[0].toLowerCase(), args = parts.slice(1);
  if (TERM_COMMANDS[cmd]) {
    const result = TERM_COMMANDS[cmd](args);
    if (result === '__clear__') output.innerHTML = '';
    else if (result) result.split('\n').forEach(line => addTermLine(output, 'output', line));
  } else if (cmd) {
    addTermLine(output, 'error', `bash: ${cmd}: command not found. Type "help".`);
  }
  addTermLine(output, 'output', '');
}

function addTermLine(output, cls, text) {
  const line = document.createElement('div');
  line.className = `t-line ${cls}`; line.textContent = text;
  output.appendChild(line);
}

// ===== CONTACT FORM =====
function handleContactForm(e) {
  e.preventDefault();
  const status = document.getElementById('cf-status');
  const name = document.getElementById('cf-name').value;
  status.textContent = `✅ Thanks ${name}! I will get back to you soon.`;
  e.target.reset();
  setTimeout(() => { status.textContent = ''; }, 4000);
}

// ===== AI CHAT =====
function toggleAIChat() {
  state.aiOpen = !state.aiOpen;
  const drawer = document.getElementById('ai-chat-drawer');
  drawer.classList.toggle('ai-drawer-open', state.aiOpen);
  drawer.classList.toggle('ai-drawer-closed', !state.aiOpen);
  if (state.aiOpen) setTimeout(() => document.getElementById('ai-input').focus(), 300);
}

function askSuggestion(msg) {
  const input = document.getElementById('ai-input');
  input.value = msg;
  sendAIMessage();
}

async function sendAIMessage() {
  if (state.aiTyping) return;
  const input = document.getElementById('ai-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const messagesEl = document.getElementById('ai-messages');
  appendAIMessage(messagesEl, 'user', msg);
  const typingEl = showTypingIndicator(messagesEl);

  state.aiTyping = true;
  document.querySelector('.ai-send-btn').disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    typingEl.remove();
    if (data.reply) appendAIMessage(messagesEl, 'bot', data.reply);
    else appendAIMessage(messagesEl, 'bot', 'Hmm, I ran into an issue. Try again!');
  } catch (err) {
    typingEl.remove();
    appendAIMessage(messagesEl, 'bot', 'I could not connect to the AI service. Make sure ANTHROPIC_API_KEY is set in Vercel.');
  }

  state.aiTyping = false;
  document.querySelector('.ai-send-btn').disabled = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendAIMessage(container, role, text) {
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.innerHTML = `<div class="ai-bubble">${escapeHTML(text)}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator(container) {
  const div = document.createElement('div');
  div.className = 'ai-msg bot';
  div.innerHTML = `<div class="ai-bubble ai-typing"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');
}
