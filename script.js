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