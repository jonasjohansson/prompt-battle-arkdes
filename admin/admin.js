const remote_server = "https://prompt-battle-server-arkdes.glitch.me";
const local_server = "ws://localhost:8080";
const ws = new WebSocket(remote_server);

ws.onopen = () => {
  console.log("Admin connected to WebSocket server");
};

function startGame() {
  ws.send(JSON.stringify({ type: "startGame" }));
}

function generateImage() {
  ws.send(JSON.stringify({ type: "generate" }));
}

function setRandomPrompt() {
  ws.send(JSON.stringify({ type: "setRandomPrompt" }));
}
