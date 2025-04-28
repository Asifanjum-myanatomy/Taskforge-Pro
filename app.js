// app.js

// wait for the document to be fully parsed
document.addEventListener('DOMContentLoaded', () => {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let editIndex = null;

  // DOM Elements
  const taskContainer   = document.getElementById('taskContainer');
  const progressFill    = document.querySelector('.progress-fill');
  const progressPercent = document.querySelector('.progress-percent');
  const addTaskBtn      = document.getElementById('addTaskBtn');
  const taskModal       = document.getElementById('taskModal');
  const closeModalBtn   = document.querySelector('.close-modal');
  const saveBtn         = document.getElementById('saveTask');
  const modalTitle      = document.getElementById('modalTitle');
  const titleInput      = document.getElementById('taskTitle');
  const descInput       = document.getElementById('taskDesc');
  const categorySelect  = document.getElementById('taskCategory');
  const filterCategory  = document.getElementById('filterCategory');
  const searchInput     = document.getElementById('searchInput');
  const clearBtn        = document.getElementById('clearCompleted');

  // Save to localStorage
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Render all tasks (with current filter/search)
  function renderTasks() {
    taskContainer.innerHTML = '';
    const filtered = tasks.filter(t =>
      (filterCategory.value === 'all' || t.category === filterCategory.value) &&
      (t.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
       t.description.toLowerCase().includes(searchInput.value.toLowerCase()))
    );

    filtered.forEach((t, i) => {
      const el = document.createElement('div');
      el.className = 'task-card';
      el.innerHTML = `
        <div class="task-header">
          <h3 class="${t.completed ? 'completed' : ''}">${t.title}</h3>
          <span class="category-tag" style="background:${
            t.category === 'work' ? 'var(--work-color)' : 'var(--personal-color)'}">
            ${t.category}
          </span>
        </div>
        <p class="task-description">${t.description}</p>
        <div class="task-footer">
          <label class="checkbox-container">
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${i})">
            <span class="checkmark"></span>
            <span class="status-text">${t.completed ? 'Completed' : 'Pending'}</span>
          </label>
          <div class="btn-group">
            <button class="edit-btn" onclick="editTask(${i})">✎</button>
            <button class="delete-btn" onclick="deleteTask(${i})">
              <svg class="delete-icon" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      `;
      // smooth hover lift
      el.addEventListener('mouseenter', () => el.style.transform = 'translateY(-5px)');
      el.addEventListener('mouseleave', () => el.style.transform = 'translateY(0)');
      taskContainer.appendChild(el);
    });
  }

  // Update progress bar
  function updateProgress() {
    const done = tasks.filter(t => t.completed).length;
    const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    progressFill.style.width    = pct + '%';
    progressPercent.textContent = pct + '%';
  }

  // Expose these so inline handlers work
  window.toggleTask = i => {
    tasks[i].completed = !tasks[i].completed;
    saveTasks(); renderTasks(); updateProgress();
  };
  window.deleteTask = i => {
    tasks.splice(i, 1);
    saveTasks(); renderTasks(); updateProgress();
  };
  window.editTask = i => {
    editIndex = i;
    modalTitle.textContent = 'Edit Task';
    saveBtn.textContent = 'Update Task';
    const t = tasks[i];
    titleInput.value = t.title;
    descInput.value = t.description;
    categorySelect.value = t.category;
    saveBtn.disabled = false;
    taskModal.style.display = 'flex';
  };

  // Clear completed tasks
  clearBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks(); renderTasks(); updateProgress();
  });

  // Modal open/close
  addTaskBtn.addEventListener('click', () => {
    editIndex = null;
    modalTitle.textContent = 'Create New Task';
    saveBtn.textContent = 'Save Task';
    titleInput.value = '';
    descInput.value = '';
    categorySelect.value = 'personal';
    saveBtn.disabled = true;
    taskModal.style.display = 'flex';
  });
  closeModalBtn.addEventListener('click', () => taskModal.style.display = 'none');
  document.addEventListener('click', e => {
    if (e.target === taskModal) taskModal.style.display = 'none';
  });

  // Form validation + textarea auto-resize
  function checkFormValid() {
    saveBtn.disabled = !(titleInput.value.trim() && descInput.value.trim());
  }
  titleInput.addEventListener('input', checkFormValid);
  descInput.addEventListener('input', () => {
    descInput.style.height = 'auto';
    descInput.style.height = descInput.scrollHeight + 'px';
    checkFormValid();
  });

  // Save or update on click
  saveBtn.addEventListener('click', () => {
    const newTask = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      category: categorySelect.value,
      completed: false
    };
    if (editIndex !== null) {
      tasks[editIndex] = { ...tasks[editIndex], ...newTask };
    } else {
      tasks.push(newTask);
    }
    saveTasks(); renderTasks(); updateProgress();
    taskModal.style.display = 'none';
  });

  // Initial render
  renderTasks();
  updateProgress();
  checkFormValid();
});
