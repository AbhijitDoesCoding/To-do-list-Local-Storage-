let tasks = [];
let currentFilter = "all";
let currentPriority = "low";
let editingTaskId = null;

const todoInput = document.getElementById("todo-input");
const addTaskBtn = document.getElementById("add-task-btn");
const todoList = document.getElementById("todo-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const priorityOptions = document.querySelectorAll(".priority-option");
const clearCompletedBtn = document.getElementById("clear-completed");
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");

// Initialize
init();

function init() {
  tasks = loadTasks();
  renderTasks();
  updateStats();
}

// Priority selection
priorityOptions.forEach((option) => {
  option.addEventListener("click", () => {
    priorityOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    currentPriority = option.dataset.priority;
  });
});

// Add task
addTaskBtn.addEventListener("click", addTask);
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  const task = {
    id: Date.now(),
    text: text,
    completed: false,
    priority: currentPriority,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
  updateStats();
  todoInput.value = "";
}

// Filter tasks
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Render tasks
function renderTasks() {
  todoList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    todoList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div>No tasks ${
                  currentFilter !== "all" ? currentFilter : "yet"
                }</div>
            </div>
        `;
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
            <div class="task-checkbox ${
              task.completed ? "checked" : ""
            }" data-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <span class="task-priority priority-${task.priority}">${
      task.priority
    }</span>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" data-id="${
                  task.id
                }">✏️</button>
                <button class="task-btn delete-btn" data-id="${
                  task.id
                }">🗑️</button>
            </div>
        `;

    // Toggle completion
    li.querySelector(".task-checkbox").addEventListener("click", () => {
      toggleTask(task.id);
    });

    // Edit task
    li.querySelector(".edit-btn").addEventListener("click", () => {
      openEditModal(task.id);
    });

    // Delete task
    li.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTask(task.id);
    });

    todoList.appendChild(li);
  });
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
  updateStats();
}

function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    editingTaskId = id;
    editInput.value = task.text;
    editModal.classList.add("active");
    editInput.focus();
  }
}

saveEditBtn.addEventListener("click", () => {
  const task = tasks.find((t) => t.id === editingTaskId);
  if (task && editInput.value.trim()) {
    task.text = editInput.value.trim();
    saveTasks();
    renderTasks();
    closeEditModal();
  }
});

cancelEditBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

editInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    saveEditBtn.click();
  }
});

function closeEditModal() {
  editModal.classList.remove("active");
  editingTaskId = null;
  editInput.value = "";
}

// Clear completed
clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
  updateStats();
});

// Update statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  document.getElementById("total-tasks").textContent = total;
  document.getElementById("active-tasks").textContent = active;
  document.getElementById("completed-tasks").textContent = completed;
}

// Storage functions (in-memory for artifacts)
function saveTasks() {
  try {
    const tasksData = JSON.stringify(tasks);
    const tempStorage = window.tasksStorage || {};
    tempStorage["tasks"] = tasksData;
    window.tasksStorage = tempStorage;
  } catch (e) {
    console.error("Error saving tasks:", e);
  }
}

function loadTasks() {
  try {
    if (window.tasksStorage && window.tasksStorage["tasks"]) {
      return JSON.parse(window.tasksStorage["tasks"]);
    }
    return [];
  } catch (e) {
    console.error("Error loading tasks:", e);
    return [];
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
