import { authFetch, logout } from './auth.js';

// Check authentication on load
if (!localStorage.getItem('jwt')) {
    window.location.href = 'login.html';
}

// Logout button
document.getElementById('logoutButton').addEventListener('click', logout);

// Task management functions (existing code assumed)
// Add your existing script.js code here for task fetching, adding, editing, etc.
async function fetchTasks() {
    const response = await authFetch('http://localhost:8080/api/tasks');
    if (response.ok) {
        const tasks = await response.json();
        displayTasks(tasks);
    }
}

// Placeholder for task display (replace with your existing logic)
function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = tasks.map(task => `
        <div style="background-color: ${task.completed ? '#ecfdf5' : 'white'};" class="p-4 border rounded">
            <h3>${task.title}</h3>
            <p>${task.content}</p>
            <p>Priority: ${task.priority}</p>
            <p>Status: ${task.completed ? 'Completed' : 'Active'}</p>
        </div>
    `).join('');
}

// Add task (example, replace with your logic)
document.getElementById('addTaskBtn').addEventListener('click', async () => {
    const title = document.getElementById('taskTitle').value;
    const content = document.getElementById('taskContent').value;
    const priority = document.getElementById('taskPriority').value;
    const response = await authFetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, content, priority })
    });
    if (response.ok) {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskContent').value = '';
        fetchTasks();
        showNotification('Task added successfully!', '#10b981');
    }
});

// Notification (example, replace with your logic)
function showNotification(message, color) {
    const notification = document.createElement('div');
    notification.style.backgroundColor = color;
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize
fetchTasks();

import { main as analyzeTask } from './openAI.js';
import { isAuthenticated, authFetch, showLoginModal } from './auth.js';

// DOM Elements
const taskTitleInput = document.getElementById('taskTitle');
const taskContentInput = document.getElementById('taskContent');
const taskPrioritySelect = document.getElementById('taskPriority');
const micButton = document.getElementById('micButton');
const addTaskBtn = document.getElementById('addTaskBtn');
const aiLoadingIndicator = document.getElementById('aiLoading');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const sortButtons = {
    all: document.getElementById('sortAll'),
    completed: document.getElementById('sortCompleted'),
    active: document.getElementById('sortActive'),
    high: document.getElementById('sortHigh'),
    medium: document.getElementById('sortMedium'),
    low: document.getElementById('sortLow')
};
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTitleInput = document.getElementById('editTitle');
const editContentInput = document.getElementById('editContent');
const editPrioritySelect = document.getElementById('editPriority');
const editCompletedCheckbox = document.getElementById('editCompleted');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Global Variables
let tasks = [];
let editingTaskId = null;
let currentSort = 'all';
let currentSearchQuery = '';
let justChangedTaskId = null; // Track the task that was just completed/incomplete

// Base URL for backend API
const API_BASE_URL = 'http://localhost:8080/api/tasks';

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        fetchTasks();
    } else {
        showLoginModal();
    }
    setupEventListeners();
});

// Fetch Tasks from Backend
async function fetchTasks() {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    try {
        const response = await authFetch(API_BASE_URL, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
        tasks = await response.json();
        sortAndRenderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showNotification('Failed to load tasks: ' + error.message, 'error');
    }
}

// Search Tasks
async function searchTasks(query) {
    if (!isAuthenticated()) {
        showLoginModal();
        return [];
    }
    try {
        const response = await authFetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(`Failed to search tasks: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching tasks:', error);
        showNotification('Failed to search tasks: ' + error.message, 'error');
        return [];
    }
}

// Event Listeners
function setupEventListeners() {
    // Add Task
    addTaskBtn.addEventListener('click', handleAddTask);

    // Speech-to-Text
    micButton.addEventListener('click', () => {
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            showNotification('Speech recognition not supported in this browser.', 'error');
            return;
        }

        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        micButton.classList.add('listening');

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            taskContentInput.value = transcript;
            micButton.classList.remove('listening');
            // Trigger AI grammar correction if AI Decide is selected
            if (taskPrioritySelect.value === 'AI') {
                handleAddTask();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            showNotification('Speech recognition failed: ' + event.error, 'error');
            micButton.classList.remove('listening');
        };

        recognition.onend = () => {
            micButton.classList.remove('listening');
        };

        recognition.start();
    });

    // Sort Buttons
    Object.keys(sortButtons).forEach(key => {
        sortButtons[key].addEventListener('click', () => {
            currentSort = key;
            sortAndRenderTasks();
            // Update active button
            Object.values(sortButtons).forEach(btn => btn.classList.remove('active-sort'));
            sortButtons[key].classList.add('active-sort');
        });
    });

    // Search Input with Debouncing
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearchQuery = searchInput.value.trim();
            sortAndRenderTasks();
        }, 300); // Debounce for 300ms
    });

    // Edit Modal
    cancelEditBtn.addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', handleEditTask);
}

// Handle Task Creation
async function handleAddTask() {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    let title = taskTitleInput.value.trim();
    let content = taskContentInput.value.trim();
    const priorityOption = taskPrioritySelect.value;

    if (!content) {
        showNotification('Task description is required.', 'error');
        return;
    }

    try {
        aiLoadingIndicator.classList.remove('hidden');

        let taskData = { title, content, priority: 'MEDIUM', dateTime: null, operation: 'Add' };

        // Use OpenAI if title is missing or AI Decide is selected
        if (!title || priorityOption === 'AI') {
            const response = await analyzeTask(content);
            let responseContent = response.choices[0].message.content.trim();
            console.log('Raw OpenAI Response Content:', responseContent);

            // Clean potential Markdown code fences
            if (responseContent.startsWith('```json') && responseContent.endsWith('```')) {
                responseContent = responseContent.slice(7, -3).trim();
            } else if (responseContent.startsWith('```') && responseContent.endsWith('```')) {
                responseContent = responseContent.slice(3, -3).trim();
            }

            let aiResult;
            try {
                aiResult = JSON.parse(responseContent);
                console.log('Parsed AI Result:', aiResult);
                // Validate AI result
                if (!aiResult.task || !aiResult.content || !['HIGH', 'MEDIUM', 'LOW'].includes(aiResult.urgency)) {
                    throw new Error('Invalid AI response format');
                }
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError, 'Content:', responseContent);
                showNotification('Failed to process task description.', 'error');
                aiResult = { task: 'Untitled Task', urgency: 'MEDIUM', content: content, dateTime: null, operation: 'Add' };
            }

            taskData.title = title || aiResult.task || 'Untitled Task';
            taskData.content = aiResult.content || content; // Use AI-corrected content
            taskData.priority = priorityOption === 'AI' ? aiResult.urgency : priorityOption;
            taskData.dateTime = aiResult.dateTime || null;
            taskData.operation = aiResult.operation || 'Add';
        } else {
            taskData.priority = priorityOption;
        }

        // Send task to backend
        const response = await authFetch(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: taskData.title,
                content: taskData.content,
                priority: taskData.priority
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create task');
        }

        const newTask = await response.json();
        tasks.push(newTask);
        sortAndRenderTasks();

        taskTitleInput.value = '';
        taskContentInput.value = '';
        taskPrioritySelect.value = 'AI';
        showNotification('Task added successfully!', 'success');
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Failed to create task: ' + error.message, 'error');
    } finally {
        aiLoadingIndicator.classList.add('hidden');
    }
}

// Handle Task Editing
function openEditModal(taskId) {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        showNotification('Task not found.', 'error');
        return;
    }
    editingTaskId = task.id;
    editTitleInput.value = task.title || '';
    editContentInput.value = task.content;
    editPrioritySelect.value = task.priority;
    editCompletedCheckbox.checked = task.completed;
    editModal.classList.remove('hidden');
}

async function handleEditTask(event) {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    event.preventDefault();
    const title = editTitleInput.value.trim();
    const content = editContentInput.value.trim();
    const priority = editPrioritySelect.value;
    const completed = editCompletedCheckbox.checked;

    if (!content) {
        showNotification('Task content is required.', 'error');
        return;
    }

    try {
        const response = await authFetch(`${API_BASE_URL}/${editingTaskId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: title || null,
                content,
                priority,
                completed
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update task');
        }

        const updatedTask = await response.json();
        tasks = tasks.map(task => task.id === editingTaskId ? updatedTask : task);
        justChangedTaskId = editingTaskId; // Track for animation if completion changed
        sortAndRenderTasks();
        closeEditModal();
        showNotification('Task updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Failed to update task: ' + error.message, 'error');
    }
}

function closeEditModal() {
    editModal.classList.add('hidden');
    editingTaskId = null;
}

// Mark Task as Completed
async function completeTask(taskId) {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    try {
        justChangedTaskId = taskId; // Track for animation
        const response = await authFetch(`${API_BASE_URL}/${taskId}/complete`, {
            method: 'PATCH'
        });
        if (!response.ok) {
            throw new Error('Failed to mark task as completed');
        }
        await fetchTasks();
        showNotification('Task marked as completed!', 'success');
    } catch (error) {
        console.error('Error completing task:', error);
        showNotification('Failed to complete task: ' + error.message, 'error');
    }
}

// Mark Task as Incomplete
async function incompleteTask(taskId) {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    try {
        justChangedTaskId = taskId; // Track for animation
        const response = await authFetch(`${API_BASE_URL}/${taskId}/incomplete`, {
            method: 'PATCH'
        });
        if (!response.ok) {
            throw new Error('Failed to mark task as incomplete');
        }
        await fetchTasks();
        showNotification('Task marked as incomplete!', 'success');
    } catch (error) {
        console.error('Error marking task as incomplete:', error);
        showNotification('Failed to mark task as incomplete: ' + error.message, 'error');
    }
}

// Delete Task
async function deleteTask(taskId) {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await authFetch(`${API_BASE_URL}/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }

        tasks = tasks.filter(task => task.id !== taskId);
        sortAndRenderTasks();
        showNotification('Task deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task: ' + error.message, 'error');
    }
}

// Sort and Render Tasks
async function sortAndRenderTasks() {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    let filteredTasks;

    if (currentSearchQuery) {
        filteredTasks = await searchTasks(currentSearchQuery);
    } else {
        filteredTasks = [...tasks];
    }

    if (currentSort === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (currentSort === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentSort === 'high') {
        filteredTasks = filteredTasks.filter(task => task.priority === 'HIGH');
    } else if (currentSort === 'medium') {
        filteredTasks = filteredTasks.filter(task => task.priority === 'MEDIUM');
    } else if (currentSort === 'low') {
        filteredTasks = filteredTasks.filter(task => task.priority === 'LOW');
    }

    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderTasks(filteredTasks);
}

// Render Tasks
function renderTasks(tasksToRender) {
    taskList.innerHTML = '';

    if (tasksToRender.length === 0) {
        taskList.innerHTML = `
            <div class="text-center text-gray-500 p-4 col-span-full">
                <i class="fas fa-clipboard-list text-2xl mb-2"></i>
                <p>No tasks found.</p>
            </div>
        `;
        return;
    }

    tasksToRender.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card bg-white p-4 rounded-lg shadow-md border-l-4 ${getUrgencyBorder(task.priority)} ${task.completed ? 'completed' : ''} ${task.id === justChangedTaskId ? 'just-completed' : ''}`;
        taskCard.innerHTML = `
            <div class="flex justify-between items-start">
                <h3 class="font-semibold text-gray-800">${task.title || 'Untitled'}</h3>
                <span class="text-xs px-2 py-1 rounded-full ${getUrgencyColor(task.priority)}">${task.priority}</span>
            </div>
            <p class="text-gray-600 mt-1">${task.content}</p>
            <p class="text-xs text-gray-500 mt-2">Status: ${task.completed ? 'Completed' : 'Active'}</p>
            <p class="text-xs text-gray-500 mt-1">Created: ${new Date(task.createdAt).toLocaleString()}</p>
            ${isTaskUpdated(task) ? `<p class="text-xs text-gray-500 mt-1">Updated: ${new Date(task.updatedAt).toLocaleString()}</p>` : ''}
            <div class="mt-2 flex space-x-2">
                <button class="text-blue-500 hover:text-blue-700" onclick="openEditModal(${task.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                ${task.completed ?
            `<button class="text-yellow-500 hover:text-yellow-700" onclick="incompleteTask(${task.id})">
                        <i class="fas fa-undo"></i> Incomplete
                    </button>` :
            `<button class="text-green-500 hover:text-green-700" onclick="completeTask(${task.id})">
                        <i class="fas fa-check"></i> Complete
                    </button>`}
                <button class="text-red-500 hover:text-red-700" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        taskList.appendChild(taskCard);
    });

    // Clear justChangedTaskId after rendering to prevent re-animation
    if (justChangedTaskId) {
        setTimeout(() => {
            justChangedTaskId = null;
            sortAndRenderTasks(); // Re-render to remove just-completed class
        }, 500); // Match animation duration
    }
}

// Helper Functions
function getUrgencyBorder(priority) {
    const borders = {
        HIGH: 'border-red-500',
        MEDIUM: 'border-yellow-500',
        LOW: 'border-green-500'
    };
    return borders[priority] || 'border-gray-500';
}

function getUrgencyColor(priority) {
    const colors = {
        HIGH: 'bg-red-100 text-red-600',
        MEDIUM: 'bg-yellow-100 text-yellow-600',
        LOW: 'bg-green-100 text-green-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
}

function isTaskUpdated(task) {
    const created = new Date(task.createdAt).getTime();
    const updated = new Date(task.updatedAt).getTime();
    return Math.abs(updated - created) > 60000; // Show if updated > 1 minute after creation
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        notification.addEventListener('animationend', () => notification.remove());
    }, 3000);
}

// Global Functions for onclick
window.deleteTask = deleteTask;
window.openEditModal = openEditModal;
window.completeTask = completeTask;
window.incompleteTask = incompleteTask;