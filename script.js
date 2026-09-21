const scenes = ["intro", "garden", "choice", "bird-trial", "petal-game", "letter-scene"];
const foundFlowers = new Set();
let caseIndex = 0;
let casesSolved = 0;
let questionedBirds = new Set();
let checkedClues = new Set();
let caseClosed = false;

const birdNames = ["Lazo", "Trébol", "Estrella"];
const trialCases = [
  {
    culprit: 2,
    testimonies: [
      "🎀 Lazo: “Yo estaba durmiendo. Trébol puede confirmarlo porque roncaba muy elegantemente.”",
      "🍀 Trébol: “Vi a Estrella esconder algo debajo del ala. Parecía un sobre, pero yo no soy copuchento.”",
      "⭐ Estrella: “¡Objeción! Trébol miente. Yo estaba vigilando las semillas… por motivos científicos.”"
    ],
    clues: [
      "🔎 En la escena hay pequeñas marcas de estrella junto al lugar donde desapareció la carta.",
      "🌻 Las semillas siguen intactas. Estrella claramente no estaba vigilándolas.",
      "🪶 Encontraste una pluma con brillantina dorada pegada al sobre."
    ]
  },
  {
    culprit: 0,
    testimonies: [
      "🎀 Lazo: “No pude robar nada. Estaba practicando mi cara de pajarito inocente.”",
      "🍀 Trébol: “Lazo dijo que necesitaba papel para escribir una lista de semillas.”",
      "⭐ Estrella: “Escuché un sobre arrugándose cerca del nido de Lazo. Luego fingió estar dormido.”"
    ],
    clues: [
      "🔎 Hay un pedacito de cinta amarilla en el camino hacia el nido de Lazo.",
      "🌻 Falta exactamente una semilla, utilizada aparentemente como pisapapeles.",
      "🪶 La pluma encontrada no tiene brillantina ni hojas: pertenece a Lazo."
    ]
  },
  {
    culprit: 1,
    testimonies: [
      "🎀 Lazo: “Trébol ofreció devolver la carta a cambio de veinte semillas. Tengo testigos… bueno, Estrella.”",
      "🍀 Trébol: “Eso es una calumnia. Yo solo pedí diecinueve semillas y jamás vi ninguna carta.”",
      "⭐ Estrella: “Confirmo lo de las veinte semillas. Además, Trébol acaba de admitir demasiado.”"
    ],
    clues: [
      "🔎 Encontraste una nota: ‘Rescate: 20 semillas’. Tiene dibujado un trébol.",
      "🌻 Hay diecinueve semillas cuidadosamente contadas junto al escondite.",
      "🪶 Una pequeña hoja de trébol estaba atrapada en el cierre del sobre."
    ]
  }
];

function showScene(id) {
  scenes.forEach((sceneId) => {
    document.getElementById(sceneId).hidden = sceneId !== id;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("enter-button").addEventListener("click", () => showScene("garden"));

document.querySelectorAll(".flower").forEach((flower, index) => {
  flower.addEventListener("click", () => {
    if (foundFlowers.has(index)) return;
    foundFlowers.add(index);
    flower.classList.add("found");
    document.querySelector("#message-toast p").textContent = flower.dataset.message;
    const total = foundFlowers.size;
    document.getElementById("progress-text").textContent = `${total} de 5`;
    document.getElementById("progress-bar").style.width = `${total * 20}%`;
    if (total === 5) {
      document.querySelector("#message-toast p").textContent = "Las encontraste todas. Cada flor ya lleva un pedacito de lo que siento por ti.";
      document.getElementById("continue-button").hidden = false;
      launchPetals(20);
    }
  });
});

document.getElementById("continue-button").addEventListener("click", () => showScene("choice"));

document.querySelectorAll(".decoy").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("choice-hint").textContent = button.dataset.decoy;
  });
});

document.querySelector(".choice-button.correct").addEventListener("click", () => {
  document.getElementById("choice-hint").textContent = "Sabía que lo encontrarías 💛";
  setTimeout(() => {
    resetTrial();
    showScene("bird-trial");
  }, 700);
});

document.querySelectorAll(".interrogate").forEach((button) => {
  button.addEventListener("click", () => {
    if (caseClosed) return;
    const birdIndex = Number(button.dataset.bird);
    questionedBirds.add(birdIndex);
    document.getElementById("testimony-text").textContent = trialCases[caseIndex].testimonies[birdIndex];
    button.closest(".suspect-card").classList.add("questioned");
    button.textContent = "Interrogar otra vez";
    updateInvestigation();
  });
});

document.querySelectorAll(".evidence-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (caseClosed) return;
    const clueIndex = Number(button.dataset.clue);
    checkedClues.add(clueIndex);
    document.getElementById("testimony-text").textContent = trialCases[caseIndex].clues[clueIndex];
    button.classList.add("checked");
    updateInvestigation();
  });
});

document.querySelectorAll(".accuse").forEach((button) => {
  button.addEventListener("click", () => accuseBird(Number(button.dataset.bird)));
});

function updateInvestigation() {
  const ready = questionedBirds.size === 3 && checkedClues.size >= 2;
  document.querySelectorAll(".accuse").forEach((button) => {
    button.disabled = !ready || caseClosed;
  });
  if (ready) {
    document.getElementById("accusation-instruction").textContent = "Ya puedes presentar tu acusación. Piensa bien en las contradicciones.";
  } else {
    const pendingBirds = 3 - questionedBirds.size;
    const pendingClues = Math.max(0, 2 - checkedClues.size);
    document.getElementById("accusation-instruction").textContent =
      `Falta interrogar a ${pendingBirds} y revisar ${pendingClues} pista(s).`;
  }
}

function accuseBird(birdIndex) {
  if (caseClosed) return;
  const currentCase = trialCases[caseIndex];
  if (birdIndex !== currentCase.culprit) {
    const excuses = [
      "⚖️ ¡Objeción! Esa acusación carece de semillas y fundamentos.",
      `🐤 ${birdNames[birdIndex]}: “¡Soy inocente! Mi abogado es un canario muy prestigioso.”`,
      "El juez golpea la mesa: “Pío, pío. Revisa nuevamente las declaraciones.”"
    ];
    document.getElementById("testimony-text").textContent = excuses[Math.floor(Math.random() * excuses.length)];
    return;
  }

  caseClosed = true;
  casesSolved += 1;
  document.getElementById("cases-solved").textContent = String(casesSolved);
  document.querySelectorAll(".accuse").forEach((button) => {
    button.disabled = true;
  });
  const culpritCard = document.querySelectorAll(".suspect-card")[birdIndex];
  culpritCard.classList.add("culprit");
  document.getElementById("testimony-text").textContent =
    `⚖️ Culpable: ${birdNames[birdIndex]}. Sentencia: devolver la carta y pagar una multa de tres semillas.`;
  launchPetals(12);

  if (caseIndex < trialCases.length - 1) {
    document.getElementById("next-case").hidden = false;
  } else {
    document.getElementById("go-petal-game").hidden = false;
    document.getElementById("accusation-instruction").textContent =
      "Los tres casos fueron resueltos. El tribunal ordena entregar la carta inmediatamente.";
  }
}

document.getElementById("next-case").addEventListener("click", () => {
  caseIndex += 1;
  prepareCase();
});

function prepareCase() {
  questionedBirds.clear();
  checkedClues.clear();
  caseClosed = false;
  document.getElementById("case-number").textContent = String(caseIndex + 1);
  document.getElementById("testimony-text").textContent = "Nuevo caso. Los tres sospechosos aseguran ser completamente inocentes.";
  document.getElementById("next-case").hidden = true;
  document.querySelectorAll(".suspect-card").forEach((card) => card.classList.remove("questioned", "culprit"));
  document.querySelectorAll(".interrogate").forEach((button) => {
    button.textContent = "Interrogar";
  });
  document.querySelectorAll(".evidence-button").forEach((button) => button.classList.remove("checked"));
  document.querySelectorAll(".accuse").forEach((button) => {
    button.disabled = true;
  });
  updateInvestigation();
}

function resetTrial() {
  caseIndex = 0;
  casesSolved = 0;
  document.getElementById("cases-solved").textContent = "0";
  document.getElementById("go-petal-game").hidden = true;
  prepareCase();
}

let petalScore = 0;
let petalLives = 3;
let petalStreak = 0;
let petalBestStreak = 0;
let petalRunning = false;
let petalSpawnTimer = null;
let petalClockTimer = null;
let petalDeadline = 0;
let petalGraceUntil = 0;

const PETAL_TARGET = 35;
const PETAL_DURATION = 45;
const petalItems = [
  { symbol: "🌼", type: "petal", points: 1, weight: 40, good: true },
  { symbol: "🌻", type: "flower", points: 4, weight: 10, good: true },
  { symbol: "💛", type: "heart", points: 0, weight: 5 },
  { symbol: "⏳", type: "clock", points: 0, weight: 5 },
  { symbol: "🐤", type: "bird", points: -3, weight: 12 },
  { symbol: "💧", type: "rain", points: 0, weight: 10 },
  { symbol: "🍂", type: "leaf", points: 0, weight: 10 },
  { symbol: "🥀", type: "fake", points: 0, weight: 8 }
];

document.getElementById("go-petal-game").addEventListener("click", () => {
  resetPetalGame();
  showScene("petal-game");
});

document.getElementById("start-petal-game").addEventListener("click", startPetalGame);
document.getElementById("retry-petal-game").addEventListener("click", startPetalGame);

function startPetalGame() {
  clearPetalTimers();
  document.querySelectorAll(".falling-item").forEach((item) => item.remove());
  petalScore = 0;
  petalLives = 3;
  petalStreak = 0;
  petalBestStreak = 0;
  petalRunning = true;
  petalDeadline = Date.now() + PETAL_DURATION * 1000;
  petalGraceUntil = Date.now() + 1800;
  document.getElementById("petal-ready").hidden = true;
  document.getElementById("petal-result").hidden = true;
  document.getElementById("open-letter").hidden = true;
  document.getElementById("petal-message").textContent =
    "¡Comenzó! Atrapa los pétalos amarillos y no dejes que se escapen.";
  updatePetalHud();
  petalClockTimer = setInterval(updatePetalClock, 200);
  schedulePetal();
}

function schedulePetal() {
  if (!petalRunning) return;
  spawnPetalItem();
  const elapsed = PETAL_DURATION - getPetalSecondsLeft();
  const delay = elapsed < 15 ? 760 : elapsed < 30 ? 610 : 480;
  petalSpawnTimer = setTimeout(schedulePetal, delay);
}

function spawnPetalItem() {
  const area = document.getElementById("petal-game-area");
  const itemData = choosePetalItem();
  const item = document.createElement("button");
  const elapsed = PETAL_DURATION - getPetalSecondsLeft();
  const fallBase = elapsed < 15 ? 5.8 : elapsed < 30 ? 4.8 : 4.05;

  item.className = `falling-item ${itemData.good ? "good" : "trick"}`;
  item.type = "button";
  item.textContent = itemData.symbol;
  item.setAttribute("aria-label", describePetalItem(itemData.type));
  item.style.left = `${4 + Math.random() * 84}%`;
  item.style.setProperty("--sway", `${(Math.random() - .5) * 105}px`);
  item.style.setProperty("--fall-time", `${fallBase + Math.random() * .8}s`);
  item.dataset.caught = "false";

  item.addEventListener("click", () => catchPetalItem(item, itemData));
  item.addEventListener("animationend", () => {
    if (item.dataset.caught === "false" && itemData.good && petalRunning) {
      missPetal();
    }
    item.remove();
  }, { once: true });
  area.appendChild(item);
}

function choosePetalItem() {
  const totalWeight = petalItems.reduce((total, item) => total + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of petalItems) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return petalItems[0];
}

function catchPetalItem(element, itemData) {
  if (!petalRunning || element.dataset.caught === "true") return;
  element.dataset.caught = "true";
  element.classList.add("caught");

  if (itemData.type === "petal" || itemData.type === "flower") {
    petalStreak += 1;
    petalBestStreak = Math.max(petalBestStreak, petalStreak);
    const multiplier = getPetalMultiplier();
    petalScore += itemData.points * multiplier;
    flashPetalArea("bonus");
    document.getElementById("petal-message").textContent =
      itemData.type === "flower"
        ? `¡Girasol dorado! +${itemData.points * multiplier} puntos.`
        : `¡Pétalo atrapado! Combo x${multiplier}.`;
  } else if (itemData.type === "heart") {
    petalLives = Math.min(3, petalLives + 1);
    document.getElementById("petal-message").textContent =
      petalLives === 3 ? "Ya tenías todas las vidas. El corazón igual te apoya." : "¡Recuperaste una vida!";
    flashPetalArea("bonus");
  } else if (itemData.type === "clock") {
    petalDeadline += 5000;
    document.getElementById("petal-message").textContent = "¡Tiempo extra! Ganaste cinco segundos.";
    flashPetalArea("bonus");
  } else if (itemData.type === "bird") {
    petalScore = Math.max(0, petalScore - 3);
    breakPetalStreak();
    document.getElementById("petal-message").textContent =
      "El pajarito cobró tres puntos como impuesto. Qué conveniente.";
    flashPetalArea("hit");
  } else if (itemData.type === "leaf") {
    breakPetalStreak();
    document.getElementById("petal-message").textContent =
      "Era una hoja. Tu multiplicador se fue volando.";
    flashPetalArea("hit");
  } else if (itemData.type === "rain") {
    losePetalLife("¡Gota de lluvia! Perdiste una vida.");
  } else {
    losePetalLife("¡Flor falsa! Los pajaritos la pintaron para hacer trampa.");
  }

  petalScore = Math.min(PETAL_TARGET, petalScore);
  updatePetalHud();
  if (petalScore >= PETAL_TARGET) winPetalGame();
  setTimeout(() => element.remove(), 260);
}

function missPetal() {
  if (Date.now() < petalGraceUntil) return;
  losePetalLife("Se escapó un pétalo amarillo. ¡No pierdas de vista los siguientes!");
}

function losePetalLife(message) {
  if (!petalRunning || Date.now() < petalGraceUntil) return;
  petalLives -= 1;
  petalGraceUntil = Date.now() + 900;
  breakPetalStreak();
  document.getElementById("petal-message").textContent = message;
  flashPetalArea("hit");
  updatePetalHud();
  if (petalLives <= 0) endPetalGame("lives");
}

function breakPetalStreak() {
  petalStreak = 0;
}

function getPetalMultiplier() {
  if (petalStreak >= 10) return 4;
  if (petalStreak >= 6) return 3;
  if (petalStreak >= 3) return 2;
  return 1;
}

function getPetalSecondsLeft() {
  return Math.max(0, Math.ceil((petalDeadline - Date.now()) / 1000));
}

function updatePetalClock() {
  if (!petalRunning) return;
  updatePetalHud();
  if (getPetalSecondsLeft() <= 0) endPetalGame("time");
}

function updatePetalHud() {
  document.getElementById("petal-score").textContent = String(petalScore);
  document.getElementById("petal-time").textContent = String(getPetalSecondsLeft());
  document.getElementById("petal-lives").textContent =
    "💛".repeat(Math.max(0, petalLives)) + "🖤".repeat(Math.max(0, 3 - petalLives));
  document.getElementById("petal-multiplier").textContent = `x${getPetalMultiplier()}`;
  document.getElementById("bouquet-fill").style.width =
    `${Math.min(100, (petalScore / PETAL_TARGET) * 100)}%`;
}

function winPetalGame() {
  petalRunning = false;
  clearPetalTimers();
  document.querySelectorAll(".falling-item").forEach((item) => item.remove());
  savePetalBestScore(petalScore);
  document.getElementById("petal-message").textContent =
    "¡Ramo reconstruido! Dificultad superada y pajaritos oficialmente derrotados.";
  document.getElementById("open-letter").hidden = false;
  launchPetals(38);
}

function endPetalGame(reason) {
  petalRunning = false;
  clearPetalTimers();
  document.querySelectorAll(".falling-item").forEach((item) => item.remove());
  const best = savePetalBestScore(petalScore);
  document.getElementById("result-icon").textContent = reason === "time" ? "⏰" : "🐤";
  document.getElementById("result-title").textContent = "Game Over";
  document.getElementById("result-message").textContent =
    reason === "time"
      ? "Se acabó el tiempo. El viento se llevó el ramo, pero puedes intentarlo nuevamente."
      : "Los pajaritos solicitan que practiques tus reflejos antes de volver al jardín.";
  document.getElementById("result-score").textContent = String(petalScore);
  document.getElementById("result-streak").textContent = String(petalBestStreak);
  document.getElementById("best-score").textContent = String(best);
  document.getElementById("petal-result").hidden = false;
}

function savePetalBestScore(score) {
  let best = score;
  try {
    const saved = Number(localStorage.getItem("mejorPuntajePetalos") || 0);
    best = Math.max(saved, score);
    localStorage.setItem("mejorPuntajePetalos", String(best));
  } catch {
    best = score;
  }
  return best;
}

function flashPetalArea(className) {
  const area = document.getElementById("petal-game-area");
  area.classList.remove("hit", "bonus");
  void area.offsetWidth;
  area.classList.add(className);
  setTimeout(() => area.classList.remove(className), 380);
}

function clearPetalTimers() {
  clearTimeout(petalSpawnTimer);
  clearInterval(petalClockTimer);
}

function resetPetalGame() {
  petalRunning = false;
  clearPetalTimers();
  petalScore = 0;
  petalLives = 3;
  petalStreak = 0;
  petalBestStreak = 0;
  petalDeadline = Date.now() + PETAL_DURATION * 1000;
  document.querySelectorAll(".falling-item").forEach((item) => item.remove());
  document.getElementById("petal-ready").hidden = false;
  document.getElementById("petal-result").hidden = true;
  document.getElementById("open-letter").hidden = true;
  document.getElementById("petal-message").textContent =
    "Los pétalos suman; las gotas y flores falsas quitan vidas.";
  updatePetalHud();
}

function describePetalItem(type) {
  const labels = {
    petal: "Atrapar pétalo amarillo",
    flower: "Atrapar girasol dorado",
    heart: "Recuperar una vida",
    clock: "Conseguir tiempo extra",
    bird: "Evitar pajarito amarillo",
    rain: "Evitar gota de lluvia",
    leaf: "Evitar hoja seca",
    fake: "Evitar flor falsa"
  };
  return labels[type];
}

document.getElementById("open-letter").addEventListener("click", () => showScene("letter-scene"));

document.getElementById("final-surprise").addEventListener("click", () => {
  document.getElementById("finale").hidden = false;
  launchPetals(45);
  document.getElementById("replay-button").focus();
});

document.getElementById("replay-button").addEventListener("click", () => {
  document.getElementById("finale").hidden = true;
  resetJourney();
  showScene("intro");
});

function resetJourney() {
  foundFlowers.clear();
  document.querySelectorAll(".flower").forEach((flower) => flower.classList.remove("found"));
  document.getElementById("progress-text").textContent = "0 de 5";
  document.getElementById("progress-bar").style.width = "0%";
  document.querySelector("#message-toast p").textContent = "Toca una flor que esté brillando…";
  document.getElementById("continue-button").hidden = true;
  document.getElementById("choice-hint").textContent = "Puedes probar todas las opciones.";
  resetTrial();
  resetPetalGame();
}

function launchPetals(amount) {
  const symbols = ["🌼", "✦", "💛"];
  for (let i = 0; i < amount; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = symbols[i % symbols.length];
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.setProperty("--drift", `${(Math.random() - 0.5) * 260}px`);
    petal.style.animationDuration = `${4 + Math.random() * 4}s`;
    petal.style.animationDelay = `${Math.random() * 1.5}s`;
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 9500);
  }
}
