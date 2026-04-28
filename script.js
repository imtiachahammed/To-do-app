// =============================================
//   AuraithX Todo — script.js
// =============================================

let todos = [];
const input  = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list   = document.getElementById('todo-list');

// Load saved todos
const saved = localStorage.getItem('todos');
todos = saved ? JSON.parse(saved) : [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Generate short task ID e.g. #A3F
function genId() {
    return '#' + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function createNode(todo, index) {
    const li = document.createElement('li');

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.addEventListener('change', () => {
        todo.completed = checkbox.checked;
        if (todo.completed) {
            textSpan.style.textDecoration = 'line-through';
            textSpan.style.color = 'var(--text-dim)';
            li.style.borderLeftColor = 'var(--text-dim)';
            li.style.opacity = '0.55';
        } else {
            textSpan.style.textDecoration = 'none';
            textSpan.style.color = 'var(--text-hi)';
            li.style.borderLeftColor = '';
            li.style.opacity = '1';
        }
        saveTodos();
    });

    // Task ID badge
    const taskId = document.createElement('span');
    taskId.className = 'task-id';
    taskId.textContent = todo.id || genId();
    if (!todo.id) todo.id = taskId.textContent;

    // Task text
    const textSpan = document.createElement('span');
    textSpan.textContent = todo.text;
    if (todo.completed) {
        textSpan.style.textDecoration = 'line-through';
        textSpan.style.color = 'var(--text-dim)';
        li.style.borderLeftColor = 'var(--text-dim)';
        li.style.opacity = '0.55';
    }

    // Double-click (desktop) + Double-tap (mobile) to edit
let lastTap = 0;

textSpan.addEventListener('dblclick', () => {
    triggerEdit();
});

textSpan.addEventListener('touchend', (e) => {
    const now = Date.now();
    const gap = now - lastTap;
    if (gap < 300 && gap > 0) {
        e.preventDefault(); // stop zoom / ghost click
        triggerEdit();
    }
    lastTap = now;
});

function triggerEdit() {
    const newText = prompt('Edit task:', todo.text);
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
        textSpan.textContent = todo.text;
        saveTodos();
    }
}

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'DEL';
    delBtn.addEventListener('click', () => {
        li.style.animation = 'none';
        li.style.transition = 'opacity 0.2s, transform 0.2s';
        li.style.opacity = '0';
        li.style.transform = 'translateX(16px)';
        setTimeout(() => {
            todos.splice(index, 1);
            saveTodos();
            render();
        }, 200);
    });

    li.appendChild(checkbox);
    li.appendChild(taskId);
    li.appendChild(textSpan);
    li.appendChild(delBtn);

    return li;
}

function render() {
    list.innerHTML = '';
    todos.forEach((todo, index) => {
        list.appendChild(createNode(todo, index));
    });
}

function addTodo() {
    const text = input.value.trim();
    if (!text) return;
    todos.push({ text, completed: false, id: genId() });
    input.value = '';
    saveTodos();
    render();
}

// Events
addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});

// Initial render
render();
