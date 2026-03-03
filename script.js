/* =============================================
   SMART TASK MANAGER – JavaScript Logic
   Concepts: Variables, Arrays, Functions,
   Loops, Control Statements, DOM Manipulation,
   Event Listeners, Data Types (String, Boolean)
   ============================================= */

// ─── Global State ──────────────────────────────────────────────────────────

// Array to store all task objects (temporary in-memory storage)
let tasks = [];

// Current filter applied to the task list
let currentFilter = 'all';

// Unique ID counter for each task
let nextId = 1;

// ─── DOM Element References ────────────────────────────────────────────────

const taskInput      = document.getElementById('task-input');
const addBtn         = document.getElementById('add-btn');
const taskList       = document.getElementById('task-list');
const emptyState     = document.getElementById('empty-state');
const validationMsg  = document.getElementById('validation-msg');
const prioritySelect = document.getElementById('priority-select');
const totalCount     = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount   = document.getElementById('pending-count');

// ─── Helper: Get Current Time String ──────────────────────────────────────

/**
 * Returns a short formatted time string for task timestamp.
 * @returns {string} e.g. "02:45 PM"
 */
function getCurrentTime() {
  const now = new Date();
  let hours   = now.getHours();
  let minutes = now.getMinutes();
  const ampm  = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12;

  // Pad minutes with leading zero if needed
  const minuteStr = minutes < 10 ? '0' + minutes : String(minutes);

  return hours + ':' + minuteStr + ' ' + ampm;
}

// ─── Show Validation Message ───────────────────────────────────────────────

/**
 * Displays a validation or error message below the input.
 * Automatically hides after 3 seconds.
 * @param {string} message - The message text to display.
 */
function showValidation(message) {
  validationMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
  validationMsg.classList.add('show');

  // Auto-hide after 3 seconds
  setTimeout(function () {
    validationMsg.classList.remove('show');
  }, 3000);
}

// ─── Add Task ─────────────────────────────────────────────────────────────

/**
 * Validates user input and adds a new task to the tasks array.
 * Uses: if-else control statement, array push, DOM update.
 */
function addTask() {
  // Step 1: Read the input value and trim whitespace
  const inputValue = taskInput.value.trim();
  const priority   = prioritySelect.value;

  // Step 2: Validate input using if-else (control statement)
  if (inputValue === '') {
    showValidation('Please enter a task before adding!');
    taskInput.focus();
    return; // Exit function early if validation fails
  }

  if (inputValue.length < 2) {
    showValidation('Task must be at least 2 characters long.');
    taskInput.focus();
    return;
  }

  // Step 3: Create a new task object and push into the tasks array
  const newTask = {
    id:        nextId++,          // Number: unique identifier
    text:      inputValue,        // String: task description
    completed: false,             // Boolean: completion status
    priority:  priority,          // String: 'high' | 'medium' | 'low'
    time:      getCurrentTime()   // String: creation time
  };

  tasks.push(newTask); // Add to array

  // Step 4: Clear input field
  taskInput.value = '';
  taskInput.focus();

  // Step 5: Re-render the task list to display updated array
  renderTasks();
  updateStats();
}

// ─── Render Tasks ─────────────────────────────────────────────────────────

/**
 * Clears the task list and re-renders all tasks using a for loop.
 * Uses: for loop, DOM createElement, appendChild, control statements.
 */
function renderTasks() {
  // Clear the existing list from the DOM
  taskList.innerHTML = '';

  // Determine which tasks to show based on the current filter
  // Using control statement (if-else) for filtering
  let filteredTasks = [];

  if (currentFilter === 'all') {
    filteredTasks = tasks;
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(function (t) { return t.completed === true; });
  } else if (currentFilter === 'pending') {
    filteredTasks = tasks.filter(function (t) { return t.completed === false; });
  }

  // Show or hide the empty state message (control statement)
  if (filteredTasks.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }

  // Use a for loop to iterate over the filtered tasks array
  for (let i = 0; i < filteredTasks.length; i++) {
    const task = filteredTasks[i];

    // ── Build task item using DOM manipulation ──────────────────
    const li = document.createElement('li');
    li.classList.add('task-item');
    li.id = 'task-' + task.id;

    // Add priority class for left border color
    li.classList.add('priority-' + task.priority);

    // Mark as completed if applicable
    if (task.completed) {
      li.classList.add('completed');
    }

    // ── Checkbox (visual) ──
    const checkbox = document.createElement('div');
    checkbox.classList.add('task-checkbox');
    if (task.completed) {
      checkbox.classList.add('checked');
    }
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', String(task.completed));
    checkbox.setAttribute('tabindex', '0');
    checkbox.setAttribute('title', task.completed ? 'Mark as pending' : 'Mark as complete');
    checkbox.onclick = function () { toggleComplete(task.id); };
    checkbox.onkeydown = function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleComplete(task.id);
      }
    };

    // ── Task Content ──
    const content = document.createElement('div');
    content.classList.add('task-content');

    const textEl = document.createElement('span');
    textEl.classList.add('task-text');
    textEl.textContent = task.text;

    const meta = document.createElement('div');
    meta.classList.add('task-meta');

    // Priority badge using switch statement
    const badge = document.createElement('span');
    badge.classList.add('task-priority-badge');

    switch (task.priority) {
      case 'high':
        badge.className = 'task-priority-badge badge-high';
        badge.textContent = '🔴 High';
        break;
      case 'low':
        badge.className = 'task-priority-badge badge-low';
        badge.textContent = '🟢 Low';
        break;
      default: // medium
        badge.className = 'task-priority-badge badge-medium';
        badge.textContent = '🟡 Medium';
        break;
    }

    const timeEl = document.createElement('span');
    timeEl.classList.add('task-time');
    timeEl.textContent = 'Added at ' + task.time;

    meta.appendChild(badge);
    meta.appendChild(timeEl);

    content.appendChild(textEl);
    content.appendChild(meta);

    // ── Action Buttons ──
    const actions = document.createElement('div');
    actions.classList.add('task-actions');

    // Complete/undo button
    const completeBtn = document.createElement('button');
    completeBtn.classList.add('action-btn', 'complete-btn');
    completeBtn.title = task.completed ? 'Mark as Pending' : 'Mark as Complete';
    completeBtn.innerHTML = task.completed
      ? '<i class="fas fa-rotate-left"></i>'
      : '<i class="fas fa-check"></i>';
    completeBtn.onclick = function () { toggleComplete(task.id); };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('action-btn', 'delete-btn');
    deleteBtn.title = 'Delete Task';
    deleteBtn.innerHTML = '<i class="fas fa-trash-can"></i>';
    deleteBtn.onclick = function () { deleteTask(task.id); };

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    // ── Assemble the task item using appendChild ──
    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    // Append the task item to the list
    taskList.appendChild(li);
  }
}

// ─── Toggle Complete ───────────────────────────────────────────────────────

/**
 * Toggles the completed state of a task by its ID.
 * Uses: for loop to find task, boolean toggle, re-render.
 * @param {number} id - The unique ID of the task to toggle.
 */
function toggleComplete(id) {
  // Use a for loop to find the task with the matching ID
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      // Toggle the boolean completed status
      tasks[i].completed = !tasks[i].completed;
      break; // Exit loop once found
    }
  }

  renderTasks();
  updateStats();
}

// ─── Delete Task ───────────────────────────────────────────────────────────

/**
 * Removes a task from the tasks array by its ID.
 * Uses: DOM .remove(), array splice, animation.
 * @param {number} id - The unique ID of the task to delete.
 */
function deleteTask(id) {
  // Add removal animation class
  const el = document.getElementById('task-' + id);
  if (el) {
    el.classList.add('removing');

    // Wait for animation to finish before removing from DOM & array
    setTimeout(function () {
      // Remove task from the tasks array using filter
      tasks = tasks.filter(function (t) { return t.id !== id; });

      renderTasks();
      updateStats();
    }, 300);
  }
}

// ─── Update Stats ──────────────────────────────────────────────────────────

/**
 * Updates the total, completed, and pending task counters in the stats bar.
 * Uses: for loop, counter variables (Number type).
 */
function updateStats() {
  let total     = tasks.length;       // Number
  let completed = 0;                  // Number
  let pending   = 0;                  // Number

  // Use for loop to count completed and pending tasks
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed === true) {
      completed++;
    } else {
      pending++;
    }
  }

  // Update the DOM elements with the new counts
  totalCount.textContent     = total;
  completedCount.textContent = completed;
  pendingCount.textContent   = pending;
}

// ─── Filter Tasks ─────────────────────────────────────────────────────────

/**
 * Sets the current filter and re-renders the task list.
 * @param {string} filter - 'all' | 'pending' | 'completed'
 * @param {HTMLElement} btn - The clicked filter button element.
 */
function filterTasks(filter, btn) {
  currentFilter = filter;

  // Remove 'active' class from all filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  for (let i = 0; i < filterBtns.length; i++) {
    filterBtns[i].classList.remove('active');
  }

  // Add 'active' class to the clicked button
  btn.classList.add('active');

  renderTasks();
}

// ─── Clear Completed ───────────────────────────────────────────────────────

/**
 * Removes all completed tasks from the array and re-renders.
 */
function clearCompleted() {
  // Count how many will be removed
  let removedCount = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      removedCount++;
    }
  }

  // Guard: if no completed tasks, show message
  if (removedCount === 0) {
    showValidation('No completed tasks to clear!');
    return;
  }

  // Filter out completed tasks
  tasks = tasks.filter(function (t) { return t.completed === false; });

  renderTasks();
  updateStats();
}

// ─── Event Listeners ───────────────────────────────────────────────────────

// Listen for 'keypress' event on input (Enter key submits task)
taskInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});

// ─── Initial Render ────────────────────────────────────────────────────────

// Run on page load to set initial UI state
renderTasks();
updateStats();
