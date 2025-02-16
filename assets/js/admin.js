function startGame() {
  ws.send(JSON.stringify({ type: "startGame" }));
}

function generateImage() {
  ws.send(JSON.stringify({ type: "generate" }));
}

function setRandomPrompt() {
  ws.send(JSON.stringify({ type: "setRandomPrompt" }));
}
