// ARQITEKT Mobile — PWA Client
'use strict';

// ===== State =====
let hubUrl = '';
let connected = false;
let projects = [];
let currentPd = null;
let chatHistory = [];
let voiceActive = false;
let recognition = null;

// ===== Init =====
function init() {
  loadSettings();
  testConnection();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }
}

// ===== Settings =====
function loadSettings() {
  try {
    var s = JSON.parse(localStorage.getItem('arqitekt_mobile') || '{}');
    hubUrl = s.hubUrl || (location.origin === 'null' ? '' : location.origin);
    document.getElementById('settingHubUrl').value = hubUrl;
    document.getElementById('settingLang').value = s.lang || 'en';
  } catch(e) {
    hubUrl = location.origin;
  }
}

function saveSettings() {
  hubUrl = (document.getElementById('settingHubUrl').value || '').replace(/\/+$/, '');
  var lang = document.getElementById('settingLang').value;
  localStorage.setItem('arqitekt_mobile', JSON.stringify({ hubUrl: hubUrl, lang: lang }));
  testConnection();
}

async function testConnection() {
  var dot = document.getElementById('connectionDot');
  var status = document.getElementById('settingStatus');
  try {
    var r = await fetchHub('/api/projects');
    if (!r.ok) throw new Error(r.status);
    connected = true;
    dot.className = 'conn-dot online';
    if (status) status.textContent = 'Connected';
    projects = await r.json();
    renderProjects();
    showToast('Connected to Hub', 'success');
  } catch(e) {
    connected = false;
    dot.className = 'conn-dot offline';
    if (status) status.textContent = 'Offline';
  }
}

function fetchHub(path, opts) {
  var url = hubUrl + path;
  return fetch(url, opts || {});
}

// ===== Navigation =====
function switchView(name) {
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  var el = document.getElementById('view-' + name);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.view === name);
  });
  if (name === 'projects' && connected) refreshProjects();
  if (name === 'chat') document.getElementById('chatInput').focus();
}

// ===== Projects =====
async function refreshProjects() {
  try {
    var r = await fetchHub('/api/projects');
    if (r.ok) { projects = await r.json(); renderProjects(); }
  } catch(e) {}
}

function renderProjects() {
  var el = document.getElementById('projectsList');
  if (!projects.length) {
    el.innerHTML = '<div style="color:var(--fg3);text-align:center;padding:40px 0">No projects yet</div>';
    return;
  }
  var h = '';
  for (var p of projects) {
    var lc = p.lifecycle || 'planning';
    h += '<div class="project-card" onclick="openProjectDetail(\'' + esc(p.id) + '\')">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center">';
    h += '<span class="project-name">' + esc(p.name) + '</span>';
    h += '<span class="lifecycle-badge lc-' + lc + '">' + lc + '</span>';
    h += '</div>';
    h += '<div class="project-id">' + esc(p.id) + '</div>';
    if (p.stats) {
      h += '<div class="project-stats">';
      h += '<span>' + (p.stats.solutions || 0) + ' Solutions</span>';
      h += '<span>' + (p.stats['user-stories'] || 0) + ' Stories</span>';
      h += '<span>' + (p.stats.components || 0) + ' Components</span>';
      h += '</div>';
    }
    h += '</div>';
  }
  el.innerHTML = h;
}

async function openProjectDetail(id) {
  currentPd = projects.find(function(p) { return p.id === id; });
  if (!currentPd) return;
  document.getElementById('pdTitle').textContent = currentPd.name || id;
  var badge = document.getElementById('pdLifecycle');
  var lc = currentPd.lifecycle || 'planning';
  badge.textContent = lc;
  badge.className = 'lifecycle-badge lc-' + lc;
  // Show detail view
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  document.getElementById('view-project-detail').classList.add('active');
  switchPdTab('overview');
}

async function switchPdTab(tab) {
  document.querySelectorAll('.pd-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
  var el = document.getElementById('pdContent');
  if (!currentPd) return;
  if (tab === 'overview') {
    var s = currentPd.stats || {};
    var h = '';
    h += '<div class="pd-stat-row"><span class="pd-stat-label">Lifecycle</span><span class="pd-stat-value">' + esc(currentPd.lifecycle || 'planning') + '</span></div>';
    h += '<div class="pd-stat-row"><span class="pd-stat-label">Solutions</span><span class="pd-stat-value">' + (s.solutions || 0) + '</span></div>';
    h += '<div class="pd-stat-row"><span class="pd-stat-label">User Stories</span><span class="pd-stat-value">' + (s['user-stories'] || 0) + '</span></div>';
    h += '<div class="pd-stat-row"><span class="pd-stat-label">Components</span><span class="pd-stat-value">' + (s.components || 0) + '</span></div>';
    h += '<div class="pd-stat-row"><span class="pd-stat-label">Functions</span><span class="pd-stat-value">' + (s.functions || 0) + '</span></div>';
    h += '<div class="pd-stat-row"><span class="pd-stat-label">Business Case</span><span class="pd-stat-value">' + (s['business-case'] ? 'Yes' : 'No') + '</span></div>';
    el.innerHTML = h;
  } else if (tab === 'requirements') {
    el.innerHTML = '<div style="color:var(--fg3);padding:20px;text-align:center">Loading...</div>';
    try {
      var r = await fetchHub('/api/projects/' + encodeURIComponent(currentPd.id) + '/tree');
      if (r.ok) {
        var tree = await r.json();
        var h = '';
        if (tree.solutions) for (var sol of tree.solutions) {
          h += '<div class="req-item"><span class="req-item-type">Solution</span><div class="req-item-title">' + esc(sol.title || sol.id) + '</div></div>';
        }
        if (tree['user-stories']) for (var us of tree['user-stories']) {
          h += '<div class="req-item"><span class="req-item-type">User Story</span><div class="req-item-title">' + esc(us.title || us.id) + '</div></div>';
        }
        if (tree.components) for (var c of tree.components) {
          h += '<div class="req-item"><span class="req-item-type">Component</span><div class="req-item-title">' + esc(c.title || c.id) + '</div></div>';
        }
        el.innerHTML = h || '<div style="color:var(--fg3);text-align:center;padding:20px">No requirements yet</div>';
      }
    } catch(e) {
      el.innerHTML = '<div style="color:var(--red);padding:20px">Failed to load</div>';
    }
  } else if (tab === 'actions') {
    var h = '';
    h += '<button class="pd-action-btn" onclick="runAction(\'validate\')"><span class="pd-action-icon">&#10003;</span>Validate Requirements</button>';
    h += '<button class="pd-action-btn" onclick="runAction(\'scaffold\')"><span class="pd-action-icon">&#9881;</span>Generate App Scaffold</button>';
    h += '<button class="pd-action-btn" onclick="runAction(\'codegen\')"><span class="pd-action-icon">&#9998;</span>AI Code Generation</button>';
    h += '<button class="pd-action-btn" onclick="runAction(\'push\')"><span class="pd-action-icon">&#10548;</span>Push to GitHub</button>';
    h += '<button class="pd-action-btn" onclick="chatAboutProject()"><span class="pd-action-icon">&#9993;</span>Chat about this Project</button>';
    el.innerHTML = h;
  }
}

async function runAction(action) {
  if (!currentPd || !connected) { showToast('Not connected', 'error'); return; }
  showToast('Running ' + action + '...', '');
  try {
    var r = await fetchHub('/api/projects/' + encodeURIComponent(currentPd.id) + '/' + action, { method: 'POST' });
    var data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(action + ' completed', 'success');
    switchPdTab('overview');
  } catch(e) {
    showToast('Action failed: ' + e.message, 'error');
  }
}

// ===== Ideas (Quick BC creation) =====
async function submitIdea() {
  var text = document.getElementById('ideaText').value.trim();
  if (!text) return;
  if (!connected) { showToast('Connect to Hub first', 'error'); return; }
  showToast('Creating requirement...', '');
  try {
    // Use chat to derive a project name + BC
    var r = await fetchHub('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'new',
        message: 'I have an idea for a new project: ' + text + '\n\nPlease suggest a concise project name (3 words max) and write a brief business case summary (3 sentences max). Format: NAME: ...\nBUSINESS CASE: ...',
        systemPrompt: 'You are ARQITEKT, a requirements engineering assistant. Be concise and structured.'
      })
    });
    var data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    // Save to recent ideas
    saveRecentIdea(text, data.reply || data.message || '');
    document.getElementById('ideaText').value = '';
    showToast('Idea captured! Check AI response.', 'success');
    renderRecentIdeas();
  } catch(e) {
    showToast('Failed: ' + e.message, 'error');
  }
}

function saveRecentIdea(text, aiReply) {
  try {
    var ideas = JSON.parse(localStorage.getItem('arqitekt_ideas') || '[]');
    ideas.unshift({ text: text, reply: aiReply, date: new Date().toISOString() });
    if (ideas.length > 20) ideas = ideas.slice(0, 20);
    localStorage.setItem('arqitekt_ideas', JSON.stringify(ideas));
  } catch(e) {}
}

function renderRecentIdeas() {
  var el = document.getElementById('recentIdeas');
  try {
    var ideas = JSON.parse(localStorage.getItem('arqitekt_ideas') || '[]');
    if (!ideas.length) { el.innerHTML = ''; return; }
    var h = '<h3 style="font-size:14px;color:var(--fg2);margin-bottom:10px">Recent Ideas</h3>';
    for (var idea of ideas.slice(0, 5)) {
      h += '<div class="idea-card">';
      h += '<div class="idea-card-title">' + esc(idea.text.slice(0, 100)) + '</div>';
      if (idea.reply) h += '<div class="idea-card-meta">' + esc(idea.reply.slice(0, 150)) + '</div>';
      h += '<div class="idea-card-meta">' + new Date(idea.date).toLocaleDateString() + '</div>';
      h += '</div>';
    }
    el.innerHTML = h;
  } catch(e) {}
}

// ===== Voice =====
function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Voice input not supported', 'error');
    return;
  }
  if (voiceActive) {
    recognition.stop();
    return;
  }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = document.getElementById('settingLang').value === 'de' ? 'de-DE' : 'en-US';
  var btn = document.getElementById('voiceBtn');
  recognition.onstart = function() {
    voiceActive = true;
    btn.classList.add('recording');
  };
  recognition.onresult = function(e) {
    var transcript = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    document.getElementById('ideaText').value = transcript;
  };
  recognition.onend = function() {
    voiceActive = false;
    btn.classList.remove('recording');
  };
  recognition.onerror = function(e) {
    voiceActive = false;
    btn.classList.remove('recording');
    if (e.error !== 'aborted') showToast('Voice error: ' + e.error, 'error');
  };
  recognition.start();
}

// ===== Chat =====
function chatAboutProject() {
  if (!currentPd) return;
  chatHistory = [];
  switchView('chat');
  document.getElementById('chatModelInfo').textContent = 'Context: ' + (currentPd.name || currentPd.id);
}

async function sendChat() {
  var input = document.getElementById('chatInput');
  var msg = input.value.trim();
  if (!msg || !connected) return;
  input.value = '';
  chatHistory.push({ role: 'user', content: msg });
  renderChat();
  try {
    var body = { message: msg };
    if (currentPd) body.projectId = currentPd.id;
    var r = await fetchHub('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    var data = await r.json();
    if (data.error) {
      chatHistory.push({ role: 'assistant', content: 'Error: ' + data.error });
    } else {
      chatHistory.push({ role: 'assistant', content: data.reply || data.message || '...' });
    }
  } catch(e) {
    chatHistory.push({ role: 'assistant', content: 'Connection error: ' + e.message });
  }
  renderChat();
}

function renderChat() {
  var el = document.getElementById('chatMsgs');
  var h = '';
  for (var m of chatHistory) {
    h += '<div class="chat-msg ' + m.role + '">' + formatMsg(m.content) + '</div>';
  }
  el.innerHTML = h;
  el.scrollTop = el.scrollHeight;
}

function formatMsg(text) {
  // Basic code block rendering
  return esc(text).replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                  .replace(/\n/g, '<br>');
}

// ===== Utilities =====
function esc(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showToast(msg, type) {
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();
  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

// ===== Boot =====
init();
renderRecentIdeas();
