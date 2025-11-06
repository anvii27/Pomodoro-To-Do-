document.addEventListener("DOMContentLoaded", () => {
  const timerDisplay = document.querySelector(".timer-display");
  const timerMode = document.querySelector(".timer-mode");
  const startBtn = document.querySelector(".start-btn");
  const pauseBtn = document.querySelector(".pause-btn");
  const resetBtn = document.querySelector(".reset-btn");
  const progressBar = document.querySelector(".progress");
  const pet = document.querySelector(".pet");
  const petMessage = document.querySelector(".pet-message");

  const todoForm = document.querySelector(".todo-form");
  const todoInput = document.querySelector(".todo-input");
  const tasksList = document.querySelector(".tasks-list");
  const tasksCounter = document.querySelector(".tasks-counter");

  const workTime = 25 * 60;
  const breakTime = 5 * 60;
  let timeLeft = workTime;
  let timerInterval = null;
  let isWorkMode = true;
  let totalTime = workTime;
  let isPaused = true;

  // Add a simple audio notification (use a valid sound file in your project or a beep fallback)
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  );

  const workMessages = [
    "You can do it!",
    "Stay focused!",
    "Keep going!",
    "You're doing great!",
    "Almost there!",
  ];

  const breakMessages = [
    "Time to relax!",
    "Take a deep breath!",
    "Rest your eyes!",
    "Stretch a little!",
    "You earned this break!",
  ];

  const pets = ["🐱", "🐶", "🐰", "🐼", "🦊"];
  let currentPet = 0;

  function updatePet() {
    currentPet = (currentPet + 1) % pets.length;
    pet.textContent = pets[currentPet];
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function switchMode() {
    isWorkMode = !isWorkMode;
    document.body.classList.toggle("break-mode");

    if (isWorkMode) {
      timerMode.textContent = "Work Time";
      timeLeft = workTime;
      totalTime = workTime;
      updateRandomMessage(workMessages);
    } else {
      timerMode.textContent = "Break Time";
      timeLeft = breakTime;
      totalTime = breakTime;
      updateRandomMessage(breakMessages);
      updatePet();
    }

    updateDisplay();
  }

  function updateRandomMessage(messages) {
    const randomIndex = Math.floor(Math.random() * messages.length);
    petMessage.textContent = messages[randomIndex];
  }

  function startTimer() {
    if (isPaused) {
      isPaused = false;
      startBtn.disabled = true;
      pauseBtn.disabled = false;

      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateDisplay();

          // Update message every minute
          if (timeLeft % 60 === 0) {
            updateRandomMessage(isWorkMode ? workMessages : breakMessages);
          }
        } else {
          clearInterval(timerInterval);

          // Play audio alert
          audio.play();

          switchMode();
          startTimer();
        }
      }, 1000);
    }
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function resetTimer() {
    pauseTimer();
    isWorkMode = true;
    document.body.classList.remove("break-mode");
    timerMode.textContent = "Work Time";
    timeLeft = workTime;
    totalTime = workTime;
    updateDisplay();
    updateRandomMessage(workMessages);
  }

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  updateDisplay();
  updateRandomMessage(workMessages);

  // --- To-Do List Section ---
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTasksCounter();
  }

  function updateTasksCounter() {
    const completedTasks = tasks.filter((task) => task.completed).length;
    tasksCounter.textContent = `${completedTasks}/${tasks.length} tasks`;
  }

  function renderTasks() {
    tasksList.innerHTML = "";
    tasks.forEach((task, index) => {
      const taskItem = document.createElement("li");
      taskItem.classList.add("task-item");

      const checkbox = document.createElement("div");
      checkbox.classList.add("task-checkbox");
      if (task.completed) {
        checkbox.classList.add("checked");
      }

      const taskText = document.createElement("div");
      taskText.classList.add("task-text");
      taskText.textContent = task.text;
      if (task.completed) {
        taskText.classList.add("completed");
      }

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-task");
      deleteBtn.innerHTML = "×";
      deleteBtn.setAttribute("aria-label", "Delete task");

      taskItem.appendChild(checkbox);
      taskItem.appendChild(taskText);
      taskItem.appendChild(deleteBtn);

      checkbox.addEventListener("click", () => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
      });

      deleteBtn.addEventListener("click", () => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      });

      tasksList.appendChild(taskItem);
    });
  }

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();

    if (taskText !== "") {
      tasks.push({
        text: taskText,
        completed: false,
      });

      todoInput.value = "";
      saveTasks();
      renderTasks();
    }
  });

  renderTasks();
});
