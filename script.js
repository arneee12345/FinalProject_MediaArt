let score = 0;
let timeLeft = 60;
let interval;
let comboCount = 0;
let lastClickTime = 0;
let gamePaused = false;
let passiveScore = 0;
let goalBtnLastClick = 0;
let userName = "YOU";
let userAge = "-";
let leaderboardData = [];
let goalAnimationInterval = null;
let realClicks = 0;
let fakeClicks = 0;


window.addEventListener("DOMContentLoaded", () => {
  const timerEl = document.getElementById("timer");
  const list = document.getElementById("leaderboard-list");
  const leaderboardTitle = document.querySelector("h2");
  const userProgressEl = document.getElementById("user-progress");
  const opponentProgressEl = document.getElementById("opponent-progress");

  leaderboardTitle.style.display = "none";
  list.style.display = "none";

  const introOverlay = document.createElement("div");
  introOverlay.style = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(255, 255, 255, 0.95);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 9999;
    text-align: center;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    padding: 20px;
  `;
  introOverlay.innerHTML = `
    <h2>🎓 Welcome to the Game of Focus™</h2>
    <p>Just keep clicking this emoji: <strong>💡</strong> to earn real points.</p>
    <p>Ignore the distractions. Stay focused.</p>
    <br>
    <label>What's your name? <input id="user-name" type="text" /></label><br><br>
    <label>Age? <input id="user-age" type="number" /></label><br><br>
    <button id="start-game">Start</button>
  `;
  document.body.appendChild(introOverlay);

  document.getElementById("start-game").addEventListener("click", () => {
    const nameInput = document.getElementById("user-name").value.trim();
    const ageInput = document.getElementById("user-age").value.trim();
    if (nameInput) userName = nameInput;
    if (ageInput) userAge = ageInput;
    introOverlay.remove();
    startGame();
  });

  function startGame(skipIntro = false) {
    score = 0;
    timeLeft = 60;
    comboCount = 0;
    lastClickTime = 0;
    passiveScore = 0;
    goalBtnLastClick = 0;
    gamePaused = false;
    clearInterval(interval);
    clearInterval(goalAnimationInterval);

    document.querySelectorAll(".popup-button").forEach(btn => btn.remove());
    document.getElementById("true-goal-button")?.remove();
    document.getElementById("play-again")?.remove();
    leaderboardTitle.style.display = "none";
    list.style.display = "none";

    const popupTypes = [
      { label: "🚨 CAREFUL!", value: () => 0 },
      { label: "🎁 FREE bonus!", value: () => 0 },
      { label: "🔥 DOUBLE SCORE", value: () => 0 },
      { label: "✨ Win BIG!", value: () => 0 },
      { label: "💥 CLICK ME!", value: () => 0 },
      { label: "📈 LVL UP!", value: () => 0 },
      { label: "🔔 1 new message!", value: () => 0 },
      { label: "💡 Hint!", value: () => 0 },
      { label: "🎉 Confettiii!", value: () => 0 }
    ];
    
    const endingMessages = {
      focused: [
        "You won... but missed all the sparkles.",
        "Congrats! Following instrucitons... boring.."
      ],
      distracted: [
        "{points} points.. but look at all that fun!!",
        "Clicked a lot but wrong.. A+ in attention deficit!"
      ],
      balanced: [
        "Perfect mediocrity achieved.",
        "Some focus, some fun... classic human behavior."
      ]
    };

    function playSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }

    function playClickSound() {
    const audio = document.getElementById("sfx-click");
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }

    function playRandomSound() {
    const sounds = ["sfx-coin", "sfx-confetti", "sfx-fireworks", "sfx-sparkle", "sfx-wow"];
    const random = sounds[Math.floor(Math.random() * sounds.length)];
    playSound(random);
  }

    function renderLeaderboard() {
      const fakeWin = Math.random() < 0.5;
      const topScore = score + (fakeWin ? 0 : Math.floor(Math.random() * 10) + 5);
      leaderboardData = [
        { name: "Player1", score: topScore },
        { name: userName, score: score },
        { name: "Player2", score: Math.floor(score * 0.9) },
        { name: "Player3", score: Math.floor(score * 0.7) }
      ];
      list.innerHTML = "";
      leaderboardData.sort((a, b) => b.score - a.score).forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name}: ${player.score}`;
        list.appendChild(li);
      });
    }


    function updateProgressBars() {
      const maxScore = 50;
      const totalScore = score + passiveScore;
      const userPercent = Math.min((totalScore / maxScore) * 100, 95);
      const opponentPercent = Math.min(userPercent + 5 + Math.random() * 4, 100);
      userProgressEl.style.width = `${userPercent}%`;
      opponentProgressEl.style.width = `${opponentPercent}%`;
    }

    function showPopup(text, positive = true, isReal = false) {
      const popup = document.createElement("div");
      popup.textContent = text;
      popup.className = "point-popup";

      if (isReal) popup.classList.add("true-popup");

      popup.style.left = `${Math.random() * 80 + 10}%`;
      popup.style.top = `${Math.random() * 60 + 10}%`;
      popup.style.color = positive ? "green" : "red";
      document.body.appendChild(popup);

      setTimeout(() => popup.remove(), 1200);
    }

    function showInterruptivePopup(type = "cookie") {
  gamePaused = true;
  clearInterval(goalAnimationInterval);

  const wrapper = document.createElement("div");
  wrapper.className = "interruptive-popup";
  let message = "📢 Please accept our new cookie policy to continue.";
  if (type === "feedback") message = "📝 You are giving us a 5 star rating, correct?";
  if (type === "follow") message = "📸 You have to follow us on all socials afterwards!";

  wrapper.innerHTML = `
    <div id="interrupt-box" style="position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
                background: #fff; border: 2px solid #444; padding: 20px; z-index: 9999;
                box-shadow: 0 0 10px rgba(0,0,0,0.5); font-family: sans-serif; text-align: center;">
      <p>${message}</p>
      <button id="accept-popup">Accept</button>
    </div>`;

  document.body.appendChild(wrapper);
  const popupBox = document.getElementById("interrupt-box");

  let dodging = true;
  const dodgeTimer = setTimeout(() => {
    dodging = false;
  }, 10000);

  popupBox.addEventListener("mousemove", (e) => {
    if (!dodging) return;
    const dx = (Math.random() - 0.5) * 40;
    const dy = (Math.random() - 0.5) * 40;
    popupBox.style.left = `${50 + dx}%`;
    popupBox.style.top = `${30 + dy}%`;
    popupBox.style.transform = "translate(-50%, -50%)";
  });

  document.getElementById("accept-popup").addEventListener("click", () => {
    clearTimeout(dodgeTimer);
    wrapper.remove();
    gamePaused = false;
    goalAnimationInterval = animateGoalButton();
  });
}


    const trueGoalBtn = document.createElement("button");
    trueGoalBtn.id = "true-goal-button";
    trueGoalBtn.className = "popup-button";
    trueGoalBtn.textContent = "💡";
    trueGoalBtn.style.position = "absolute";
    trueGoalBtn.style.left = "50%";
    trueGoalBtn.style.top = "25%";
    trueGoalBtn.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(trueGoalBtn);

    const goalButtonAnimations = ["bounce", "jiggle", "spin", "shake", "wobble", "slide"];
    function animateGoalButton() {
      return setInterval(() => {
        if (gamePaused) return;
        const newLeft = Math.random() * 80 + 10;
        const newTop = Math.random() * 60 + 20;
        trueGoalBtn.style.left = `${newLeft}%`;
        trueGoalBtn.style.top = `${newTop}%`;
        trueGoalBtn.classList.remove(...goalButtonAnimations);
        const randomAnim = goalButtonAnimations[Math.floor(Math.random() * goalButtonAnimations.length)];
        trueGoalBtn.classList.add(randomAnim);
      }, 1000);
    }
    goalAnimationInterval = animateGoalButton();

    trueGoalBtn.addEventListener("click", () => {
      realClicks++;
      const now = Date.now();
      playClickSound();
      if (now - goalBtnLastClick < 1200 || gamePaused) return;
      goalBtnLastClick = now;
      let pts = 1;
      if (now - lastClickTime < 2000) {
        comboCount++;
        pts += comboCount;
        showPopup(`💡 Combo x${comboCount}! +${pts}`, true, true);
      } else {
        comboCount = 1;
        showPopup(`+${pts}`, true, true);
      }
      lastClickTime = now;
      score += pts;
      updateProgressBars();
    });

    function spawnClickPopup() {
      if (gamePaused) return;
      const type = popupTypes[Math.floor(Math.random() * popupTypes.length)];
      const btn = document.createElement("button");
      btn.className = "popup-button";
      btn.textContent = type.label;
      let left = Math.random() * 80 + 10;
      let top = Math.random() * 50 + 20;
      btn.style.left = `${left}%`;
      btn.style.top = `${top}%`;

      const behaviors = ["bounce", "jiggle", "spin", "dodge", "shake"];
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
        fakeClicks++;
        playRandomSound();
        const pts = type.value();
        comboCount = 0;
        if (pts > 0) showPopup(`+${pts}`, true);
        else if (pts < 0) showPopup(`${pts}`, false);
        else {
          const emojis = [
          "💥", "🎊", "🎉", "✨", "🔥", "🎯", "💣", "🧨", "⚡", "💎",
          "🪄", "🌈", "🤑", "🤩", "😵‍💫", "🎆", "🚀", "💸", "🍭", "🍕",
          "📱", "💻", "📢", "🎮", "🧁", "🥳", "👑", "🎁", "🧠", "🤯"
        ];

        const burst = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]).join(" ");
          showPopup(burst, true);
        }
        score += pts;
        updateProgressBars();
        btn.remove();
      });


      document.body.appendChild(btn);
      setTimeout(() => { if (btn.parentNode) btn.remove(); }, 7000);
    }

    interval = setInterval(() => {
      if (gamePaused) return;
      timeLeft--;
      passiveScore += 0.3;
      updateProgressBars();

      const popupAttempts = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < popupAttempts; i++) {
        if (Math.random() < 0.9) spawnClickPopup();
      }

      if (timeLeft === 30) showInterruptivePopup("cookie");
      if (timeLeft === 20) showInterruptivePopup("feedback");
      if (timeLeft === 10) showInterruptivePopup("follow");

      if (timeLeft <= 0) {
        clearInterval(interval);
        clearInterval(goalAnimationInterval);
        timerEl.textContent = "Time's up!";
        document.querySelectorAll(".popup-button").forEach(btn => btn.remove());
        document.getElementById("ending-message")?.remove();
        document.getElementById("true-goal-button")?.remove();
        leaderboardTitle.style.display = "block";
        list.style.display = "block";
        renderLeaderboard();
        showEndingMessage();

        const again = document.createElement("button");
        again.id = "play-again";
        again.textContent = "🔁 Play Again";
        again.style = `
          position: fixed;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          font-size: 1.2rem;
          border-radius: 8px;
          background: #ccc;
          border: 2px solid #999;
          cursor: pointer;
          z-index: 10000;
        `;
        again.addEventListener("click", () => {
          startGame(true);
        });
        document.body.appendChild(again);
      } else {
        timerEl.textContent = `Time left: ${timeLeft}s`;
      }
    }, 1000);


  function showEndingMessage() {
    let behavior;
    const total = realClicks + fakeClicks;

    if (realClicks > fakeClicks * 1.5) behavior = "focused";
    else if (fakeClicks > realClicks * 1.5) behavior = "distracted";
    else behavior = "balanced";

    const messagePool = endingMessages[behavior];
    let message = messagePool[Math.floor(Math.random() * messagePool.length)];

    if (message.includes("{points}")) {
      message = message.replace("{points}", score);
    }

    document.getElementById("ending-message")?.remove();

    const finalMsg = document.createElement("p");
    finalMsg.id = "ending-message";
    finalMsg.style = `
      font-size: 1.2rem;
      margin-top: 2rem;
      color: #222;
      background: #fffbe0;
      padding: 12px 20px;
      border: 2px dashed #999;
      border-radius: 10px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      font-family: 'Comic Sans MS', cursive, sans-serif;
      z-index: 999;
      position: relative;
    `;
    finalMsg.textContent = `🧠 ${message}`;
    document.body.appendChild(finalMsg);
  }


    updateProgressBars();
  }
});
