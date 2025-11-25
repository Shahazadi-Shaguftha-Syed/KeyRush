// ====== Data ======
const paragraphs = [
  "Learning to code becomes much easier when you build small projects consistently. Each project teaches you something new and strengthens your problem-solving skills.",
  "Good communication is just as important as technical knowledge in the tech world. Clear explanations help teams collaborate better and avoid misunderstandings.",
  "Small habits, repeated daily, become powerful over time. Even ten minutes of focused practice can make a noticeable difference in your skills.",
  "Exploring different programming languages opens your mind to new ways of thinking. Every language has its own style and strengths that shape how you build solutions.",
  "Staying curious is one of the best traits a developer can have. When you experiment and ask questions, you naturally discover things others overlook."
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


const TOTAL_TIME = 60; 
let timerInterval = null;
let timeLeft = TOTAL_TIME;
let isTiming = false;
let currentText = "";
let startTime = null;


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
  }, 1000);
}

function computeStats(){
  const typed = typingArea.value;
  const lenTyped = typed.length;
  const lenRef = currentText.length;
  let mistakes = 0;
  let correctChars = 0;
  for (let i = 0; i < lenTyped; i++){
    if (i >= lenRef) {
      mistakes++;
    } else if (typed[i] !== currentText[i]) {
      mistakes++;
    } else {
      correctChars++;
    }
  }

  const elapsedSeconds = Math.max(1, (TOTAL_TIME - timeLeft));
  const elapsedMinutes = elapsedSeconds / 60;
  const wpm = Math.round((correctChars / 5) / elapsedMinutes) || 0;
  const cpm = correctChars || 0;

  mistakesEl.textContent = mistakes;
  wpmEl.textContent = wpm;
  cpmEl.textContent = cpm;
  displayWPM.textContent = wpm + " WPM";

    // update highlighted test text: correct part colored neon
    const correctPart = escapeHtml(currentText.slice(0, correctChars + (lenTyped > lenRef ? 0 : 0)));
    const nextPart = escapeHtml(currentText.slice(correctChars));
    let html = "";
    for (let i = 0; i < currentText.length; i++) {
      const refCh = currentText[i];
      const typedCh = typed[i];
      if (typedCh === refCh) {
        // correct
        html += `<span style="color:#5bb450; white-space:pre-wrap">${escapeHtml(refCh)}</span>`;
      } else if (typedCh !== undefined) {
        // wrong
        html += `<span style="color:#f55; white-space:pre-wrap">${escapeHtml(refCh)}</span>`;
      } else {
        // not typed yet
        html += `<span style="white-space:pre-wrap">${escapeHtml(refCh)}</span>`;
      }
    }
    testTextEl.innerHTML = html;
}

// ====== Events ======
typingArea.addEventListener("input", (e) => {
  // start timer when user first types
  if (!isTiming) startTimerOnce();
  computeStats();
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


// popup card
function showResults() {
  popupWPM.textContent = "WPM: " + wpmEl.textContent;
  popupMistakes.textContent = "Mistakes: " + mistakesEl.textContent;
  popupCPM.textContent = "CPM: " + cpmEl.textContent;

  resultPopup.classList.remove("hidden");
}

//try again button 
TryAgainPopUp.addEventListener("click", () => {
  resultPopup.classList.add("hidden");
  location.reload();
});

//to be worked on
function closeTab() {
  window.open('', '_self'); 
  window.close();
}

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


