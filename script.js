// ===== ELEMENTS =====
const cakePage    = document.getElementById('cakePage');
const letterPage  = document.getElementById('letterPage');
const blowBtn     = document.getElementById('blowBtn');
const instruction = document.getElementById('instruction');
const flame       = document.getElementById('flame');
const candle      = document.getElementById('candle');
const heartLayer  = document.getElementById('heartLayer');
const musicBtn    = document.getElementById('musicBtn');

// =========================================================
// 🎵 MUSIC BOX "HAPPY BIRTHDAY" — Web Audio API
// Nggak perlu file mp3: melodi disintesis langsung oleh
// browser, loop selamanya jadi backsound web.
// =========================================================
let audioCtx     = null;
let masterGain   = null;
let loopTimer    = null;
let musicStarted = false;
let musicMuted   = false;

const NOTE_FREQ = {
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25,
    F5: 698.46, G5: 783.99
};

// [nada, durasi dalam beat] — melodi Happy Birthday versi music box
const MELODY = [
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2],
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2],
    ['G4',.75],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2],
    ['F5',.75],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',2],
    [null, 2]
];

const BEAT = 0.5;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = musicMuted ? 0 : 0.55;
    masterGain.connect(audioCtx.destination);
}

function playNote(freq, when, ring) {
    const osc  = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const g    = audioCtx.createGain();
    const g2   = audioCtx.createGain();

    osc.type  = 'triangle';
    osc.frequency.value = freq;
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    g2.gain.value = 0.12;

    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.2, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + ring);

    osc.connect(g);
    osc2.connect(g2);
    g2.connect(g);
    g.connect(masterGain);

    osc.start(when);   osc.stop(when + ring + 0.05);
    osc2.start(when);  osc2.stop(when + ring + 0.05);
}

function scheduleMelody() {
    if (!audioCtx) return;
    const start = audioCtx.currentTime + 0.15;
    let t = start;
    for (const [note, beats] of MELODY) {
        if (note) playNote(NOTE_FREQ[note], t, beats * BEAT + 0.9);
        t += beats * BEAT;
    }
    const totalSec = t - start;
    loopTimer = setTimeout(scheduleMelody, totalSec * 1000 - 250);
}

function updateMusicBtn() {
    musicBtn.textContent = musicMuted ? '🔇' : '🎵';
    musicBtn.classList.toggle('muted', musicMuted);
}

function startMusic() {
    if (musicStarted) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    musicStarted = true;
    scheduleMelody();
    musicBtn.classList.add('playing');
    updateMusicBtn();
}

function toggleMusic() {
    if (!musicStarted) {
        musicMuted = false;
        startMusic();
        return;
    }
    musicMuted = !musicMuted;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(musicMuted ? 0 : 0.55, now, 0.15);
    updateMusicBtn();
}

musicBtn.addEventListener('click', () => toggleMusic());

// Browser blokir autoplay audio tanpa interaksi user.
// => musik nyala otomatis di sentuhan/klik/tombol PERTAMA.
function autoStart() {
    if (!musicMuted) startMusic();
    window.removeEventListener('click', autoStart);
    window.removeEventListener('touchstart', autoStart);
    window.removeEventListener('keydown', autoStart);
}
window.addEventListener('click', autoStart);
window.addEventListener('touchstart', autoStart);
window.addEventListener('keydown', autoStart);

// ===== HATI MELAYANG (background) =====
function spawnHearts(count = 12) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.textContent = '♡';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 4 + 's';
            heart.style.animationDuration = (5 + Math.random() * 4) + 's';
            heart.style.fontSize = (14 + Math.random() * 16) + 'px';
            heartLayer.appendChild(heart);
            setTimeout(() => heart.remove(), 12000);
        }, i * 250);
    }
}
spawnHearts();
setInterval(() => spawnHearts(8), 10000);

// ===== CONFETTI =====
function burstConfetti(count = 60) {
    const shapes = ['50%', '2px', '30% 70% 70% 30% / 30% 30% 70% 70%'];
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.backgroundColor = `hsl(${Math.random() * 360}, 85%, 70%)`;
            c.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
            c.style.width  = (6 + Math.random() * 7) + 'px';
            c.style.height = (6 + Math.random() * 7) + 'px';
            c.style.animationDelay = Math.random() * 0.6 + 's';
            c.style.animationDuration = (2.5 + Math.random() * 2) + 's';
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 6000);
        }, i * 18);
    }
}

// ===== TIUP LILIN =====
let blown = false;
blowBtn.addEventListener('click', () => {
    if (blown) return;
    blown = true;

    flame.classList.add('blow');
    candle.classList.add('out');
    blowBtn.disabled = true;
    blowBtn.textContent = '✨ Yeay!';
    instruction.textContent = 'Make a wish, sayang... ♡';

    setTimeout(() => burstConfetti(60), 250);
    setTimeout(() => burstConfetti(40), 900);

    setTimeout(() => {
        cakePage.classList.add('leave');
        setTimeout(() => {
            cakePage.style.display = 'none';
            letterPage.classList.add('show');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 700);
    }, 2100);
});