/* ================================
   Capital & Country Game
=================================*/

// Elements
const questionEl = document.querySelector('#question_2');
const optionsDiv = document.querySelector('#options_2');
const resultEl = document.querySelector('#result_2');
const startBtn = document.querySelector('#startBtn_2');
const mascotEl = document.querySelector('#mascot_2');

// Image lists
const idleImg = "img/g.jpg";
const winImgs = ["img/win1.gif", "img/win2.gif", "img/win3.gif", "img/win4.gif"];
const loseImgs = ["img/lose1.gif", "img/lose2.gif"];

// Sounds (already added earlier)
const cheerSfx = new Audio("audio/cheer.mp3");
const sadSfx = new Audio("audio/wah.mp3");

// Sound controls
const muteBtn2 = document.querySelector('#muteBtn_2');
const volRange2 = document.querySelector('#volRange_2');
let isMuted2 = false;

// Default volume
const defaultVol2 = parseFloat(volRange2.value);
cheerSfx.volume = defaultVol2;
sadSfx.volume = defaultVol2;

function setAllVolumes2(v) {
  cheerSfx.volume = v;
  sadSfx.volume = v;
}

muteBtn2.addEventListener('click', () => {
  isMuted2 = !isMuted2;
  muteBtn2.textContent = isMuted2 ? '🔇 Unmute' : '🔊 Mute';
  muteBtn2.setAttribute('aria-pressed', String(!isMuted2));
  setAllVolumes2(isMuted2 ? 0 : parseFloat(volRange2.value));
});

volRange2.addEventListener('input', () => {
  if (!isMuted2) {
    const v = parseFloat(volRange2.value);
    setAllVolumes2(v);
  }
});



// Shuffle utility
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Create a “cycler” that returns the next item each time (no repeats until cycle ends)
function makeCycler(items) {
    let pool = shuffle(items.slice());
    let index = 0;
    return function next() {
        if (index >= pool.length) {
            pool = shuffle(items.slice());
            index = 0;
        }
        return pool[index++];
    };
}

// Build cyclers
const nextWinImg = makeCycler(winImgs);
const nextLoseImg = makeCycler(loseImgs);

// (Optional) Preload to avoid flicker
function preloadImages(srcs) {
    srcs.forEach(src => { const img = new Image(); img.src = src; });
}
preloadImages([idleImg, ...winImgs, ...loseImgs]);

// Reset mascot back to idle after a delay

function resetMascot(delay = 3000) {
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
        mascotEl.src = idleImg;
        mascotEl.classList.remove("dance");
    }, delay);
}

// Game state
let data = [];
let pool = [];
let index = 0;
let current = null;
let score = 0;
let total = 0;
let resetTimer = null;

startBtn.disabled = true;

/* ================================
   Load Data
=================================*/
fetch("countries.json")
    .then(res => res.json())
    .then(json => {
        data = json;
        pool = shuffle(data.slice());
        index = 0;
        startBtn.disabled = false;
    });

/* ================================
   Utility
=================================*/
// Fisher–Yates shuffle
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Reset mascot back to idle
function resetMascot(delay = 3000) {
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
        mascotEl.src = idleImg;
        mascotEl.classList.remove("dance");
    }, delay);
}

/* ================================
   Start / Next
=================================*/
startBtn.addEventListener('click', () => {
    if (index >= pool.length) {
        pool = shuffle(data.slice());
        index = 0;
    }
    current = pool[index++];
    total++;
    askQuestion(current);

    mascotEl.src = idleImg;
    startBtn.disabled = true;
    startBtn.textContent = "Nästa fråga";
});

function askQuestion(item) {
    questionEl.textContent = `Vad är huvudstaden i ${item.country}?`;
    optionsDiv.innerHTML = '';
    resultEl.textContent = '';

    const wrong = new Set();
    while (wrong.size < 3) {
        const pick = data[Math.floor(Math.random() * data.length)];
        if (pick.capital !== item.capital) wrong.add(pick.capital);
    }

    const choices = [...wrong, item.capital];
    shuffle(choices);

    choices.forEach(cap => {
        const btn = document.createElement('button');
        btn.textContent = cap;
        btn.className = "btn-option";
        btn.addEventListener('click', () => checkAnswer(btn, cap));
        optionsDiv.appendChild(btn);
    });
}

/* ================================
   Check Answer
=================================*/
function checkAnswer(button, choice) {
    const buttons = document.querySelectorAll('.btn-option');
    buttons.forEach(btn => btn.disabled = true);
    

    if (choice === current.capital) {
        button.classList.add('correct');
        score++;
        resultEl.textContent = `✅ korrekt! ${choice} är huvudstaden i ${current.country}.`;
        // 🎉 Different win image each time
        mascotEl.src = nextWinImg();
        mascotEl.classList.add("dance");
        cheerSfx.currentTime = 0;
        cheerSfx.play().catch(() => { });
    } else {
        button.classList.add('wrong');
        resultEl.textContent = `❌ Fel. Huvudstaden i ${current.country} är ${current.capital}.`;
        // 😢 Different lose image each time
        mascotEl.src = nextLoseImg();
        sadSfx.currentTime = 0;
        sadSfx.play().catch(() => { });
    }

    resultEl.innerHTML += `<br>Score: ${score}/${total}`;

    startBtn.disabled = false;

    // Reset mascot after 4s
    resetMascot(4000);
}
