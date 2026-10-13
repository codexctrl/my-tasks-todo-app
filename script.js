
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const dueDateInput = document.getElementById("due-date-input");
const taskList = document.getElementById("task-list");
const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const emptyMessage = document.getElementById("empty-message");

// This array stores our tasks while the page is open.

let tasks = [];

try {
    const savedTasks = localStorage.getItem("todoTasks");

    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
            tasks = parsedTasks.filter(function (task) {
                return task
                    && typeof task.id === "number"
                    && typeof task.text === "string"
                    && typeof task.completed === "boolean";
            });
        }
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

let nextTaskId = tasks.reduce(function (highestId, task) {
    return Math.max(highestId, task.id);
}, 0) + 1;

let currentFilter = "all";

const filterButtons = document.querySelectorAll(".filter-button");

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (item) {
            const isActive = item === button;

            item.classList.toggle("active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });

        renderTasks();
    });
});


// Add a new task when the form is submitted.
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    // Do not allow empty tasks.
    if (taskText === "") {
        return;
    }

    
const newTask = {
    id: nextTaskId,
    text: taskText,
    completed: false,
    priority: priorityInput.value,
    dueDate: dueDateInput.value
};


    nextTaskId++;
    tasks.push(newTask);

    taskInput.value = "";
    dueDateInput.value = "";

    renderTasks();
});

// Draw the current tasks on the page.

function renderTasks() {
    taskList.replaceChildren();

    // Choose which tasks should be visible.
    const visibleTasks = tasks.filter(function (task) {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // Display only the tasks matching the selected filter.
    visibleTasks.forEach(function (task) {
        const listItem = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.text + " as completed"
        );

        const taskText = document.createElement("span");
        taskText.textContent = task.text;
        
        // Create the priority badge.
        const priorityBadge = document.createElement("span");

        // Use Medium for older tasks without a saved priority.
        const priority = ["low", "medium", "high"].includes(task.priority)
            ? task.priority
            : "medium";

        priorityBadge.textContent =
            priority.charAt(0).toUpperCase() + priority.slice(1);

        priorityBadge.classList.add(
            "priority-badge",
            "priority-" + priority
        );
        
        // Create the due-date label.
        const dueDateLabel = document.createElement("span");
        dueDateLabel.classList.add("due-date-label");

        if (task.dueDate) {
            const dateParts = task.dueDate.split("-");

            const formattedDate = new Date(
                Number(dateParts[0]),
                Number(dateParts[1]) - 1,
                Number(dateParts[2])
            ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            dueDateLabel.textContent = "Due " + formattedDate;
        } else {
            dueDateLabel.textContent = "";
        }



        if (task.completed) {
            taskText.style.textDecoration = "line-through";
            taskText.style.color = "#858698";
        }

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            renderTasks();
        });
        
        // Create the Edit button.
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.type = "button";
        editButton.classList.add("edit-button");
        editButton.setAttribute(
            "aria-label",
            "Edit " + task.text
        );
        
        // Edit the task when Edit is clicked.
       
        // Switch the task into inline editing mode.
        editButton.addEventListener("click", function () {
            
            const editPriority = document.createElement("select");
            
            // Create a date picker for editing the due date.
            const editDueDate = document.createElement("input");
            editDueDate.type = "date";
            editDueDate.value = task.dueDate || "";
            editDueDate.classList.add("priority-select");
            editDueDate.setAttribute("aria-label", "Edit due date");

            editPriority.classList.add("priority-select");
            editPriority.setAttribute("aria-label", "Edit task priority");

            ["low", "medium", "high"].forEach(function (priority) {
                const option = document.createElement("option");
                option.value = priority;
                option.textContent =
                    priority.charAt(0).toUpperCase() + priority.slice(1);

                editPriority.appendChild(option);
            });

            editPriority.value = ["low", "medium", "high"].includes(task.priority)
                ? task.priority
                : "medium";

            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.value = task.text;
            editInput.classList.add("edit-input");
            editInput.setAttribute("aria-label", "Edit task");

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.type = "button";
            saveButton.classList.add("save-button");

            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel";
            cancelButton.type = "button";
            cancelButton.classList.add("cancel-button");

            // Replace the task text with the input field.
            taskText.replaceWith(editInput);
            priorityBadge.replaceWith(editPriority);
            dueDateLabel.replaceWith(editDueDate);
            // Replace Edit with Save and Cancel.
            editButton.replaceWith(saveButton);
            deleteButton.replaceWith(cancelButton);

            editInput.focus();
            editInput.select();

            // Save the edited task.
            saveButton.addEventListener("click", function () {
                const updatedText = editInput.value.trim();

                if (updatedText === "") {
                    alert("Task cannot be empty!");
                    editInput.focus();
                    return;
                }

                
                task.text = updatedText;
                task.priority = editPriority.value;
                task.dueDate = editDueDate.value;

                renderTasks();

            });

            // Cancel editing without changing the task.
            cancelButton.addEventListener("click", function () {
                renderTasks();
            });

            // Press Enter to save.
            editInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    saveButton.click();
                }

                if (event.key === "Escape") {
                    cancelButton.click();
                }
            });
        });


        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");
        deleteButton.setAttribute(
            "aria-label",
            "Delete " + task.text
        );

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            renderTasks();
        });

        
listItem.append(
    checkbox,
    taskText,
    priorityBadge,
    dueDateLabel,
    editButton,
    deleteButton
);

        taskList.appendChild(listItem);
    });

    // Count ALL tasks, not just the filtered ones.
    const completedCount = tasks.filter(function (task) {
        return task.completed;
    }).length;
    
    // Calculate the task completion percentage.
    const progressPercent = tasks.length === 0
        ? 0
        : Math.round((completedCount / tasks.length) * 100);

    // Update the progress bar and percentage label.
    const progressFill = document.getElementById("progress-fill");
    const progressPercentLabel = document.getElementById("progress-percent");
    const progressBar = document.getElementById("progress-bar");

    progressFill.style.width = progressPercent + "%";
    progressPercentLabel.textContent = progressPercent + "%";
    progressBar.setAttribute("aria-valuenow", progressPercent);


    totalTasks.textContent =
        tasks.length + (tasks.length === 1 ? " task" : " tasks");

    completedTasks.textContent = completedCount + " completed";

    // Show the empty message only when the selected view has no tasks.
    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add one to get started!";
        emptyMessage.hidden = false;
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent = "No tasks in this filter.";
        emptyMessage.hidden = false;
    } else {
        emptyMessage.hidden = true;
    }

    // Persist the full task list, including hidden tasks.
    try {
        localStorage.setItem("todoTasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
    }
}


// Display the correct initial state.
renderTasks();
