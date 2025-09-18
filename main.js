/* ================================
      Elements
   =================================*/
const msg = document.querySelector('#message');
const guessInput = document.querySelector('#guessInput');
const guessBtn = document.querySelector('#guessBtn');
const startBtn = document.querySelector('#startBtn');
const triesVal = document.querySelector('#triesVal');
const muteBtn = document.querySelector('#muteBtn');
const volRange = document.querySelector('#volRange');
const mascot = document.querySelector('#mascot');

/* ================================
   Game State
=================================*/
let secret = null;
let triesLeft = 15;
const minVal = 1;
const maxVal = 100;

/* ================================
   Audio Setup (replace paths)
=================================*/
const bg = new Audio('audio/bg-loop.mp3');   // looped background music
const win = new Audio('audio/yay.mp3');      // short success sound
const lose = new Audio('audio/wah.mp3');    // short lose sound

bg.loop = true;
const defaultVol = parseFloat(volRange.value);
bg.volume = defaultVol;
win.volume = Math.min(defaultVol + 0.1, 1);
lose.volume = Math.min(defaultVol + 0.1, 1);

let userInteracted = false; // needed to allow audio playback
let isMuted = false;

function setAllVolumes(v) {
    bg.volume = v;
    win.volume = Math.min(v + 0.1, 1);
    lose.volume = Math.min(v + 0.1, 1);
}

function duckBG(durationMs = 600, toVol = 0.15) {
    const prev = bg.volume;
    if (!isMuted) bg.volume = toVol;
    setTimeout(() => { if (!isMuted) bg.volume = prev; }, durationMs);
}

function ensureBGPlays() {
    if (userInteracted && !isMuted) {
        bg.play().catch(() => { });
    }
}

/* ================================
   Helpers
=================================*/
// Trigger the mascot dance animation cleanly each time
function danceMascot() {
    mascot.classList.remove('dance'); // reset if it was still dancing
    // Force reflow so the class re-add restarts the animation
    void mascot.offsetWidth;
    mascot.classList.add('dance');
    // Remove the class after animation ends (≈ 2.4s)
    setTimeout(() => mascot.classList.remove('dance'), 2500);
}

/* ================================
   Game Logic
=================================*/
function newGame() {
    secret = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    triesLeft = 15;
    triesVal.textContent = String(triesLeft);
    msg.textContent = `Jag valde ett nummer mellan ${minVal} och ${maxVal}. Gissa!`;
    guessInput.value = '';
    guessInput.focus();
    // 🔄 Reset mascot image to default
    mascot.src = "img/g.jpg";
    ensureBGPlays();
}

function handleGuess() {
    if (secret === null) {
        msg.textContent = 'Klicka på Start (eller tryck på Enter) för att börja.';
        return;
    }
    if (triesLeft <= 0) {
        msg.textContent = `Inga försök kvar. Det var ${secret}. Tryck på Start för att spela igen.`;
        return;
    }

    const raw = guessInput.value.trim();
    const guess = Number(raw);

    if (!raw) {
        msg.textContent = 'Skriv ett nummer först.';
        guessInput.focus();
        return;
    }
    if (!Number.isInteger(guess)) {
        msg.textContent = 'Ange ett heltal.';
        guessInput.select();
        return;
    }
    if (guess < minVal || guess > maxVal) {
        msg.textContent = `Ange ett nummer mellan ${minVal} och ${maxVal}.`;
        guessInput.select();
        return;
    }

    triesLeft--;
    triesVal.textContent = String(triesLeft);

    if (guess === secret) {
        msg.textContent = `✔ Rätt! Det var ${secret}. Tryck på Start för en ny omgång.`;
        if (!isMuted) { duckBG(700); win.currentTime = 0; win.play().catch(() => { }); }
        // 🎉 Change the mascot image to the "win" image
        mascot.src = "img/win1.gif";
        danceMascot();   // <-- make the photo dance on win
        secret = null;   // end round
    } else if (guess < secret) {
        msg.textContent = `För lågt. Försök kvar: ${triesLeft}`;
        if (triesLeft === 0) youLose();
    } else {
        msg.textContent = `För högt. Försök kvar: ${triesLeft}`;
        if (triesLeft === 0) youLose();
    }

    guessInput.select();
}

function youLose() {
    msg.textContent = `✖ Inga försök kvar. Det var ${secret}. Tryck på Start för att spela igen.`;
    if (!isMuted) { duckBG(900); lose.currentTime = 0; lose.play().catch(() => { }); }
    mascot.src = "img/lose2.gif"; // 👈 show lose image
    secret = null;
}

/* ================================
   Events
=================================*/
startBtn.addEventListener('click', () => {
    userInteracted = true;
    newGame();
});

guessBtn.addEventListener('click', () => {
    userInteracted = true;
    handleGuess();
});

// Enter: Start if no game, otherwise Guess
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    userInteracted = true;
    if (secret === null) newGame(); else handleGuess();
});

// Arrow keys to adjust number quickly
guessInput.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    let val = Number(guessInput.value);
    if (!Number.isInteger(val)) val = minVal;
    if (e.key === 'ArrowUp') val++;
    if (e.key === 'ArrowDown') val--;
    if (val < minVal) val = minVal;
    if (val > maxVal) val = maxVal;
    guessInput.value = String(val);
    e.preventDefault();
});

// Mute/Unmute
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
    muteBtn.setAttribute('aria-pressed', String(!isMuted));
    if (isMuted) bg.pause(); else ensureBGPlays();
});

// Volume slider
volRange.addEventListener('input', () => {
    const v = parseFloat(volRange.value);
    setAllVolumes(v);
});

// Focus input on load
window.addEventListener('load', () => guessInput.focus());



