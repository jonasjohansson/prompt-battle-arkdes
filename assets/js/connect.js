const remote_server = "wss://prompt-battle-server-arkdes.glitch.me";
const local_server = "ws://localhost:8080";
let ws;
let reconnectInterval = 5000;

function connectWebSocket() {
  ws = new WebSocket(remote_server);

  ws.onopen = () => {
    console.log("Connected to WebSocket server");
  };

  ws.onclose = () => {
    console.warn("WebSocket connection closed. Reconnecting in 5 seconds...");
    setTimeout(connectWebSocket, reconnectInterval);
  };

  ws.onerror = (error) => {
    console.error("WebSocket encountered an error", error);
    ws.close();
  };
}

connectWebSocket();
