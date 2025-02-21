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
  const generateButton = document.getElementById("generateButton");
  generateButton.disabled = false;
  generateButton.textContent = "Generera";
  const promptInput = document.getElementById("promptInput");
  promptInput.contentEditable = false;
}

function handlePlayerId(id) {
  playerId = id;
  localStorage.setItem("playerId", playerId);
  document.getElementById("playerId").innerText = playerId;
  const startButton = document.getElementById("startButton");
  startButton.disabled = false;
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
  const prompt = promptInput.textContent;
  if (prompt) submitPrompt(); // Automatically send the player's prompt
}

function handleSetRandomPrompt() {
  const _prompts = [
    "A mysterious figure in a dark forest, illuminated by moonlight.",
    "Futuristic city skyline with neon lights and flying cars.",
    "A cat wearing a space suit floating in zero gravity.",
    "A surreal desert with giant melting clocks.",
    "A knight in shining armor standing before a dragon.",
    "A cozy cottage in a snowy landscape at sunset.",
    "An astronaut discovering an ancient alien ruin on Mars.",
    "A cyberpunk street with rain-soaked neon signs.",
    "A grand palace floating on clouds in a fantasy world.",
    "A giant whale swimming through a starry cosmic ocean.",
  ];
  const prompts = [
    "A meticulously detailed oil painting in the style of the High Renaissance, depicting a woman with a mysterious half-smile, seated against a soft, atmospheric landscape. She wears a dark, subtly folded dress with delicate embroidery. The background features a misty, dreamlike Italian countryside with winding rivers and distant mountains, painted with sfumato—a soft, blended shading technique to create a realistic sense of depth. The lighting is delicate and balanced, casting a gentle glow on her serene face. The color palette consists of warm earthy tones, with subtle golden hues in the skin and soft shadows contouring her features. The subject’s enigmatic expression invites curiosity, while her hands rest gracefully in a relaxed pose.",
    "A stunning oil painting in the Dutch Golden Age style, featuring a young girl wearing a deep blue and gold turban, her head turned slightly to gaze directly at the viewer. A large pearl earring catches the soft, diffused light, creating a luminous effect. The painting captures delicate, photorealistic skin tones, with smooth, almost invisible brushstrokes blending seamlessly. The background is dark and featureless, emphasizing the subject’s glowing complexion and the warm golden highlights on her face. Her lips are slightly parted, adding an air of mystery, while the light falls naturally across her face, accentuating subtle textures in the fabric and skin.",
    "A deeply expressive Baroque oil painting, showcasing an older man with intense, thoughtful eyes, wearing a dark beret and a thick, turned-up collar. The dramatic lighting (chiaroscuro) creates strong contrasts between light and shadow, emphasizing the deeply textured wrinkles and weathered skin. The background is dark and neutral, bringing focus to the painterly brushstrokes that define his solemn, introspective expression. The color palette is rich with deep browns, ochres, and golden highlights, and the painting has an almost sculptural quality due to the heavy, layered brushwork. The figure’s gaze conveys wisdom, melancholy, and profound introspection.",
    "A swirling, emotionally charged Post-Impressionist oil painting depicting a vivid night sky above a small village, illuminated by a crescent moon and glowing yellow stars. The deep blue sky is filled with dynamic, thick swirling brushstrokes, creating a sense of movement and turbulence. A tall, dark cypress tree reaches into the sky in the foreground, connecting the heavens and the earth. The village below is peaceful, with warm glowing windows, painted in small, angular brushstrokes. The color palette is dominated by deep blues, contrasting with the golden yellows of the stars and moon. The impasto technique adds thick, textured layers of paint, making the surface appear almost three-dimensional.",
    "An impressionistic oil painting of a tranquil pond filled with floating water lilies, their petals softly illuminated by dappled sunlight. The reflections of the sky and trees shimmer across the water’s surface, painted in loose, fluid brushstrokes that blend purples, pinks, and blues. The colors are vibrant yet harmonious, creating a dreamlike, serene atmosphere. Light and shadow dance across the water, with rippling reflections that distort the lily pads slightly. The artist’s brushwork is lively and expressive, capturing the fleeting beauty of nature in a way that feels both spontaneous and carefully composed.",
    "A rich, golden Art Nouveau oil painting depicting an embracing couple, their bodies wrapped in an elaborate, mosaic-like cloak adorned with golden geometric patterns and floral motifs. The man’s face is partially hidden, while the woman tilts her head back, eyes closed, in a blissful expression. The background is a shimmering gold surface, evoking a celestial, almost spiritual quality. The color palette includes deep golds, blacks, and delicate pastels. The fine, intricate detailing in the patterns contrasts with the softly blended skin tones, giving the painting a sensuous yet dreamlike quality.",
    "A hauntingly expressive oil painting portraying a figure on a bridge, clutching its face in terror, while the sky swirls in vibrant, fiery hues of red, orange, and yellow. The background features dark, undulating hills and a deep blue fjord, painted with fluid, curving lines. The sky appears almost alive, with chaotic brushstrokes that heighten the sense of anxiety. The central figure is ghostly pale, its mouth open in a silent scream, eyes wide with existential horror. The entire composition is distorted and exaggerated, using bold, unnatural colors to convey a raw, emotional intensity.",
    "A powerful, large-scale Cubist painting in a monochromatic grayscale palette, depicting a chaotic scene of war and suffering. The composition is fragmented, with overlapping, distorted figures of people, animals, and architecture, creating a sense of anguish and destruction. A screaming woman holds a dead child, while a horse rears in pain. A disjointed eye-shaped lightbulb beams down from above, symbolizing the horrors of war. The brushwork is sharp and angular, with heavy black outlines defining the deconstructed forms. The entire image conveys an overwhelming sense of despair, protest, and raw emotion.",
    "A dreamlike Surrealist oil painting depicting a barren desert landscape under a warm, golden sky. In the foreground, soft, melting clocks drape over a leafless tree, a rectangular platform, and an amorphous organic shape resembling a sleeping face. The shadows are elongated, stretching unnaturally across the ground, creating an eerie stillness. The colors are muted yet rich, with soft yellows, warm browns, and deep blues. The painting has an uncanny, surreal quality, blending realism with impossible elements. The details are finely rendered, enhancing the strange, dreamlike atmosphere.",
    "A graceful Renaissance oil painting depicting the goddess Venus emerging from a giant seashell, standing nude with flowing golden hair cascading over her body. She is surrounded by soft pastel colors, with a gentle wind blowing from the left, where Zephyrus, the wind god, embraces a nymph as they send a flurry of delicate flowers toward Venus. To the right, a woman in a floral-patterned robe reaches out to cover her with a pink silk cloak. The water beneath the shell shimmers with soft blues and greens, while the background consists of a distant, dreamlike seascape. The composition is balanced and harmonious, using delicate contours and soft shading characteristic of the Early Renaissance.",
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
  imageContainer.innerHTML = `<img src="${imageUrl}" title="${imagePrompt}" alt="${imagePrompt}"><p class="imageTitle">${imagePrompt}</p>`;
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
