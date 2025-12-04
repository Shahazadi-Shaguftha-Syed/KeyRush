// ====== Data ======
const paragraphs = [
  "The morning breeze drifted through the open window, carrying the scent of fresh rain. Birds began their soft songs, filling the quiet air with gentle melodies. As the sun slowly rose, golden light spread across the sleepy town. People stepped outside, ready to begin their day with renewed energy. Everything felt calm and full of promise, as though the world had been refreshed overnight.",
  "The old train station buzzed with life as travelers hurried along the platform. Luggage wheels clattered against the floor, mingling with the distant rumble of arriving trains. A young boy watched in awe, imagining adventures waiting beyond the tracks. Vendors called out cheerfully, offering warm pastries and hot tea. As the whistle sounded, excitement filled the air, marking the beginning of another journey.",
  "The forest path was lined with tall, ancient trees swaying gently in the wind. Sunlight filtered through the leaves, creating shifting patterns on the ground. A small stream bubbled nearby, adding a calming rhythm to the peaceful scene. Hikers moved quietly, careful not to disturb the natural harmony around them. Every step forward revealed something new and beautiful hidden in the wilderness.",
  "In the bustling café, the aroma of freshly brewed coffee filled the air. Friends gathered around small tables, chatting and laughing between sips. A barista worked skillfully behind the counter, crafting drinks with practiced ease. Soft music played in the background, adding to the warm atmosphere. It was the kind of place where time seemed to slow down, inviting people to stay just a little longer.",
  "The city lights sparkled like stars as evening settled in. Cars rushed by, their headlights weaving through the busy streets. A street musician played a soulful tune, drawing the attention of passersby. Couples strolled along the sidewalks, enjoying the cool night air. Despite the noise and movement, there was something comforting about the energy of the city at dusk.",
  "In the bewildering labyrinth of self-awareness, the philosophical impetus—the very élan vital of inquiry—propels us toward a confrontation with the noumenon, that elusive reality beyond sensory apprehension. We must, therefore, scrutinize the inherent contradictions in our epistemology; namely, how can we assert objective truth while fundamentally relying on subjective perception? This epistemological conundrum, often exacerbated by a reliance on heuristic devices, necessitates a meticulous deconstruction of our preconceived notions, requiring an intellectual fortitude akin to Sisyphus's eternal climb, but with a less predictable trajectory of success. The ultimate realization, however unsettling, is that the journey itself, punctuated by intermittent epiphanies and profound skepticism, constitutes the essence of human intellectual endeavor."
];
// ====== Elements ======
const testTextEl = document.getElementById("testText");
const typingArea = document.getElementById("typingArea");
const timeLeftEl = document.getElementById("timeLeft");
const mistakesEl = document.getElementById("mistakes");
const wpmEl = document.getElementById("wpm");
const cpmEl = document.getElementById("cpm");
const displayWPM = document.getElementById("displayWPM");
const tryAgainBtn = document.getElementById("tryAgain");
const resultPopup = document.getElementById("resultPopup");
const popupWPM = document.getElementById("popupWPM");
const popupMistakes = document.getElementById("popupMistakes");
const popupCPM = document.getElementById("popupCPM");
const closePopup = document.getElementById("closePopup");
const TryAgainPopUp = document.getElementById("TryAgainPopUp");
const errorSound = new Audio("./audio/error.wav");
const popupAccuracy = document.getElementById("popupAccuracy");
const accuracyEl = document.getElementById("accuracy");


let TOTAL_TIME = 60;  // default selected
let timeLeft = TOTAL_TIME;
let timerInterval = null;
let isTiming = false;
let currentText = "";
let startTime = null;
let wpmHistory = [];
let errorHistory = [];
let playedErrorForIndex = [];

function loadRandomText() {
  const idx = Math.floor(Math.random() * paragraphs.length);
  currentText = paragraphs[idx];
  testTextEl.innerHTML = escapeHtml(currentText);
  typingArea.value = "";
  typingArea.disabled = false;
  typingArea.focus();
  resetStats();
}

function escapeHtml(str){
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function resetStats(){
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timeLeft = TOTAL_TIME;
  isTiming = false;
  startTime = null;
  timeLeftEl.textContent = timeLeft;
  mistakesEl.textContent = 0;
  wpmEl.textContent = 0;
  cpmEl.textContent = 0;
  displayWPM.textContent = "0 WPM";
  wpmHistory = [];
  errorHistory = [];
  playedErrorForIndex = [];
}


function startTimerOnce(){
  if (isTiming) return;
  isTiming = true;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) timeLeft = 0;
    timeLeftEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      typingArea.disabled = true;
      showResults();
    }    

    computeStats();
    // save history every second
    wpmHistory.push(parseInt(wpmEl.textContent) || 0);
    errorHistory.push(parseInt(mistakesEl.textContent) || 0);
  }, 1000);
}

function computeStats(finalRun = false) {
  const typed = typingArea.value || "";
  let mistakes = 0;
  let correctChars = 0;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== currentText[i]) mistakes++;
    else correctChars++;
  }

  const elapsedSeconds = startTime
    ? Math.max(1, (Date.now() - startTime) / 1000)
    : 1;

  const elapsedMinutes = elapsedSeconds / 60;

  const wpm = Math.round((correctChars / 5) / elapsedMinutes) || 0;
  const cpm = Math.round(correctChars / elapsedMinutes) || 0;
  const accuracy = typed.length === 0
    ? 0
    : ((correctChars / typed.length) * 100).toFixed(2);

  mistakesEl.textContent = mistakes;
  wpmEl.textContent = wpm;
  cpmEl.textContent = cpm;
  displayWPM.textContent = wpm + " WPM";
  if (accuracyEl) accuracyEl.textContent = accuracy + "%";

  // ===== Highlight Text =====
  let html = "";
  for (let i = 0; i < currentText.length; i++) {
    const ref = currentText[i];
    const typedCh = typed[i];
    const safeChar = ref === " " ? "&nbsp;" : escapeHtml(ref);

    if (typedCh === ref) {
      html += `<span style="color:#5bb450">${safeChar}</span>`;
    } 
    else if (typedCh !== undefined) {
      html += `<span style="color:#f55">${safeChar}</span>`;

      if (!playedErrorForIndex[i]) {
        errorSound.currentTime = 0;
        errorSound.play();
        playedErrorForIndex[i] = true;
      }
    } 
    else {
      html += `<span style="color:#888">${safeChar}</span>`;
    }
  }

  testTextEl.innerHTML = html;

  if (finalRun) {
    return { wpm, cpm, mistakes, accuracy };
  }
}



// ====== Events ======
typingArea.addEventListener("input", (e) => {
  if (!isTiming) startTimerOnce();
  computeStats();
});

typingArea.addEventListener("paste", function (e) {
  e.preventDefault();
  alert("To ensure fair typing performance, paste actions are disabled in the input area.");
});


tryAgainBtn.addEventListener("click", () => {
  loadRandomText(); // includes resetting stats
});

// load initial text
loadRandomText();

const toggle = document.getElementById("toggleBtn");
toggle.addEventListener("change", () => {
  document.body.classList.toggle("light", toggle.checked);
});

function flashBlockedBackspace() {
  const orig = typingArea.style.boxShadow;
  typingArea.style.boxShadow = "0 0 0 4px rgba(255,80,80,0.12)";
  setTimeout(() => typingArea.style.boxShadow = orig, 160);
}
typingArea.addEventListener('keydown', function (e) {
  if (e.key !== 'Backspace') return;
  const selStart = typingArea.selectionStart;
  const selEnd = typingArea.selectionEnd;
  if (selStart !== selEnd) {
    return;
  }
  const caretPos = selStart;
  if (caretPos === 0) {
    e.preventDefault();
    flashBlockedBackspace();
    return;
  }
  const typed = typingArea.value;
  const deleteIndex = caretPos - 1;
  if (deleteIndex >= currentText.length) {
    e.preventDefault();
    typingArea.value = typed.slice(0, deleteIndex) + typed.slice(deleteIndex + 1);
    typingArea.setSelectionRange(deleteIndex, deleteIndex);
    computeStats();
    return;
  }
  const typedChar = typed[deleteIndex];
  const refChar = currentText[deleteIndex];
  if (typedChar !== refChar) {
    e.preventDefault();
    typingArea.value = typed.slice(0, deleteIndex) + typed.slice(deleteIndex + 1);
    typingArea.setSelectionRange(deleteIndex, deleteIndex);
    computeStats();
    return;
  } else {
    e.preventDefault();
    flashBlockedBackspace();
    
    return;
  }
});


// popup card
function showResults() {
  const finalStats = computeStats(true);
  popupWPM.textContent = "WPM: " + wpmEl.textContent;
  popupMistakes.textContent = "Mistakes: " + mistakesEl.textContent;
  popupCPM.textContent = "CPM: " + cpmEl.textContent;  
  popupAccuracy.textContent = "Accuracy: " + finalStats.accuracy + "%";

  resultPopup.classList.remove("hidden");
  setTimeout(() => {
    drawTypingChart();
  }, 150);
}
function saveResult(wpm) {
  let history = JSON.parse(localStorage.getItem("typingHistory")) || [];
  history.push(wpm);
  localStorage.setItem("typingHistory", JSON.stringify(history));
}



//try again button 
TryAgainPopUp.addEventListener("click", () => {
  resultPopup.classList.add("hidden");
  loadRandomText();
});


// Start Popup
const startPopup = document.getElementById("startPopup");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
  startPopup.style.display = "none";
  typingArea.disabled = false;
  typingArea.focus();
});

window.addEventListener("load", () => {
  document.getElementById("pageContainer").classList.add("show");
});


// TIMER BUTTONS
const timeButtons = document.querySelectorAll(".time-btn");
timeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    timeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    TOTAL_TIME = Number(btn.dataset.time);
    timeLeft = TOTAL_TIME;
    timeLeftEl.textContent = timeLeft;

    resetStats();
  });
});


window.addEventListener("keydown", function (e) {
  if ((e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")) {
    e.preventDefault();
    loadRandomText();
  }
});


//performance chart
let typingChartInstance = null;
function drawTypingChart() {
  const canvas = document.getElementById("typingChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const labels = wpmHistory.map((_, i) => i + 1);
  const errorPoints = errorHistory.map((val, i ) => {
    if(i === 0) return null;
    return val > errorHistory[i - 1] ? wpmHistory[i] : null;
  });
  
  if (typingChartInstance) {
    typingChartInstance.destroy();
  }
  typingChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "WPM",
          data: wpmHistory,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139,92,246,0.15)",
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 0
        },
        {
          label: "Errors",
          data: errorPoints, 
          type: "scatter",
          pointRadius: 9,
          borderWidth: 2,
          pointStyle: "crossRot",
          backgroundColor: "red",
          borderColor: "red"
        }
        
      ]
      
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#aaa" } },
        y: {
          beginAtZero: true,
          ticks: { color: "#aaa" },
          grid: { color: "#333" }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#ddd" }
        }
      }
    }
  });
}
