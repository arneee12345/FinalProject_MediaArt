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

  const popupTypes = [
    { label: "🔥 Boost!", value: () => Math.floor(Math.random() * 6) + 5 },
    { label: "💣 Trap!", value: () => -Math.floor(Math.random() * 5 + 1) },
    { label: "🎁 Bonus", value: () => Math.floor(Math.random() * 4 + 2) },
    { label: "🤯 Fake Bonus", value: () => -Math.floor(Math.random() * 3 + 1) },
    { label: "🧠 Focus Up", value: () => 0 },
    { label: "👀 Watch out!", value: () => 0 },
    { label: "💡 Hint?", value: () => Math.random() < 0.5 ? 2 : -2 },
    { label: "✨ Tap Me!", value: () => Math.random() < 0.7 ? Math.floor(Math.random() * 3 + 1) : 0 },
    { label: "🌀 Confuse", value: () => 0 },
    { label: "❓Random", value: () => Math.floor(Math.random() * 7) - 3 }
  ];

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
    const type = popupTypes[Math.floor(Math.random() * popupTypes.length)];
    const btn = document.createElement("button");
    btn.className = "popup-button";
    btn.textContent = type.label;

    let left = Math.random() * 80 + 10;
    let top = Math.random() * 50 + 20;
    btn.style.left = `${left}%`;
    btn.style.top = `${top}%`;

    // Random behaviors
    const behaviors = ["bounce", "jiggle", "spin", "dodge"];
    const chosen = new Set();
    const count = Math.floor(Math.random() * 3) + 1;
    while (chosen.size < count) {
      chosen.add(behaviors[Math.floor(Math.random() * behaviors.length)]);
    }
    chosen.forEach(b => btn.classList.add(b));

    if (chosen.has("dodge")) {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        if (distance < 50) {
          left = Math.max(5, Math.min(90, left + (Math.random() - 0.5) * 10));
          top = Math.max(10, Math.min(80, top + (Math.random() - 0.5) * 10));
          btn.style.left = `${left}%`;
          btn.style.top = `${top}%`;
        }
      });
    }

    btn.addEventListener("click", () => {
      if (gamePaused) return;

      const now = Date.now();
      let pts = type.value();
      let positive = pts >= 0;

      if (pts > 0 && now - lastClickTime < 2000) {
        comboCount++;
        pts += comboCount;
        showPopup(`🔥 Combo x${comboCount}! +${pts}`, true);
      } else if (pts > 0) {
        comboCount = 1;
        showPopup(`+${pts}`, true);
      } else if (pts < 0) {
        comboCount = 0;
        showPopup(`${pts}`, false);
      } else {
        comboCount = 0;
        showPopup(`🙃 Nothing happened`, true);
      }

      lastClickTime = now;
      score += pts;
      updateProgressBars();
      btn.remove();
    });

    document.body.appendChild(btn);

    setTimeout(() => {
      if (btn.parentNode) btn.remove();
    }, 7000);
  }

  interval = setInterval(() => {
    if (gamePaused) return;

    timeLeft--;
    passiveScore += 0.3;
    updateProgressBars();

    const popupAttempts = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < popupAttempts; i++) {
      if (Math.random() < 0.7) spawnClickPopup();
    }

    if (timeLeft === 30) showInterruptivePopup();

    if (timeLeft <= 0) {
      clearInterval(interval);
      timerEl.textContent = "Time's up!";
      document.querySelectorAll(".popup-button").forEach(btn => btn.remove());

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
