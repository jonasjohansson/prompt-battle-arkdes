require("dotenv").config(); // Load .env variables
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocketServer({ port: 8080 });

console.log("✅ Server is running on ws://localhost:8080");

wss.on("connection", (ws) => {
  console.log("🔗 New WebSocket connection established.");

  ws.on("message", async (data) => {
    try {
      const parsedMsg = JSON.parse(data);
      handleMessage(ws, parsedMsg);
    } catch (error) {
      send(ws, { type: "error", message: "❌ Invalid JSON format." });
    }
  });

  ws.on("close", () => {
    console.log("❌ Connection closed.");
  });
});

const handleMessage = async (ws, { type, payload, playerId }) => {
  console.log(`📩 Received message of type: ${type}`);

  switch (type) {
    case "requestId":
      assignPlayerId(ws, payload, ws);
      break;
    case "startGame":
      handleStartGame();
      break;
    case "generate":
      handleGenerateRequest();
      break;
    case "setRandomPrompt":
      handleSetRandomPrompt();
      break;
    case "submitPrompt":
      handleGenerateImage(ws, playerId, payload);
      break;
    default:
      send(ws, { type: "error", message: "❌ Unknown message type." });
  }
};

const assignPlayerId = (ws, existingId, wsClient) => {
  let playerId = existingId || uuidv4();
  wsClient.playerId = playerId; // Store player ID on the WebSocket connection
  send(ws, { type: "playerId", playerId });
};

const handleStartGame = () => {
  console.log("🚀 Game started! Broadcasting to all players...");
  broadcast({ type: "startGame" });
};

const handleGenerateRequest = () => {
  console.log("🚀 Broadcasting 'generate' to all players...");
  broadcast({ type: "generate" }); // Tell all players to send their prompts
};

const handleSetRandomPrompt = () => {
  console.log("🚀 Broadcasting 'setRandomPrompt' to all players...");
  broadcast({ type: "setRandomPrompt" });
};

const handleGenerateImage = async (ws, playerId, data) => {
  if (!playerId) {
    send(ws, { type: "error", message: "❌ Missing player ID." });
    return;
  }
  if (!data || typeof data.prompt !== "string") {
    send(ws, {
      type: "error",
      message: "❌ Prompt text is missing or invalid.",
    });
    return;
  }

  try {
    const imageUrl = await generateImage(data.prompt);
    console.log(`🎨 Image generated for Player ${playerId}`);

    broadcast({
      type: "imageGenerated",
      playerId,
      prompt: data.prompt,
      imageUrl,
    });
  } catch (error) {
    console.error("❌ Error generating image:", error.message);
    send(ws, { type: "error", message: `🚫 ${error.message}` });
  }
};

const generateImage = async (promptText) => {
  console.log(`🔹 Generating image for prompt: "${promptText}"`);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("❌ OPENAI_API_KEY is missing in .env!");

  const url = "https://api.openai.com/v1/images/generations";
  const requestData = {
    model: "dall-e-2",
    prompt: promptText,
    n: 1,
    size: "1024x1024",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("🛑 OpenAI API Response Error:", result);
      throw new Error(result.error?.message || "❌ Image generation failed.");
    }

    return result.data[0].url;
  } catch (error) {
    console.error("❌ Image generation failed:", error.message);
    throw error;
  }
};

const send = (ws, msg) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
};

const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      send(client, message);
    }
  });
};
