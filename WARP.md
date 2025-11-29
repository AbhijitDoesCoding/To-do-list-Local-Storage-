# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TaskFlow is a frontend-only to-do list application with task prioritization. It's a vanilla JavaScript application with no build process, bundler, or external dependencies.

## Running the Application

Open `index.html` directly in a web browser. There are no build steps, servers, or dependencies to install.

## Architecture

### State Management
The application uses a simple in-memory state system:
- `tasks` array stores all task objects globally
- `currentFilter` tracks the active filter view ("all", "active", "completed")
- `currentPriority` tracks the selected priority for new tasks ("low", "medium", "high")
- `editingTaskId` holds the ID of the task being edited

### Data Storage
Storage is handled through custom functions (`saveTasks()`, `loadTasks()`) that use `window.tasksStorage` object. This is NOT localStorage - it's an in-memory implementation that persists only during the browser session.

**Important**: If you need to add real localStorage persistence, replace the storage functions in `script.js` (lines 209-230) to use `localStorage.setItem()` and `localStorage.getItem()`.

### Task Object Structure
Each task contains:
```javascript
{
  id: Number,           // Timestamp-based unique ID
  text: String,         // Task description
  completed: Boolean,   // Completion status
  priority: String,     // "low", "medium", or "high"
  createdAt: String     // ISO timestamp
}
```

### Core Flow
1. **Add Task**: User inputs text → selects priority → clicks Add → task added to beginning of `tasks` array
2. **Render**: `renderTasks()` filters tasks based on `currentFilter`, generates HTML for each task, attaches event listeners
3. **Toggle/Edit/Delete**: Event listeners call corresponding functions → modify `tasks` array → call `saveTasks()` → re-render
4. **Stats Update**: After any operation, `updateStats()` recalculates and displays total/active/completed counts

### Key Components
- **Priority Selector** (lines 27-33): Visual selector that sets `currentPriority` for new tasks
- **Filter System** (lines 61-68): Updates `currentFilter` and triggers re-render
- **Edit Modal** (lines 151-187): Modal overlay for editing task text, managed via class toggle
- **HTML Escaping** (line 232-236): `escapeHtml()` prevents XSS by sanitizing user input before rendering

## Code Style and Patterns

- Event listeners are attached directly in `renderTasks()` for dynamically created elements
- UI updates always follow the pattern: modify data → save → render → update stats
- Modal visibility is controlled via CSS class `active` rather than inline styles
- Priority is visually indicated through CSS classes (`priority-low`, `priority-medium`, `priority-high`)

## Common Modifications

### Adding Features to Tasks
To add a new property (e.g., due date, tags):
1. Update the task object structure in `addTask()` function (line 45)
2. Modify `renderTasks()` to display the new property (line 92)
3. Update `openEditModal()` if the property should be editable

### Changing Storage Mechanism
To use actual localStorage instead of in-memory:
- Replace `window.tasksStorage` references in `saveTasks()` and `loadTasks()` with `localStorage.setItem('tasks', tasksData)` and `localStorage.getItem('tasks')`

### Adding New Filters
1. Add filter button in `index.html` with `data-filter` attribute
2. Add filter logic in `renderTasks()` function (line 74)

## File Structure
- `index.html` - DOM structure with semantic HTML5
- `script.js` - All application logic (237 lines)
- `styles.css` - Dark-themed styling with purple gradient color scheme
- `README.md` - User-facing documentation
