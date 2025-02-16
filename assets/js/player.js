let playerId = localStorage.getItem("playerId") || null;

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "requestId", payload: playerId }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};

function handleMessage(message) {
  console.log(`📩 Received message:`, message);
  switch (message.type) {
    case "playerId":
      handlePlayerId(message.playerId);
      break;
    case "startGame":
      startGame();
      break;
    case "generate":
      handleGenerate();
      break;
    case "setRandomPrompt":
      handleSetRandomPrompt();
      break;
    case "imageGenerated":
      updateImage(message.imageUrl, message.prompt);
      break;
    case "error":
      displayError(message.message); // Handle errors
      break;
    default:
      console.warn("⚠️ Unknown message type:", message.type);
  }
}

function displayError(errorMessage) {
  alert(errorMessage);
}

function handlePlayerId(id) {
  playerId = id;
  localStorage.setItem("playerId", playerId);
  document.getElementById("playerId").innerText = playerId;
}

function startGame() {
  const playerSection = document.getElementById("playerSection");
  if (playerSection) playerSection.remove(); // Remove from DOM
  const gameSection = document.getElementById("gameSection");
  gameSection.style.display = "block";

  // Focus the editable div after rendering
  const promptInput = document.getElementById("promptInput");
  promptInput.focus();
}

function handleGenerate() {
  const generateButton = document.getElementById("generateButton");
  if (generateButton) {
    generateButton.disabled = true;
    generateButton.textContent = "Bilden genereras…";
  }
  const promptInput = document.getElementById("promptInput");
  promptInput.contentEditable = false;
  console.log("⚡ Received 'generate' command from server!");
  submitPrompt(); // Automatically send the player's prompt
}

function handleSetRandomPrompt() {
  const prompts = [
    "Describe a futuristic city in the year 2124.",
    "What would happen if animals could talk?",
    "Write a short story about a lost traveler.",
    "Imagine a world where gravity is half as strong.",
    "What if humans had wings?",
    "Describe a hidden underground civilization.",
    "Write a poem about the color blue.",
    "What if the internet disappeared overnight?",
    "Describe a peaceful alien species visiting Earth.",
    "What would happen if dreams could be recorded?",
  ];

  const randomIndex = Math.floor(Math.random() * prompts.length);
  promptInput.textContent = prompts[randomIndex];

  checkPlaceholder();
}

function updateImage(imageUrl, imagePrompt) {
  const generateButton = document.getElementById("generateButton");
  const promptInput = document.getElementById("promptInput");
  if (generateButton) {
    generateButton.disabled = false;
    generateButton.textContent = "Generera";
    promptInput.contentEditable = true;
  }
  const images = document.getElementById("images");
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("imageContainer");
  imageContainer.innerHTML = `<p class="imageTitle">${imagePrompt}</p><img src="${imageUrl}" title="${imagePrompt}" alt="${imagePrompt}">`;
  images.prepend(imageContainer);
}

function submitPrompt() {
  const prompt = document.getElementById("promptInput").textContent;
  if (!playerId) {
    console.error("❌ Player ID is missing!");
    return;
  }
  ws.send(
    JSON.stringify({
      type: "submitPrompt",
      playerId,
      payload: { prompt },
    })
  );
}
const promptInput = document.getElementById("promptInput");
const generateButton = document.getElementById("generateButton");

// Prevent new lines (Enter key)
promptInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Block Enter key
  }
});

function checkPlaceholder() {
  // Ensure no <br> remains when the input is empty
  if (!promptInput.innerText.trim() || promptInput.innerHTML === "<br>") {
    promptInput.innerHTML = ""; // Remove <br> if it appears
    generateButton.disabled = true;
    promptInput.classList.add("empty"); // Show placeholder
  } else {
    generateButton.disabled = false;
    promptInput.classList.remove("empty"); // Hide placeholder
  }
}

checkPlaceholder(); // Run on page load

// Listen for input changes to update placeholder & button state
promptInput.addEventListener("input", checkPlaceholder);

// Ensure placeholder styling remains when the div loses focus
promptInput.addEventListener("blur", checkPlaceholder);
