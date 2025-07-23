let score = 0;
let timeLeft = 60;
let interval;
let comboCount = 0;
let lastClickTime = 0;
let gamePaused = false;
let passiveScore = 0;

let leaderboardData = [];

window.addEventListener("DOMContentLoaded", () => {
  const timerEl = document.getElementById("timer");
  const list = document.getElementById("leaderboard-list");
  const leaderboardTitle = document.querySelector("h2");

  const userProgressEl = document.getElementById("user-progress");
  const opponentProgressEl = document.getElementById("opponent-progress");

  leaderboardTitle.style.display = "none";
  list.style.display = "none";

  function renderLeaderboard() {
    const sorted = [...leaderboardData].sort((a, b) => b.score - a.score);
    list.innerHTML = "";
    sorted.forEach(player => {
      const li = document.createElement("li");
      li.textContent = `${player.name}: ${player.score}`;
      list.appendChild(li);
    });
  }

  function updateProgressBars() {
    const totalScore = score + passiveScore;
    const userPercent = Math.min((totalScore / 400) * 100, 95);
    const opponentPercent = Math.min(userPercent + 5 + Math.random() * 3, 100);
    userProgressEl.style.width = `${userPercent}%`;
    opponentProgressEl.style.width = `${opponentPercent}%`;
  }

  function showPopup(text, positive = true) {
    const popup = document.createElement("div");
    popup.textContent = text;
    popup.className = "point-popup";
    popup.style.left = `${Math.random() < 0.5 ? 5 + Math.random() * 20 : 75 + Math.random() * 20}%`;
    popup.style.top = `${Math.random() * 60 + 10}%`;
    popup.style.color = positive ? "green" : "red";
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 4000);
  }

  function showInterruptivePopup() {
    gamePaused = true;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div style="position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
                  background: #fff; border: 2px solid #444; padding: 20px; z-index: 9999;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5); font-family: sans-serif; text-align: center;">
        <p>📢 Please accept our new cookie policy to continue.</p>
        <button id="accept-popup">Accept</button>
      </div>`;
    document.body.appendChild(wrapper);
    document.getElementById("accept-popup").addEventListener("click", () => {
      wrapper.remove();
      gamePaused = false;
    });
  }

  function spawnClickPopup() {
  const btn = document.createElement("button");
  btn.className = "popup-button"; // ⬅️ new class, no fade animation
  btn.textContent = Math.random() < 0.3 ? "Wrong Tap!" : "Tap Me!";
  const bad = btn.textContent === "Wrong Tap!";
  btn.style.left = `${Math.random() * 80 + 10}%`;
  btn.style.top = `${Math.random() * 50 + 20}%`;

  btn.addEventListener("click", () => {
    if (gamePaused) return;

    const now = Date.now();
    let pts = bad ? -Math.floor(Math.random() * 4 + 1) : 1;

    if (!bad && now - lastClickTime < 2000) {
      comboCount++;
      pts += comboCount;
      showPopup(`🔥 Combo x${comboCount}! +${pts}`, true);
    } else if (!bad) {
      comboCount = 0;
      showPopup("+1", true);
    } else {
      comboCount = 0;
      showPopup(`${pts}`, false);
    }

    lastClickTime = now;
    score += pts;
    updateProgressBars();
    btn.remove();
  });

  document.body.appendChild(btn);

  // Remove after 7 seconds
  setTimeout(() => {
    if (btn.parentNode) btn.remove();
  }, 3000);
}


  interval = setInterval(() => {
    if (gamePaused) return;

    timeLeft--;
    passiveScore += 0.3;
    updateProgressBars();

    if (Math.random() < 0.5) spawnClickPopup();
    if (timeLeft === 30) showInterruptivePopup();

    if (timeLeft <= 0) {
      clearInterval(interval);
      timerEl.textContent = "Time's up!";

      const topScore = score + Math.floor(Math.random() * 3) + 2;
      leaderboardData = [
        { name: "Player1", score: topScore },
        { name: "YOU", score: score },
        { name: "Player2", score: Math.floor(score * 0.9) },
        { name: "Player3", score: Math.floor(score * 0.7) }
      ];

      leaderboardTitle.style.display = "block";
      list.style.display = "block";
      renderLeaderboard();
    } else {
      timerEl.textContent = `Time left: ${timeLeft}s`;
    }
  }, 1000);

  updateProgressBars();
});
