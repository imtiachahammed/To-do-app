// =============================================
//   AuraithX Task OS — script.js v2.1 FIXED
//   Fixes: task list not showing, notifications,
//          countdown cleanup, sidebar on Android
// =============================================

let todos = [];
let currentFilter = 'all';
let currentCatFilter = 'all';
let notifPermission = false;
let notifTimers = {};      // setTimeout IDs for notifications
let countdownTimers = {};  // setInterval IDs for countdowns

// =============================================
//   LOAD DATA (with v1 migration)
// =============================================
const savedV2 = localStorage.getItem('ax-todos-v2');
const savedV1 = localStorage.getItem('todos');

if (savedV2) {
  todos = JSON.parse(savedV2);
} else if (savedV1) {
  const old = JSON.parse(savedV1);
  todos = old.map(t => ({
    id:        t.id || genId(),
    text:      t.text,
    completed: t.completed || false,
    priority:  'medium',
    category:  'General',
    dueDate:   null,
    createdAt: Date.now()
  }));
  localStorage.setItem('ax-todos-v2', JSON.stringify(todos));
}

function saveTodos() {
  localStorage.setItem('ax-todos-v2', JSON.stringify(todos));
}

function genId() {
  return '#' + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// =============================================
//   CLOCK
// =============================================
function updateClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  el.textContent =
    String(now.getHours()).padStart(2,'0') + ':' +
    String(now.getMinutes()).padStart(2,'0') + ':' +
    String(now.getSeconds()).padStart(2,'0');
}
setInterval(updateClock, 1000);
updateClock();

// =============================================
//   NOTIFICATIONS — using Service Worker
//   (required for Android PWA)
// =============================================
function showSWNotification(title, body, tag) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      tag,
      icon:             './To%20do%20list/Icon/launchericon-192x192.png',
      badge:            './To%20do%20list/Icon/launchericon-192x192.png',
      requireInteraction: true,
      vibrate:          [200, 100, 200]
    });
  }).catch(console.error);
}

function requestNotifPermission() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return;
  }
  Notification.requestPermission().then(perm => {
    notifPermission = perm === 'granted';
    const btn = document.getElementById('notif-btn');
    if (notifPermission) {
      btn.textContent = '🔔 ALERTS ON';
      btn.classList.add('granted');
      scheduleAllNotifs();
    } else {
      btn.textContent = '🔕 BLOCKED';
    }
  });
}

function scheduleAllNotifs() {
  // Clear all existing notification timers
  Object.keys(notifTimers).forEach(k => {
    clearTimeout(notifTimers[k]);
    delete notifTimers[k];
  });
  // Re-schedule for all pending todos
  todos.forEach(todo => {
    if (!todo.completed && todo.dueDate) scheduleNotif(todo);
  });
}

function scheduleNotif(todo) {
  if (!notifPermission || !todo.dueDate) return;

  const due    = new Date(todo.dueDate).getTime();
  const now    = Date.now();
  const msLeft = due - now;

  // Clear any existing timers for this todo
  clearNotifTimers(todo.id);

  // 15 minute warning
  const warnMs = msLeft - (15 * 60 * 1000);
  if (warnMs > 0) {
    notifTimers[todo.id + '_warn'] = setTimeout(() => {
      showSWNotification(
        '⚡ AuraithX — Task Reminder',
        `"${todo.text}" is due in 15 minutes!`,
        todo.id + '_warn'
      );
    }, warnMs);
  }

  // At due time
  if (msLeft > 0) {
    notifTimers[todo.id + '_due'] = setTimeout(() => {
      showSWNotification(
        '🚨 AuraithX — TASK DUE NOW',
        `"${todo.text}" is due RIGHT NOW!`,
        todo.id + '_due'
      );
    }, msLeft);
  }
}

function clearNotifTimers(id) {
  ['_warn', '_due'].forEach(suffix => {
    const key = id + suffix;
    clearTimeout(notifTimers[key]);
    delete notifTimers[key];
  });
}

// Check permission on load
if ('Notification' in window && Notification.permission === 'granted') {
  notifPermission = true;
  const btn = document.getElementById('notif-btn');
  if (btn) { btn.textContent = '🔔 ALERTS ON'; btn.classList.add('granted'); }
  scheduleAllNotifs();
}

// =============================================
//   COUNTDOWN TIMER (live due date display)
// =============================================
function startCountdown(todo, dueEl) {
  // Clear any existing countdown for this todo
  stopCountdown(todo.id);

  countdownTimers[todo.id] = setInterval(() => {
    const dueFmt = formatDue(todo.dueDate);
    if (!dueFmt) { stopCountdown(todo.id); return; }
    dueEl.className = `task-due ${dueFmt.cls}`;
    dueEl.textContent = `📅 ${dueFmt.label}`;
  }, 30000); // update every 30 seconds
}

function stopCountdown(id) {
  if (countdownTimers[id]) {
    clearInterval(countdownTimers[id]);
    delete countdownTimers[id];
  }
}

function stopAllCountdowns() {
  Object.keys(countdownTimers).forEach(id => stopCountdown(id));
}

// =============================================
//   ADD TODO
// =============================================
function addTodo() {
  const input = document.getElementById('todo-input');
  const text  = input.value.trim();
  if (!text) return;

  const priority = document.getElementById('priority-select').value;
  const category = document.getElementById('cat-select').value;
  const dueDate  = document.getElementById('due-date').value;

  const todo = {
    id:        genId(),
    text,
    priority,
    category,
    dueDate:   dueDate || null,
    completed: false,
    createdAt: Date.now()
  };

  todos.unshift(todo);
  input.value = '';
  document.getElementById('due-date').value = '';

  saveTodos();
  scheduleNotif(todo);
  render();
}

// Enter key support
document.getElementById('todo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// =============================================
//   FILTER & SEARCH
// =============================================
function setFilter(f, btn) {
  currentFilter    = f;
  currentCatFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  render();
}

function setCatFilter(cat) {
  currentCatFilter = cat;
  currentFilter    = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  render();
}

function getFiltered() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const now    = Date.now();

  return todos.filter(t => {
    const isOverdue = t.dueDate && !t.completed && new Date(t.dueDate).getTime() < now;
    if (currentCatFilter !== 'all' && t.category !== currentCatFilter) return false;
    if (search && !t.text.toLowerCase().includes(search)) return false;
    if (currentFilter === 'all')     return true;
    if (currentFilter === 'done')    return t.completed;
    if (currentFilter === 'overdue') return isOverdue;
    if (currentFilter === 'high')    return t.priority === 'high'   && !t.completed;
    if (currentFilter === 'medium')  return t.priority === 'medium' && !t.completed;
    if (currentFilter === 'low')     return t.priority === 'low'    && !t.completed;
    return true;
  });
}

// =============================================
//   DUE DATE FORMATTER
// =============================================
function formatDue(dueDate) {
  if (!dueDate) return null;
  const due  = new Date(dueDate);
  const now  = new Date();
  const diff = due - now;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let label = '', cls = '';
  if (diff < 0)       { label = 'OVERDUE';       cls = 'overdue'; }
  else if (mins < 60) { label = `${mins}m left`;  cls = 'soon'; }
  else if (hrs  < 24) { label = `${hrs}h left`;   cls = 'soon'; }
  else if (days < 3)  { label = `${days}d left`;  cls = 'soon'; }
  else {
    label = due.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) +
            ' ' + due.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  }
  return { label, cls };
}

// =============================================
//   CREATE TASK NODE
// =============================================
function createNode(todo) {
  const li = document.createElement('li');
  li.className = `pri-${todo.priority || 'medium'}${todo.completed ? ' completed' : ''}`;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type    = 'checkbox';
  checkbox.checked = !!todo.completed;
  checkbox.addEventListener('change', () => {
    todo.completed = checkbox.checked;
    if (todo.completed) {
      clearNotifTimers(todo.id);
      stopCountdown(todo.id);
    } else {
      scheduleNotif(todo);
    }
    saveTodos();
    render();
  });

  // Body
  const body = document.createElement('div');
  body.className = 'task-body';

  // Text
  const textSpan = document.createElement('div');
  textSpan.className   = 'task-text';
  textSpan.textContent = todo.text;

  // Double-click + double-tap to edit
  let lastTap = 0;
  textSpan.addEventListener('dblclick', () => triggerEdit(todo, textSpan));
  textSpan.addEventListener('touchend', e => {
    const now = Date.now();
    const gap = now - lastTap;
    if (gap < 300 && gap > 0) {
      e.preventDefault();
      triggerEdit(todo, textSpan);
    }
    lastTap = now;
  });

  // Meta row
  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const idEl = document.createElement('span');
  idEl.className   = 'task-id';
  idEl.textContent = todo.id;

  const catEl = document.createElement('span');
  catEl.className   = 'task-cat';
  catEl.textContent = todo.category || 'General';

  meta.appendChild(idEl);
  meta.appendChild(catEl);

  // Due date with live countdown
  if (todo.dueDate) {
    const dueFmt = formatDue(todo.dueDate);
    if (dueFmt) {
      const dueEl = document.createElement('span');
      dueEl.className   = `task-due ${dueFmt.cls}`;
      dueEl.textContent = `📅 ${dueFmt.label}`;
      meta.appendChild(dueEl);
      if (!todo.completed) startCountdown(todo, dueEl);
    }
  }

  body.appendChild(textSpan);
  body.appendChild(meta);

  // Delete button — clears countdown AND notification timers
  const delBtn = document.createElement('button');
  delBtn.className   = 'task-del';
  delBtn.textContent = 'DEL';
  delBtn.addEventListener('click', () => {
    li.style.transition = 'opacity 0.2s, transform 0.2s';
    li.style.opacity    = '0';
    li.style.transform  = 'translateX(16px)';
    setTimeout(() => {
      stopCountdown(todo.id);
      clearNotifTimers(todo.id);
      todos.splice(todos.indexOf(todo), 1);
      saveTodos();
      render();
    }, 200);
  });

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(body);
  li.appendChild(actions);

  return li;
}

function triggerEdit(todo, textSpan) {
  const newText = prompt('Edit task:', todo.text);
  if (newText !== null && newText.trim() !== '') {
    todo.text        = newText.trim();
    textSpan.textContent = todo.text;
    saveTodos();
  }
}

// =============================================
//   RENDER
// =============================================
function render() {
  // Stop all countdowns before re-rendering
  stopAllCountdowns();

  const list     = document.getElementById('todo-list');
  const filtered = getFiltered();
  list.innerHTML = '';

  if (filtered.length === 0) {
    const empty       = document.createElement('div');
    empty.className   = 'empty-state';
    empty.textContent = '// NO TASKS MATCH CURRENT FILTER';
    list.appendChild(empty);
  } else {
    filtered.forEach(todo => list.appendChild(createNode(todo)));
  }

  updateStats();
  updateCatList();
  updateAnalytics();
}

// =============================================
//   STATS
// =============================================
function updateStats() {
  const now     = Date.now();
  const total   = todos.length;
  const done    = todos.filter(t => t.completed).length;
  const overdue = todos.filter(t => t.dueDate && !t.completed && new Date(t.dueDate).getTime() < now).length;
  const rate    = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('s-total').textContent   = total;
  document.getElementById('s-done').textContent    = done;
  document.getElementById('s-overdue').textContent = overdue;
  document.getElementById('s-rate').textContent    = rate + '%';
}

// =============================================
//   CATEGORY SIDEBAR
// =============================================
function updateCatList() {
  const cats      = [...new Set(todos.map(t => t.category || 'General'))];
  const container = document.getElementById('cat-list');
  container.innerHTML = '';

  const allBtn       = document.createElement('button');
  allBtn.className   = 'filter-btn' + (currentCatFilter === 'all' ? ' active' : '');
  allBtn.textContent = 'ALL';
  allBtn.onclick     = () => setCatFilter('all');
  container.appendChild(allBtn);

  cats.forEach(cat => {
    const btn       = document.createElement('button');
    btn.className   = 'filter-btn' + (currentCatFilter === cat ? ' active' : '');
    btn.textContent = cat;
    btn.onclick     = () => setCatFilter(cat);
    container.appendChild(btn);
  });
}

// =============================================
//   ANALYTICS
// =============================================
function updateAnalytics() {
  const now     = Date.now();
  const total   = todos.length;
  const done    = todos.filter(t => t.completed).length;
  const rate    = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue = todos.filter(t => t.dueDate && !t.completed && new Date(t.dueDate).getTime() < now).length;
  const pending = todos.filter(t => !t.completed).length;
  const withDue = todos.filter(t => t.dueDate).length;

  const bar = document.getElementById('ana-bar');
  const pct = document.getElementById('ana-pct');
  if (bar) bar.style.width = rate + '%';
  if (pct) pct.textContent = rate + '%';

  const priChart = document.getElementById('priority-chart');
  if (priChart) {
    const high   = todos.filter(t => t.priority === 'high').length;
    const medium = todos.filter(t => t.priority === 'medium').length;
    const low    = todos.filter(t => t.priority === 'low').length;
    const max    = Math.max(high, medium, low, 1);
    priChart.innerHTML = [
      { label: '🔴 HIGH',   count: high,   color: '#ff3c5a' },
      { label: '🟡 MEDIUM', count: medium, color: '#ffd93d' },
      { label: '🟢 LOW',    count: low,    color: '#00ff88' }
    ].map(i => `
      <div class="chart-row">
        <div class="chart-label">${i.label}</div>
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="width:${(i.count/max)*100}%;background:${i.color}"></div>
        </div>
        <div class="chart-count">${i.count}</div>
      </div>`).join('');
  }

  const catChart = document.getElementById('cat-chart');
  if (catChart) {
    const cats   = {};
    todos.forEach(t => { const c = t.category || 'General'; cats[c] = (cats[c]||0)+1; });
    const maxCat = Math.max(...Object.values(cats), 1);
    catChart.innerHTML = Object.entries(cats).map(([cat, count]) => `
      <div class="chart-row">
        <div class="chart-label">${cat}</div>
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="width:${(count/maxCat)*100}%;background:var(--cyan)"></div>
        </div>
        <div class="chart-count">${count}</div>
      </div>`).join('');
  }

  const qs = document.getElementById('quick-stats');
  if (qs) {
    qs.innerHTML = [
      { label: 'TOTAL TASKS',   value: total },
      { label: 'COMPLETED',     value: done },
      { label: 'PENDING',       value: pending },
      { label: 'OVERDUE',       value: overdue },
      { label: 'WITH DUE DATE', value: withDue },
      { label: 'COMPLETION',    value: rate + '%' }
    ].map(s => `
      <div class="qs-item">
        <div class="qs-label">${s.label}</div>
        <div class="qs-value">${s.value}</div>
      </div>`).join('');
  }
}

// =============================================
//   VIEW SWITCHER
// =============================================
function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  document.getElementById('view-title').textContent =
    view === 'tasks' ? 'TASK_QUEUE' : 'ANALYTICS';
  if (view === 'analytics') updateAnalytics();
}

// =============================================
//   SIDEBAR (works on both mobile & desktop)
// =============================================
function openSidebar() {
  const sb = document.getElementById('sidebar');
  const mn = document.getElementById('main');
  const bd = document.querySelector('.sidebar-backdrop');
  if (window.innerWidth <= 768) {
    sb.classList.add('open');
    if (bd) bd.classList.add('show');
  } else {
    sb.classList.remove('hidden');
    mn.classList.remove('full');
  }
}

function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const mn = document.getElementById('main');
  const bd = document.querySelector('.sidebar-backdrop');
  sb.classList.remove('open');
  if (bd) bd.classList.remove('show');
  if (window.innerWidth > 768) {
    sb.classList.add('hidden');
    mn.classList.add('full');
  }
}

function toggleSidebar() {
  const sb     = document.getElementById('sidebar');
  const isOpen = window.innerWidth <= 768
    ? sb.classList.contains('open')
    : !sb.classList.contains('hidden');
  isOpen ? closeSidebar() : openSidebar();
}

// Close sidebar on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });

// =============================================
//   INIT
// =============================================
render();
