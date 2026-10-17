const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================= SOM =================
const jumpSound = new Audio("voar.flac");
const scoreSound = new Audio("score.mp3");
const hitSound = new Audio("hit.mp3");

// 🎵 MÚSICA PRINCIPAL
const bgMusic = new Audio("music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

// ================= PAUSE =================
let isPaused = false;
const pauseImg = new Image();
pauseImg.src = "bird1.png"; // coloque sua imagem aqui

const pauseButton = {
    x: 10,   // canto esquerdo (garantido visível)
    y: 10,
    size: 40
};

// ================= RECORD =================
let bestScore = localStorage.getItem("flappyBestScore");
bestScore = bestScore ? parseInt(bestScore) : 0;

// ================= CONFIG =================
let gameState = "menu";
let isFullscreen = false;

let bird = {
    x: 60,
    y: 300,
    size: 30,
    vel: 0,
    gravity: 0.3,
    jump: -7
};

let pipes = [];
let pipeGap = 150;
let pipeWidth = 60;
let pipeSpeed = 2;
let score = 0;

// ================= FULLSCREEN =================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(() => {});
        isFullscreen = true;
    } else {
        document.exitFullscreen();
        isFullscreen = false;
    }
}

// ================= RESET =================
function resetGame() {
    bird.y = 300;
    bird.vel = 0;
    pipes = [];
    score = 0;
    isPaused = false;
    gameState = "playing";

    bgMusic.currentTime = 0;
    bgMusic.play();
}

// ================= CANOS =================
function createPipe() {
    let top = Math.random() * 250 + 50;
    pipes.push({
        x: canvas.width,
        top,
        bottom: top + pipeGap,
        counted: false
    });
}

setInterval(() => {
    if (gameState === "playing" && !isPaused) createPipe();
}, 1800);

// ================= DESENHO =================
function drawBackground() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.size, bird.size);
}

function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(p => {
        ctx.fillRect(p.x, 0, pipeWidth, p.top);
        ctx.fillRect(p.x, p.bottom, pipeWidth, canvas.height);
    });
}

function drawPauseButton() {
    ctx.drawImage(
        pauseImg,
        pauseButton.x,
        pauseButton.y,
        pauseButton.size,
        pauseButton.size
    );
}

// ================= UPDATE =================
function updateBird() {
    bird.vel += bird.gravity;
    bird.y += bird.vel;

    if (bird.y + bird.size > canvas.height) endGame();
}

function endGame() {
    hitSound.play();

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("flappyBestScore", bestScore);
    }

    bgMusic.pause();
    gameState = "gameover";
}

function updatePipes() {
    pipes.forEach(p => {
        p.x -= pipeSpeed;

        if (!p.counted && p.x + pipeWidth < bird.x) {
            score++;
            p.counted = true;
            scoreSound.play();
        }

        if (
            bird.x < p.x + pipeWidth &&
            bird.x + bird.size > p.x &&
            (bird.y < p.top || bird.y + bird.size > p.bottom)
        ) {
            endGame();
        }
    });

    pipes = pipes.filter(p => p.x > -pipeWidth);
}

// ================= TELAS =================
function drawMenu() {
    ctx.fillStyle = "#000";
    ctx.font = "36px Arial";
    ctx.fillText("FLAPPY BIRD", 60, 200);

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(100, 300, 160, 50);
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText("INICIAR", 135, 335);
}

function drawGameOver() {
    ctx.fillStyle = "#000";
    ctx.font = "32px Arial";
    ctx.fillText("GAME OVER", 80, 240);

    ctx.font = "22px Arial";
    ctx.fillText("Pontos: " + score, 120, 290);
    ctx.fillText("Recorde: " + bestScore, 110, 320);

    ctx.fillStyle = "red";
    ctx.fillRect(110, 350, 140, 45);
    ctx.fillStyle = "#fff";
    ctx.fillText("RESTART", 125, 382);
}

// ================= LOOP =================
function loop() {
    drawBackground();

    if (gameState === "menu") drawMenu();

    if (gameState === "playing") {
        drawPipes();
        drawBird();
        drawPauseButton();

        if (!isPaused) {
            updateBird();
            updatePipes();
        }

        ctx.fillStyle = "#000";
        ctx.font = "24px Arial";
        ctx.fillText("Score: " + score, 10, 30);
    }

    if (gameState === "gameover") drawGameOver();

    requestAnimationFrame(loop);
}

loop();

// ================= CONTROLE =================
canvas.addEventListener("click", e => {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // PAUSE
    if (
        gameState === "playing" &&
        x > pauseButton.x &&
        x < pauseButton.x + pauseButton.size &&
        y > pauseButton.y &&
        y < pauseButton.y + pauseButton.size
    ) {
        isPaused = !isPaused;
        if (isPaused) bgMusic.pause();
        else bgMusic.play();
        return;
    }

    if (gameState === "menu") {
        if (x > 100 && x < 260 && y > 300 && y < 350) resetGame();
        return;
    }

    if (gameState === "playing" && !isPaused) {
        bird.vel = bird.jump;
        jumpSound.play();
        return;
    }

    if (gameState === "gameover") {
        if (x > 110 && x < 250 && y > 350 && y < 395) resetGame();
    }
});