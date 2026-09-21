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
let petalStreak = 0;
let petalTimer = null;
let petalRunning = false;
let petalSlowUntil = 0;

const petalItems = [
  { symbol: "🌼", type: "petal", points: 1, weight: 42 },
  { symbol: "🌻", type: "flower", points: 3, weight: 15 },
  { symbol: "💛", type: "heart", points: 0, weight: 8 },
  { symbol: "🐤", type: "bird", points: -1, weight: 9 },
  { symbol: "💧", type: "rain", points: -2, weight: 9 },
  { symbol: "🍂", type: "leaf", points: 0, weight: 10 },
  { symbol: "🌾", type: "seed", points: 0, weight: 7 }
];

document.getElementById("go-petal-game").addEventListener("click", () => {
  resetPetalGame();
  showScene("petal-game");
});

document.getElementById("start-petal-game").addEventListener("click", () => {
  resetPetalGame();
  document.getElementById("petal-ready").hidden = true;
  petalRunning = true;
  document.getElementById("petal-message").textContent = "¡Atrapa los pétalos amarillos antes de que se los lleve el viento!";
  schedulePetal();
});

function schedulePetal() {
  if (!petalRunning) return;
  spawnPetalItem();
  const slowed = Date.now() < petalSlowUntil;
  const baseDelay = Math.max(430, 820 - petalScore * 13);
  petalTimer = setTimeout(schedulePetal, slowed ? baseDelay * 1.55 : baseDelay);
}

function spawnPetalItem() {
  const area = document.getElementById("petal-game-area");
  const itemData = choosePetalItem();
  const item = document.createElement("button");
  item.className = `falling-item ${itemData.points > 0 ? "good" : "trick"}`;
  item.type = "button";
  item.textContent = itemData.symbol;
  item.setAttribute("aria-label", describePetalItem(itemData.type));
  item.style.left = `${4 + Math.random() * 86}%`;
  item.style.setProperty("--sway", `${(Math.random() - .5) * 90}px`);
  const slowed = Date.now() < petalSlowUntil;
  item.style.setProperty("--fall-time", `${(slowed ? 7.4 : 5.4) + Math.random() * 1.4}s`);

  item.addEventListener("click", () => catchPetalItem(item, itemData));
  item.addEventListener("animationend", () => item.remove(), { once: true });
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
  if (!petalRunning || element.classList.contains("caught")) return;
  element.classList.add("caught");

  if (itemData.type === "petal") {
    petalScore += 1;
    petalStreak += 1;
    document.getElementById("petal-message").textContent = "¡Pétalo recuperado! El ramo empieza a volver a la vida.";
  } else if (itemData.type === "flower") {
    petalScore += 3;
    petalStreak += 1;
    document.getElementById("petal-message").textContent = "¡Flor completa! Vale tres pétalos. Excelente captura.";
  } else if (itemData.type === "heart") {
    petalSlowUntil = Date.now() + 5000;
    document.getElementById("petal-message").textContent = "Corazón dorado: el viento se calmó durante cinco segundos.";
  } else if (itemData.type === "bird") {
    petalScore = Math.max(0, petalScore - 1);
    petalStreak = 0;
    document.getElementById("petal-message").textContent = "El pajarito cobró un pétalo como impuesto. Qué conveniente.";
  } else if (itemData.type === "rain") {
    petalScore = Math.max(0, petalScore - 2);
    petalStreak = 0;
    document.getElementById("petal-message").textContent = "¡Le diste agua a la pantalla! Se perdieron dos pétalos.";
  } else if (itemData.type === "leaf") {
    petalStreak = 0;
    document.getElementById("petal-message").textContent = "Eso era una hoja. El ramo no acepta devoluciones.";
  } else {
    petalStreak = 0;
    document.getElementById("petal-message").textContent = "Esa semilla despertó el apetito de todo el tribunal.";
  }

  petalScore = Math.min(15, petalScore);
  document.getElementById("petal-score").textContent = String(petalScore);
  document.getElementById("petal-streak").textContent = String(petalStreak);
  document.getElementById("bouquet-fill").style.width = `${(petalScore / 15) * 100}%`;

  if (petalScore >= 15) finishPetalGame();
  setTimeout(() => element.remove(), 260);
}

function finishPetalGame() {
  petalRunning = false;
  clearTimeout(petalTimer);
  document.querySelectorAll(".falling-item").forEach((item) => item.remove());
  document.getElementById("petal-message").textContent =
    "Ramo reconstruido. Daños causados por pajaritos: muchos. Arrepentimiento: ninguno.";
  document.getElementById("open-letter").hidden = false;
  launchPetals(32);
}

function resetPetalGame() {
  petalRunning = false;
  clearTimeout(petalTimer);
  petalScore = 0;
  petalStreak = 0;
  petalSlowUntil = 0;
  document.querySelectorAll(".falling-item").forEach((item) => item.remove());
  document.getElementById("petal-score").textContent = "0";
  document.getElementById("petal-streak").textContent = "0";
  document.getElementById("bouquet-fill").style.width = "0%";
  document.getElementById("petal-ready").hidden = false;
  document.getElementById("open-letter").hidden = true;
  document.getElementById("petal-message").textContent =
    "Toca los pétalos y las flores; cuidado con las distracciones.";
}

function describePetalItem(type) {
  const labels = {
    petal: "Atrapar pétalo amarillo",
    flower: "Atrapar flor amarilla completa",
    heart: "Atrapar corazón dorado",
    bird: "Evitar pajarito amarillo",
    rain: "Evitar gota de lluvia",
    leaf: "Evitar hoja seca",
    seed: "Evitar semilla"
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
