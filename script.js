// Focus timer
const timerDisplay = document.querySelector("#timer-display");
const startButton = document.querySelector("#start-timer");
const resetButton = document.querySelector("#reset-timer");

let secondsLeft = 25 * 60;
let timerInterval = null;

function showTime() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

startButton.addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    startButton.textContent = "Start";
    return;
  }

  if (secondsLeft === 0) {
    secondsLeft = 25 * 60;
    showTime();
  }

  startButton.textContent = "Pause";

  timerInterval = setInterval(() => {
    secondsLeft--;
    showTime();

    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      startButton.textContent = "Start";
    }
  }, 1000);
});

resetButton.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  secondsLeft = 25 * 60;
  startButton.textContent = "Start";
  showTime();
});

showTime();


// Task checklist
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");

let tasks = JSON.parse(localStorage.getItem("studydock-tasks") || "[]");

function saveTasks() {
  localStorage.setItem("studydock-tasks", JSON.stringify(tasks));
}

function displayTasks() {
  taskList.replaceChildren();

  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = task.completed ? "task-item completed" : "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} complete`);

    checkbox.addEventListener("change", () => {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      displayTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      displayTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ text, completed: false });
  saveTasks();
  displayTasks();
  taskInput.value = "";
  taskInput.focus();
});

displayTasks();


// Quick notes
const notesInput = document.querySelector("#notes-input");
notesInput.value = localStorage.getItem("studydock-notes") || "";

notesInput.addEventListener("input", () => {
  localStorage.setItem("studydock-notes", notesInput.value);
});


// Deadline tracker
const deadlineForm = document.querySelector("#deadline-form");
const deadlineTitle = document.querySelector("#deadline-title");
const deadlineType = document.querySelector("#deadline-type");
const deadlineDate = document.querySelector("#deadline-date");
const deadlineList = document.querySelector("#deadline-list");

let deadlines = JSON.parse(
  localStorage.getItem("studydock-deadlines") || "[]"
);

function saveDeadlines() {
  localStorage.setItem(
    "studydock-deadlines",
    JSON.stringify(deadlines)
  );
}

function displayDeadlines() {
  const now = Date.now();

  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()
  );

  const nearest = sorted.find(
    (deadline) => new Date(deadline.due).getTime() > now
  );

  deadlineList.replaceChildren();

  sorted.forEach((deadline) => {
    const dueTime = new Date(deadline.due).getTime();
    const remaining = dueTime - now;
    const overdue = remaining <= 0;
    const isNearest = nearest && deadline.id === nearest.id;

    const item = document.createElement("li");
    item.className = "deadline-item";

    if (overdue) item.classList.add("overdue");
    if (isNearest) item.classList.add("nearest");

    const details = document.createElement("div");
    details.className = "deadline-details";

    const type = document.createElement("span");
    type.className = "deadline-type";
    type.textContent = deadline.type;
    details.append(type);

    if (overdue || isNearest) {
      const badge = document.createElement("span");
      badge.className = "deadline-badge";
      badge.textContent = overdue ? "Overdue" : "Up next";
      details.append(badge);
    }

    const title = document.createElement("h3");
    title.textContent = deadline.title;

    const date = document.createElement("p");
    date.className = "deadline-date";
    date.textContent = "Due: " + new Date(deadline.due).toLocaleString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    );

    const countdown = document.createElement("p");
    countdown.className = "deadline-countdown";

    if (overdue) {
      countdown.textContent = "This deadline has passed.";
    } else {
      const totalMinutes = Math.ceil(remaining / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;

      countdown.textContent =
        `${days}d ${hours}h ${minutes}m remaining`;
    }

    details.append(title, date, countdown);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "deadline-delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      `Delete deadline: ${deadline.title}`
    );

    deleteButton.addEventListener("click", () => {
      deadlines = deadlines.filter(
        (entry) => entry.id !== deadline.id
      );
      saveDeadlines();
      displayDeadlines();
    });

    item.append(details, deleteButton);
    deadlineList.append(item);
  });
}

deadlineTitle.addEventListener("input", () => {
  deadlineTitle.setCustomValidity("");
});

deadlineForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = deadlineTitle.value.trim();
  const due = new Date(deadlineDate.value);

  if (!title) {
    deadlineTitle.setCustomValidity("Enter a deadline title.");
    deadlineTitle.reportValidity();
    return;
  }

  if (Number.isNaN(due.getTime())) return;

  deadlines.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    type: deadlineType.value,
    due: due.toISOString()
  });

  saveDeadlines();
  displayDeadlines();
  deadlineForm.reset();
  deadlineTitle.focus();
});

displayDeadlines();

// Refresh countdowns without replacing a focused Delete button.
setInterval(() => {
  if (!deadlineList.contains(document.activeElement)) {
    displayDeadlines();
  }
}, 10000);
