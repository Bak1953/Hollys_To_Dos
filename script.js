// DOM Elements
const todoInput = document.getElementById('todoInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const resourcesInput = document.getElementById('resourcesInput');
const peopleInput = document.getElementById('peopleInput');
const sortSelect = document.getElementById('sortSelect');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
const completedList = document.getElementById('completedList');
const archivedList = document.getElementById('archivedList');
const showCompletedBtn = document.getElementById('showCompletedBtn');
const showArchivedBtn = document.getElementById('showArchivedBtn');
const completedSection = document.getElementById('completedSection');
const archivedSection = document.getElementById('archivedSection');
const completedCount = document.getElementById('completedCount');
const archivedCount = document.getElementById('archivedCount');
const printButton = document.getElementById('printButton');

// Initialize empty arrays
let todos = [];
let completedTodos = [];
let archivedTodos = [];

// Load saved todos from localStorage
function loadTodos() {
    try {
        const savedTodos = localStorage.getItem('todos');
        const savedCompleted = localStorage.getItem('completedTodos');
        const savedArchived = localStorage.getItem('archivedTodos');

        if (savedTodos) {
            todos = JSON.parse(savedTodos);
            console.log('Loaded active todos:', todos.length);
        }
        
        if (savedCompleted) {
            completedTodos = JSON.parse(savedCompleted);
            console.log('Loaded completed todos:', completedTodos.length);
        }
        
        if (savedArchived) {
            archivedTodos = JSON.parse(savedArchived);
            console.log('Loaded archived todos:', archivedTodos.length);
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        // Initialize with empty arrays if there's an error
        todos = [];
        completedTodos = [];
        archivedTodos = [];
    }
}

// Save todos to localStorage
function saveTodos() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
        localStorage.setItem('archivedTodos', JSON.stringify(archivedTodos));
        console.log('Todos saved successfully');
        console.log('Active todos:', todos.length);
        console.log('Completed todos:', completedTodos.length);
        console.log('Archived todos:', archivedTodos.length);
    } catch (error) {
        console.error('Error saving todos:', error);
    }
}

// Set min date for the date picker to today
dueDateInput.min = new Date().toISOString().split('T')[0];

// Update task counts
const updateTaskCounts = () => {
    completedCount.textContent = completedTodos.length;
    archivedCount.textContent = archivedTodos.length;
};

// Toggle section visibility with animation
const toggleSection = (section, button) => {
    const isHidden = section.classList.contains('hidden');
    
    if (isHidden) {
        // Show section
        section.classList.remove('hidden');
        section.classList.add('section-enter');
        button.classList.add('active');
        
        // Trigger animation
        requestAnimationFrame(() => {
            section.classList.remove('section-enter');
            section.classList.add('section-enter-active');
        });
        
        // Clean up classes after animation
        setTimeout(() => {
            section.classList.remove('section-enter-active');
        }, 300);
    } else {
        // Hide section
        section.classList.add('section-exit');
        button.classList.remove('active');
        
        // Trigger animation
        requestAnimationFrame(() => {
            section.classList.add('section-exit-active');
        });
        
        // Hide and clean up after animation
        setTimeout(() => {
            section.classList.add('hidden');
            section.classList.remove('section-exit', 'section-exit-active');
        }, 300);
    }
};

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Check if due date is approaching (within 2 days)
const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
};

// Create todo item element
function createTodoItem(todo, listType = 'active') {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    todoItem.setAttribute('data-category', todo.category);
    todoItem.setAttribute('data-id', todo.id);

    const todoContent = document.createElement('div');
    todoContent.className = 'todo-content';

    // Main content with task text, category, and priority
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = todo.text;
    mainContent.appendChild(textSpan);

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    const cssVarName = todo.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    categoryBadge.style.backgroundColor = `var(--category-${cssVarName})`;
    categoryBadge.textContent = todo.category;
    mainContent.appendChild(categoryBadge);

    if (todo.priority) {
        const priorityBadge = document.createElement('span');
        priorityBadge.className = `priority-badge priority-${todo.priority}`;
        priorityBadge.textContent = `${todo.priority} Priority`;
        mainContent.appendChild(priorityBadge);
    }

    todoContent.appendChild(mainContent);

    // Details section
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'todo-details';

    if (todo.dueDate) {
        const dueDateElement = document.createElement('div');
        dueDateElement.className = 'due-date';
        dueDateElement.innerHTML = `📅 Due: ${formatDate(todo.dueDate)}`;
        detailsDiv.appendChild(dueDateElement);
    }

    if (todo.resources) {
        const resourcesElement = document.createElement('div');
        resourcesElement.className = 'resources';
        resourcesElement.innerHTML = `📦 Resources: ${todo.resources}`;
        detailsDiv.appendChild(resourcesElement);
    }

    if (todo.people) {
        const peopleElement = document.createElement('div');
        peopleElement.className = 'people';
        peopleElement.innerHTML = `👥 People: ${todo.people}`;
        detailsDiv.appendChild(peopleElement);
    }

    todoContent.appendChild(detailsDiv);
    todoItem.appendChild(todoContent);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    switch(listType) {
        case 'archived':
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.className = 'delete-button';
            deleteButton.title = 'Delete Permanently';
            deleteButton.onclick = () => {
                if (confirm('Are you sure you want to permanently delete this task?')) {
                    deleteTodo(todoItem);
                }
            };
            buttonContainer.appendChild(deleteButton);
            break;
            
        case 'completed':
            const archiveButton = document.createElement('button');
            archiveButton.textContent = '📁';
            archiveButton.className = 'archive-button';
            archiveButton.title = 'Archive Task';
            archiveButton.onclick = () => archiveTodo(todoItem);
            buttonContainer.appendChild(archiveButton);
            break;
            
        default: // active
            const completeButton = document.createElement('button');
            completeButton.textContent = '✓';
            completeButton.className = 'complete-button';
            completeButton.title = 'Mark as Complete';
            completeButton.onclick = () => completeTodo(todoItem);
            
            const activeArchiveButton = document.createElement('button');
            activeArchiveButton.textContent = '📁';
            activeArchiveButton.className = 'archive-button';
            activeArchiveButton.title = 'Archive Task';
            activeArchiveButton.onclick = () => archiveTodo(todoItem);
            
            buttonContainer.appendChild(completeButton);
            buttonContainer.appendChild(activeArchiveButton);
    }
    
    todoItem.appendChild(buttonContainer);
    return todoItem;
}

// Delete todo
function deleteTodo(todoItem) {
    const id = todoItem.getAttribute('data-id');
    console.log('Deleting todo with id:', id);
    console.log('Before delete - archived todos:', archivedTodos.length);
    
    // Remove the todo from archivedTodos array
    archivedTodos = archivedTodos.filter(todo => todo.id.toString() !== id.toString());
    
    console.log('After delete - archived todos:', archivedTodos.length);
    
    // Save to localStorage
    localStorage.setItem('archivedTodos', JSON.stringify(archivedTodos));
    
    // Re-render the todos
    renderTodos();
}

// Render todos
function renderTodos() {
    todoList.innerHTML = '';
    completedList.innerHTML = '';
    archivedList.innerHTML = '';

    // Sort todos
    const sortedActive = sortTodos(todos);
    const sortedCompleted = sortTodos(completedTodos);
    const sortedArchived = sortTodos(archivedTodos);

    sortedActive.forEach(todo => {
        todoList.appendChild(createTodoItem(todo, 'active'));
    });

    sortedCompleted.forEach(todo => {
        completedList.appendChild(createTodoItem(todo, 'completed'));
    });

    sortedArchived.forEach(todo => {
        archivedList.appendChild(createTodoItem(todo, 'archived'));
    });

    // Update counts
    completedCount.textContent = completedTodos.length;
    archivedCount.textContent = archivedTodos.length;
}

// Sort todos
function sortTodos(todoArray) {
    const sortBy = sortSelect.value;
    
    return [...todoArray].sort((a, b) => {
        switch (sortBy) {
            case 'dueDate':
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
                
            case 'priority':
                const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
                
            case 'category':
            default:
                return a.category.localeCompare(b.category);
        }
    });
}

// Add new todo
function addTodo() {
    const todoText = todoInput.value.trim();
    const category = categorySelect.value;
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    const resources = resourcesInput.value.trim();
    const people = peopleInput.value.trim();

    if (!todoText) {
        alert('Please enter a task description');
        return;
    }

    if (!category) {
        alert('Please select a category');
        return;
    }

    const newTodo = {
        id: Date.now().toString(),
        text: todoText,
        category: category,
        priority: priority || 'Medium',
        dueDate: dueDate,
        resources: resources,
        people: people,
        completed: false
    };

    console.log('Adding new todo:', newTodo);
    todos.push(newTodo);
    saveTodos();
    renderTodos();

    // Clear inputs
    todoInput.value = '';
    categorySelect.value = '';
    prioritySelect.value = '';
    dueDateInput.value = '';
    resourcesInput.value = '';
    peopleInput.value = '';
}

// Complete todo
function completeTodo(todoItem) {
    const id = todoItem.getAttribute('data-id');
    console.log('Completing todo with id:', id);
    console.log('Before completion - active todos:', todos.length);
    console.log('Before completion - completed todos:', completedTodos.length);

    // Find the todo in the active todos array
    const todoIndex = todos.findIndex(todo => todo.id.toString() === id.toString());
    
    if (todoIndex !== -1) {
        // Get the todo and mark it as completed
        const completedTodo = todos[todoIndex];
        completedTodo.completed = true;
        
        // Remove from active todos and add to completed todos
        todos.splice(todoIndex, 1);
        completedTodos.push(completedTodo);
        
        console.log('After completion - active todos:', todos.length);
        console.log('After completion - completed todos:', completedTodos.length);
        
        // Save to localStorage
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
        
        // Re-render the todos
        renderTodos();
    } else {
        console.error('Todo not found with id:', id);
    }
}

// Archive todo
function archiveTodo(todoItem) {
    const id = todoItem.getAttribute('data-id');
    console.log('Archiving todo with id:', id);
    
    // Check both active and completed todos
    let sourceArray = todos;
    let sourceIndex = todos.findIndex(todo => todo.id.toString() === id.toString());
    
    if (sourceIndex === -1) {
        sourceArray = completedTodos;
        sourceIndex = completedTodos.findIndex(todo => todo.id.toString() === id.toString());
    }
    
    if (sourceIndex !== -1) {
        // Get the todo
        const archivedTodo = sourceArray[sourceIndex];
        
        // Remove from source array and add to archived
        sourceArray.splice(sourceIndex, 1);
        archivedTodos.push(archivedTodo);
        
        // Save to localStorage
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
        localStorage.setItem('archivedTodos', JSON.stringify(archivedTodos));
        
        // Re-render the todos
        renderTodos();
    } else {
        console.error('Todo not found with id:', id);
    }
}

// Clear all todos and storage
function clearAllTodos() {
    todos = [];
    completedTodos = [];
    archivedTodos = [];
    localStorage.clear();
    renderTodos();
    console.log('All todos cleared');
}

// Print active tasks
function printActiveTasks() {
    console.log('Print button clicked');
    window.print();
}

// Event Listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});
sortSelect.addEventListener('change', renderTodos);
showCompletedBtn.addEventListener('click', () => toggleSection(completedSection, showCompletedBtn));
showArchivedBtn.addEventListener('click', () => toggleSection(archivedSection, showArchivedBtn));
printButton.addEventListener('click', printActiveTasks);

// Initialize the application
loadTodos();
renderTodos();

// Register service worker for offline PWA support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch((error) => console.error('Service Worker registration failed:', error));
}
