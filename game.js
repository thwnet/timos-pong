// ============================================
// PONG SPIEL - JAVASCRIPT CODE (MIT LEVELS)
// ============================================

// Canvas holen
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const failOverlay = document.getElementById("failOverlay");
const failOverlayImg = failOverlay ? failOverlay.querySelector("img") : null;
const successOverlay = document.getElementById("successOverlay");
const successOverlayImg = successOverlay ? successOverlay.querySelector("img") : null;
const successOverlayText = successOverlay
  ? successOverlay.querySelector(".overlay-text")
  : null;

// ============================================
// SPIEL-EINSTELLUNGEN
// ============================================
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const DEFAULT_PADDLE_SPEED = 5;
const MIN_PADDLE_SPEED = 2;
const MAX_PADDLE_SPEED = 15;
const TARGET_MAX_PADDLE_SPEED = MAX_PADDLE_SPEED * 2;
const BALL_SIZE = 10;
const BALL_SPEED = 4; // Basisgeschwindigkeit der Bälle
const DEFAULT_BG_COLOR = "#001a4d";
const DEFAULT_OBJECT_COLOR = "#7fff66";
const BALL_COLOR_LIGHT = "#ffffff";
const BALL_COLOR_DARK = "#000000";
const PADDLE_COLOR_LIGHT = "#ffffff";
const PADDLE_COLOR_DARK = "#333333";
const FAIL_GIF_URLS = [
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXhmbTJobmI0aWVoazR0M3h6enNrdmVhNHdqM2k1YTJoMTRneWZiMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mFdnWF1RTI7fi/giphy.gif",
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGduM3NzZ3NiMXgyMnhiemV4ajB1ZjJtdWNhamN0MjI5ZnJtZ3dyeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LW6hZxaWkkWrK/giphy.gif",
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzU0N2d5ZmxzNHdmbWdqZ2g2aGxweW5zNGZnbGloMTZ6MmU3aDFmbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vOM8yfLQvZPe8/giphy.gif",
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnptNGc4Z3hkaW41dGNmZWNxNzh1ZWtianNpaDZsN2hnenhtNnE4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/73E4wQO3OUZPO/giphy.gif",
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGp2cDQ2ZmcyejExcmI5OWxwejZmMWJ0eXJxMzd2bGE1ZHF2NnczaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7ANdVTT5lH9Kw/giphy.gif",
];
const SUCCESS_GIF_LEVEL4 =
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHc1MXIzYzVncXoxbTI3ZHlrejdhZGh5MXB0M285cWkyYnliNHRjMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SJtptYpvo8PU1XQ7DX/giphy.gif";
const SUCCESS_GIF_LEVEL6 =
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTN6ZXJpNHZ4enZiYWdpaWxpN28yaHBoM29wdHZ4YzNlYnkxaWY5ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/G3uXJGdnIEQ9sFcxTR/giphy.gif";
const BG_STORAGE_KEY = "pongPlaygroundBgColor";
const OBJECT_COLOR_STORAGE_KEY = "pongObjectColor";
const PADDLE_SPEED_STORAGE_KEY = "pongPaddleSpeed";

const HITS_PER_LEVEL = 5; // Alle 5 Treffer -> nächstes Level
const SPEED_INCREASE_PER_LEVEL = 0.5; // Neue Bälle werden pro Level schneller

// ============================================
// SPIELZUSTAND
// ============================================
let paddleSpeedSetting = loadPaddleSpeedSetting();
let paddleSpeed = computeActualPaddleSpeed(paddleSpeedSetting);

let gameState = {
  paused: true,
  hits: 0,
  level: 1, // Start-Level
  backgroundColor: DEFAULT_BG_COLOR,
  ballColor: DEFAULT_OBJECT_COLOR,
  paddleColor: DEFAULT_OBJECT_COLOR,
  customObjectColor: DEFAULT_OBJECT_COLOR,
  reachedLevel4: false,
  reachedLevel6: false,

  paddle: {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  },

  // Jetzt mehrere Bälle statt nur einem
  balls: [], // Array von Ball-Objekten
};

// ============================================
// HINTERGRUNDFARBE
// ============================================
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isValidHexColor(color) {
  return typeof color === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);
}

function loadBackgroundColor() {
  const stored = localStorage.getItem(BG_STORAGE_KEY);
  if (stored && isValidHexColor(stored)) {
    return stored;
  }
  return DEFAULT_BG_COLOR;
}

function saveBackgroundColor(color) {
  localStorage.setItem(BG_STORAGE_KEY, color);
}

function loadObjectColor() {
  const stored = localStorage.getItem(OBJECT_COLOR_STORAGE_KEY);
  if (!stored) {
    return DEFAULT_OBJECT_COLOR;
  }
  if (isValidHexColor(stored)) {
    return stored;
  }
  return DEFAULT_OBJECT_COLOR;
}

function saveObjectColor(color) {
  if (isValidHexColor(color)) {
    localStorage.setItem(OBJECT_COLOR_STORAGE_KEY, color);
  } else {
    localStorage.removeItem(OBJECT_COLOR_STORAGE_KEY);
  }
}

function updateObjectColors() {
  if (isValidHexColor(gameState.customObjectColor)) {
    gameState.ballColor = gameState.customObjectColor;
    gameState.paddleColor = gameState.customObjectColor;
  } else {
    const useLightColor = shouldUseLightBallColor(gameState.backgroundColor);
    gameState.ballColor = useLightColor ? BALL_COLOR_LIGHT : BALL_COLOR_DARK;
    gameState.paddleColor = useLightColor ? PADDLE_COLOR_LIGHT : PADDLE_COLOR_DARK;
  }
}

function setCustomObjectColor(color) {
  if (isValidHexColor(color)) {
    gameState.customObjectColor = color;
    saveObjectColor(color);
  } else {
    gameState.customObjectColor = null;
    saveObjectColor(null);
  }
  updateObjectColors();
  draw();
}

function computeActualPaddleSpeed(value) {
  const setting = clamp(value, MIN_PADDLE_SPEED, MAX_PADDLE_SPEED);
  if (setting <= MIN_PADDLE_SPEED) {
    return MIN_PADDLE_SPEED;
  }
  const ratio =
    (setting - MIN_PADDLE_SPEED) / (MAX_PADDLE_SPEED - MIN_PADDLE_SPEED);
  return (
    MIN_PADDLE_SPEED +
    ratio * (TARGET_MAX_PADDLE_SPEED - MIN_PADDLE_SPEED)
  );
}

function loadPaddleSpeedSetting() {
  const stored = localStorage.getItem(PADDLE_SPEED_STORAGE_KEY);
  if (!stored) return DEFAULT_PADDLE_SPEED;
  const value = parseInt(stored, 10);
  if (Number.isNaN(value)) return DEFAULT_PADDLE_SPEED;
  return clamp(value, MIN_PADDLE_SPEED, MAX_PADDLE_SPEED);
}

function savePaddleSpeedSetting(value) {
  localStorage.setItem(PADDLE_SPEED_STORAGE_KEY, String(value));
}

function setPaddleSpeed(value, { persist = true } = {}) {
  const numericValue = clamp(
    Number(value) || DEFAULT_PADDLE_SPEED,
    MIN_PADDLE_SPEED,
    MAX_PADDLE_SPEED
  );
  paddleSpeedSetting = numericValue;
  paddleSpeed = computeActualPaddleSpeed(paddleSpeedSetting);
  updatePaddleSpeedUI();
  if (persist) {
    savePaddleSpeedSetting(numericValue);
  }
}

function applyBackgroundColor(color, { persist = true } = {}) {
  const finalColor = isValidHexColor(color) ? color : DEFAULT_BG_COLOR;
  gameState.backgroundColor = finalColor;
  document.documentElement.style.setProperty("--playground-bg", finalColor);
  updateObjectColors();
  if (persist) {
    saveBackgroundColor(finalColor);
  }
}

function getRandomFailGif() {
  if (!FAIL_GIF_URLS.length) return null;
  const index = Math.floor(Math.random() * FAIL_GIF_URLS.length);
  return FAIL_GIF_URLS[index];
}

function showFailOverlay() {
  if (failOverlayImg) {
    const randomGif = getRandomFailGif();
    if (randomGif) {
      failOverlayImg.src = randomGif;
    }
  }
  if (failOverlay) {
    failOverlay.classList.add("visible");
  }
}

function hideFailOverlay() {
  if (failOverlay) {
    failOverlay.classList.remove("visible");
  }
}

function clearFailOverlayTimeout() {
  if (failOverlayTimeoutId) {
    clearTimeout(failOverlayTimeoutId);
    failOverlayTimeoutId = null;
  }
  hideFailOverlay();
}

function showSuccessOverlay(
  message = "yeah your so good!",
  gifUrl = SUCCESS_GIF_LEVEL4
) {
  if (successOverlayImg) {
    successOverlayImg.src = gifUrl;
    setSuccessOverlayImageSize();
  }
  if (successOverlayText) {
    successOverlayText.textContent = message;
  }
  if (successOverlay) {
    successOverlay.classList.add("visible");
  }
}

function setSuccessOverlayImageSize() {
  if (!successOverlayImg || !canvas) return;
  const referenceWidth = canvas.clientWidth || canvas.width || 640;
  const targetWidth = referenceWidth * 0.5; // quarter area => half width/height
  successOverlayImg.style.width = `${targetWidth}px`;
  successOverlayImg.style.height = "auto";
}

function hideSuccessOverlay() {
  if (successOverlay) {
    successOverlay.classList.remove("visible");
  }
}

function clearSuccessOverlayTimeout() {
  if (successOverlayTimeoutId) {
    clearTimeout(successOverlayTimeoutId);
    successOverlayTimeoutId = null;
  }
  hideSuccessOverlay();
}
function hexToRgb(hex) {
  if (!isValidHexColor(hex)) return null;
  let value = hex.replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function getRelativeBrightness(color) {
  const rgb = hexToRgb(color);
  if (!rgb) return null;
  const { r, g, b } = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function shouldUseLightBallColor(color) {
  const brightness = getRelativeBrightness(color);
  if (brightness === null) return false;
  return brightness < 0.4;
}


gameState.customObjectColor = loadObjectColor();
applyBackgroundColor(loadBackgroundColor(), { persist: false });

// Tastatur-Zustand
const keys = {};

// Touch-Zustand
let touchActive = false;
let touchY = 0;

// Arrow button states
let arrowUpPressed = false;
let arrowDownPressed = false;
let failOverlayTimeoutId = null;
let successOverlayTimeoutId = null;

// ============================================
// TASTATUR-EVENTS
// ============================================
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  keys[key] = true;

  // Pfeiltasten auch speichern
  if (e.key === "ArrowUp") {
    keys["arrowup"] = true;
  }
  if (e.key === "ArrowDown") {
    keys["arrowdown"] = true;
  }

  // Leertaste = Pause an/aus
  if (e.key === " ") {
    e.preventDefault();
    gameState.paused = !gameState.paused;
    if (!gameState.paused) {
      gameLoop();
    }
  }

  // R = komplettes Spiel zurücksetzen
  if (key === "r") {
    resetGame();
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  keys[key] = false;

  // Pfeiltasten auch zurücksetzen
  if (e.key === "ArrowUp") {
    keys["arrowup"] = false;
  }
  if (e.key === "ArrowDown") {
    keys["arrowdown"] = false;
  }
});

// ============================================
// TOUCH-EVENTS
// ============================================
function getTouchY(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0] || e.changedTouches[0];
  return touch.clientY - rect.top;
}

// Touch start: Paddle position setzen oder Pause umschalten
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  touchActive = true;
  touchY = getTouchY(e);
  
  // Wenn pausiert: Spiel starten/fortsetzen
  if (gameState.paused) {
    gameState.paused = false;
    gameLoop();
  } else {
    // Paddle direkt zur Touch-Position bewegen
    movePaddleToY(touchY);
  }
});

// Touch move: Paddle folgt dem Finger
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (touchActive) {
    touchY = getTouchY(e);
    movePaddleToY(touchY);
  }
});

// Doppel-Tap für Reset (optional, wird auch über Button gemacht)
let lastTapTime = 0;

// Touch end: Touch beenden + Doppel-Tap erkennen
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  touchActive = false;
  
  // Doppel-Tap Erkennung
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;
  if (tapLength < 300 && tapLength > 0) {
    // Doppel-Tap erkannt -> Reset
    resetGame();
  }
  lastTapTime = currentTime;
});

canvas.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  touchActive = false;
});

// ============================================
// SCHLÄGER BEWEGEN
// ============================================
function updatePaddle() {
  // Tastatur-Steuerung (W/S oder Pfeiltasten)
  if ((keys["w"] || keys["arrowup"]) && gameState.paddle.y > 0) {
    gameState.paddle.y -= paddleSpeed;
  }

  if ((keys["s"] || keys["arrowdown"]) && gameState.paddle.y < canvas.height - PADDLE_HEIGHT) {
    gameState.paddle.y += paddleSpeed;
  }

  // Touch-Pfeil-Buttons
  if (arrowUpPressed && gameState.paddle.y > 0) {
    gameState.paddle.y -= paddleSpeed;
  }

  if (arrowDownPressed && gameState.paddle.y < canvas.height - PADDLE_HEIGHT) {
    gameState.paddle.y += paddleSpeed;
  }
}

// Paddle direkt zu einer Y-Position bewegen (für Touch)
function movePaddleToY(y) {
  // Paddle-Mitte zur Touch-Position
  const targetY = y - PADDLE_HEIGHT / 2;
  
  // Begrenzen auf Spielfeld
  gameState.paddle.y = Math.max(
    0,
    Math.min(canvas.height - PADDLE_HEIGHT, targetY)
  );
}

// ============================================
// BALL-ERZEUGUNG UND -RESET
// ============================================

// Einen neuen Ball in der Mitte erzeugen
function createBall() {
  // Basisgeschwindigkeit steigt mit dem Level
  const baseSpeed =
    BALL_SPEED + (gameState.level - 1) * SPEED_INCREASE_PER_LEVEL;

  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: baseSpeed, // Startet nach rechts
    dy: (Math.random() * 2 - 1) * baseSpeed, // Zufällige Richtung nach oben/unten
  };
}

// Alle Bälle neu erzeugen (z.B. bei Reset)
function initBalls(count) {
  gameState.balls = [];
  for (let i = 0; i < count; i++) {
    gameState.balls.push(createBall());
  }
}

// ============================================
// LEVEL-LOGIK
// ============================================

// Wird aufgerufen, sobald genug Treffer für ein neues Level erreicht sind
function levelUp(newLevel) {
  gameState.level = newLevel;

  // Einen neuen Ball hinzufügen
  gameState.balls.push(createBall());

  // Bestehende Bälle minimal schneller machen
  gameState.balls.forEach((ball) => {
    ball.dx *= 1.05;
    ball.dy *= 1.05;
  });

  handleLevelSuccess(newLevel);
  updateHud();
}

function handleLevelSuccess(level) {
  if (level >= 4 && !gameState.reachedLevel4) {
    gameState.reachedLevel4 = true;
    triggerSuccessOverlay({
      message: "yeah your so good!",
      gifUrl: SUCCESS_GIF_LEVEL4,
    });
  } else if (level >= 6 && !gameState.reachedLevel6) {
    gameState.reachedLevel6 = true;
    triggerSuccessOverlay({
      message: "Level 6! Unstoppable!",
      gifUrl: SUCCESS_GIF_LEVEL6,
    });
  }
}

function triggerSuccessOverlay({
  message = "Great job!",
  gifUrl = SUCCESS_GIF_LEVEL4,
  duration = 1000,
} = {}) {
  clearSuccessOverlayTimeout();
  showSuccessOverlay(message, gifUrl);
  successOverlayTimeoutId = setTimeout(() => {
    hideSuccessOverlay();
    successOverlayTimeoutId = null;
  }, duration);
}

// ============================================
// BÄLLE BEWEGEN UND KOLLISIONEN PRÜFEN
// ============================================
function updateBalls() {
  for (const ball of gameState.balls) {
    // Bewegung
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Kollision mit oberer/unterer Wand
    if (ball.y <= 0 || ball.y >= canvas.height - BALL_SIZE) {
      ball.dy = -ball.dy;
    }

    // Kollision mit rechter Wand
    if (ball.x >= canvas.width - BALL_SIZE) {
      ball.dx = -ball.dx;
    }

    // Kollision mit Schläger
    if (
      ball.x <= gameState.paddle.x + PADDLE_WIDTH &&
      ball.x >= gameState.paddle.x &&
      ball.y + BALL_SIZE >= gameState.paddle.y &&
      ball.y <= gameState.paddle.y + PADDLE_HEIGHT
    ) {
      // Ball prallt nach rechts ab
      ball.dx = Math.abs(ball.dx);

      // Abprallwinkel abhängig von der Trefferposition
      const hitPosition = (ball.y - gameState.paddle.y) / PADDLE_HEIGHT;
      const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      const newSpeed = currentSpeed; // gleiche Geschwindigkeit beibehalten
      ball.dy = (hitPosition - 0.5) * newSpeed * 2;

      // Treffer zählen
      gameState.hits++;

      // Level berechnen: alle HITS_PER_LEVEL gibt es ein neues Level
      const newLevel = 1 + Math.floor(gameState.hits / HITS_PER_LEVEL);
      if (newLevel > gameState.level) {
        levelUp(newLevel);
      }

      updateHud();
    }

    // Verlust: Ball verlässt linke Seite
    if (ball.x < 0) {
      // Score speichern bevor das Spiel zurückgesetzt wird
      saveScore(gameState.hits, gameState.level);
      // Overlay zeigen und Spiel nach Verzögerung zurücksetzen
      handlePlayerFail();
      // Wichtig: Abbrechen, damit wir nicht weiter über alte Bälle iterieren
      return;
    }
  }
}

function handlePlayerFail() {
  if (failOverlayTimeoutId) {
    return;
  }
  gameState.paused = true;
  showFailOverlay();
  draw();
  failOverlayTimeoutId = setTimeout(() => {
    hideFailOverlay();
    failOverlayTimeoutId = null;
    resetGame();
  }, 2000);
}

// ============================================
// BESTENLISTE / SCORE TRACKING
// ============================================

// Top 3 Scores aus localStorage laden
function loadTopScores() {
  const scoresJson = localStorage.getItem("pongTopScores");
  if (scoresJson) {
    return JSON.parse(scoresJson);
  }
  return [];
}

// Top 3 Scores in localStorage speichern
function saveTopScores(scores) {
  localStorage.setItem("pongTopScores", JSON.stringify(scores));
}

// Neuen Score hinzufügen und Top 3 behalten
function saveScore(hits, level) {
  if (hits === 0) return; // Score von 0 nicht speichern
  
  const scores = loadTopScores();
  scores.push({ hits, level });
  
  // Nach Treffern sortieren (höchste zuerst), dann Top 3 behalten
  scores.sort((a, b) => b.hits - a.hits);
  const top3 = scores.slice(0, 3);
  
  saveTopScores(top3);
  updateResultsTable();
}

// Ergebnisse-Tabelle aktualisieren
function updateResultsTable() {
  const scores = loadTopScores();
  
  for (let i = 0; i < 3; i++) {
    const scoreEl = document.getElementById(`score${i + 1}`);
    const levelEl = document.getElementById(`level${i + 1}`);
    
    if (scores[i]) {
      if (scoreEl) scoreEl.textContent = scores[i].hits;
      if (levelEl) levelEl.textContent = scores[i].level;
    } else {
      if (scoreEl) scoreEl.textContent = "-";
      if (levelEl) levelEl.textContent = "-";
    }
  }
}

// ============================================
// SPIEL-RESET
// ============================================
function resetGame() {
  clearFailOverlayTimeout();
  clearSuccessOverlayTimeout();
  gameState.hits = 0;
  gameState.level = 1;
  gameState.paddle.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  gameState.reachedLevel4 = false;
  gameState.reachedLevel6 = false;

  initBalls(1); // wieder mit einem Ball starten
  updateHud();
  draw(); // einmal neu zeichnen
}

// ============================================
// HUD (Treffer & Level) aktualisieren
// ============================================
function updateHud() {
  const scoreEl = document.getElementById("scoreL");
  if (scoreEl) {
    scoreEl.textContent = gameState.hits;
  }
  const levelEl = document.getElementById("level");
  if (levelEl) {
    levelEl.textContent = gameState.level;
  }
  // Pause-Button Text aktualisieren (beide Buttons)
  const pauseBtns = document.querySelectorAll("#pauseBtn, #pauseBtnDesktop");
  pauseBtns.forEach(btn => {
    if (btn) btn.textContent = gameState.paused ? "Start" : "Pause";
  });
}

// ============================================
// ZEICHNEN
// ============================================
function draw() {
  // Hintergrund
  ctx.fillStyle = gameState.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Schläger
  ctx.fillStyle = gameState.paddleColor || PADDLE_COLOR_DARK;
  ctx.fillRect(
    gameState.paddle.x,
    gameState.paddle.y,
    PADDLE_WIDTH,
    PADDLE_HEIGHT
  );

  // Alle Bälle
  ctx.fillStyle = gameState.ballColor || BALL_COLOR_DARK;
  for (const ball of gameState.balls) {
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
  }

  // Pause-Text
  if (gameState.paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("PAUSE", canvas.width / 2, canvas.height / 2);
  }
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
  if (!gameState.paused) {
    updatePaddle();
    updateBalls();
  }

  draw();

  if (!gameState.paused) {
    requestAnimationFrame(gameLoop);
  }
}

// ============================================
// BUTTON-EVENTS (Touch-freundlich)
// ============================================
function setupButton(button, isPauseBtn) {
  if (!button) return;
  
  if (isPauseBtn) {
    button.addEventListener("click", () => {
      gameState.paused = !gameState.paused;
      if (!gameState.paused) {
        gameLoop();
      }
      // Beide Pause-Buttons aktualisieren
      const pauseBtns = document.querySelectorAll("#pauseBtn, #pauseBtnDesktop");
      pauseBtns.forEach(btn => {
        if (btn) btn.textContent = gameState.paused ? "Start" : "Pause";
      });
    });
  } else {
    button.addEventListener("click", () => {
      resetGame();
    });
  }
}

// Mobile buttons
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
setupButton(pauseBtn, true);
setupButton(resetBtn, false);

// Desktop buttons
const pauseBtnDesktop = document.getElementById("pauseBtnDesktop");
const resetBtnDesktop = document.getElementById("resetBtnDesktop");
setupButton(pauseBtnDesktop, true);
setupButton(resetBtnDesktop, false);

// ============================================
// HINTERGRUND-FARBAUSWAHL
// ============================================
function setupBackgroundColorPicker(picker) {
  if (!picker) return;
  picker.value = gameState.backgroundColor;
  picker.addEventListener("input", (e) => {
    applyBackgroundColor(e.target.value);
    draw();
  });
}

function setupObjectColorPicker(picker) {
  if (!picker) return;
  const initialColor =
    gameState.customObjectColor && isValidHexColor(gameState.customObjectColor)
      ? gameState.customObjectColor
      : gameState.ballColor;
  picker.value = initialColor;
  picker.addEventListener("input", (e) => {
    const color = e.target.value;
    if (isValidHexColor(color)) {
      setCustomObjectColor(color);
    }
  });
}

function setupPaddleSpeedControl(slider, valueDisplay) {
  updatePaddleSpeedUI();
  if (slider) {
    slider.value = paddleSpeedSetting;
    slider.addEventListener("input", (e) => {
      setPaddleSpeed(e.target.value);
    });
  }
  if (valueDisplay) {
    valueDisplay.textContent = paddleSpeedSetting;
  }
}

function updatePaddleSpeedUI() {
  if (paddleSpeedSlider) {
    paddleSpeedSlider.value = paddleSpeedSetting;
  }
  if (paddleSpeedValueEl) {
    paddleSpeedValueEl.textContent = paddleSpeedSetting;
  }
}

const bgColorPicker = document.getElementById("bgColorPicker");
setupBackgroundColorPicker(bgColorPicker);
const objectColorPicker = document.getElementById("objectColorPicker");
setupObjectColorPicker(objectColorPicker);
const paddleSpeedSlider = document.getElementById("paddleSpeedRange");
const paddleSpeedValueEl = document.getElementById("paddleSpeedValue");
setupPaddleSpeedControl(paddleSpeedSlider, paddleSpeedValueEl);

// ============================================
// PFEIL-BUTTON-EVENTS (Touch-Steuerung)
// ============================================
const arrowUpBtn = document.getElementById("arrowUp");
const arrowDownBtn = document.getElementById("arrowDown");

// Up Arrow Button
if (arrowUpBtn) {
  arrowUpBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    arrowUpPressed = true;
  });
  
  arrowUpBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    arrowUpPressed = false;
  });
  
  arrowUpBtn.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    arrowUpPressed = false;
  });
  
  // Auch für Maus-Klicks (falls auf Desktop getestet wird)
  arrowUpBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    arrowUpPressed = true;
  });
  
  arrowUpBtn.addEventListener("mouseup", (e) => {
    e.preventDefault();
    arrowUpPressed = false;
  });
  
  arrowUpBtn.addEventListener("mouseleave", (e) => {
    e.preventDefault();
    arrowUpPressed = false;
  });
}

// Down Arrow Button
if (arrowDownBtn) {
  arrowDownBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    arrowDownPressed = true;
  });
  
  arrowDownBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    arrowDownPressed = false;
  });
  
  arrowDownBtn.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    arrowDownPressed = false;
  });
  
  // Auch für Maus-Klicks (falls auf Desktop getestet wird)
  arrowDownBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    arrowDownPressed = true;
  });
  
  arrowDownBtn.addEventListener("mouseup", (e) => {
    e.preventDefault();
    arrowDownPressed = false;
  });
  
  arrowDownBtn.addEventListener("mouseleave", (e) => {
    e.preventDefault();
    arrowDownPressed = false;
  });
}

// ============================================
// CANVAS RESPONSIVE FÜR IPHONE (PORTRAIT)
// ============================================
function adjustCanvasForMobile() {
  const isMobile = window.innerWidth <= 480;
  if (isMobile) {
    // Canvas skalieren - 90% der Browser-Breite, 60% der Höhe
    const canvasWidth = window.innerWidth * 0.9; // 90% der Browser-Breite
    const canvasHeight = window.innerHeight * 0.6; // 60% der Browser-Höhe
    const scaleX = canvasWidth / canvas.width;
    const scaleY = canvasHeight / canvas.height;
    const scale = Math.min(scaleX, scaleY); // Kleinere Skalierung verwenden um Seitenverhältnis zu behalten
    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
  } else {
    // Original-Größe für iPad/Desktop
    canvas.style.width = '';
    canvas.style.height = '';
  }
}

// Beim Laden und bei Größenänderung anpassen
adjustCanvasForMobile();
window.addEventListener('resize', adjustCanvasForMobile);
window.addEventListener('orientationchange', () => {
  setTimeout(adjustCanvasForMobile, 100); // Kurze Verzögerung für Orientation Change
});

// ============================================
// SPIEL STARTEN (ANFANGSZUSTAND)
// ============================================
initBalls(1); // Mit einem Ball starten
updateHud(); // Treffer = 0, Level = 1 anzeigen
updateResultsTable(); // Bestenliste laden und anzeigen
draw(); // Erstes Bild zeichnen
