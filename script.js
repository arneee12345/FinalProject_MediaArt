let score = 0;
let timeLeft = 60;
let interval;
let comboCount = 0;
let lastClickTime = 0;
let gamePaused = false;

let leaderboardData = [];

window.addEventListener("DOMContentLoaded", () => {
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const button = document.getElementById("click-button");
  const list = document.getElementById("leaderboard-list");
  const leaderboardTitle = document.querySelector("h2");

  // Hide leaderboard initially
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

  function showPopup(text, positive = true) {
    const popup = document.createElement("div");
    popup.textContent = text;
    popup.className = "point-popup";
    popup.style.left = `${Math.random() < 0.5 ? 5 + Math.random() * 20 : 75 + Math.random() * 20}%`;
    popup.style.top = `${Math.random() * 60 + 10}%`;
    popup.style.color = positive ? "green" : "red";
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
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

  button.addEventListener("click", () => {
    if (gamePaused) return;

    const now = Date.now();
    let pts = 1;

    if (now - lastClickTime < 1000) {
      comboCount++;
      pts += comboCount;
      showPopup(`🔥 Combo x${comboCount}! +${pts}`, true);
    } else {
      comboCount = 0;
      showPopup("+1", true);
    }

    lastClickTime = now;
    score += pts;
    scoreEl.textContent = score;
  });

  interval = setInterval(() => {
    if (gamePaused) return;

    timeLeft--;
    if (timeLeft === 30) showInterruptivePopup();

    if (timeLeft <= 0) {
      clearInterval(interval);
      button.disabled = true;
      timerEl.textContent = "Time's up!";

      // Generate leaderboard so user is almost #1
      const topScore = score + Math.floor(Math.random() * 3) + 2;
      leaderboardData = [
        { name: "Player1", score: topScore },
        { name: "YOU", score: score },
        { name: "Player2", score: Math.floor(score * 0.9) },
        { name: "Player3", score: Math.floor(score * 0.7) }
      ];

      // Show leaderboard
      leaderboardTitle.style.display = "block";
      list.style.display = "block";
      renderLeaderboard();
    } else {
      timerEl.textContent = `Time left: ${timeLeft}s`;
    }
  }, 1000);
});
