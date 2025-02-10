const getElement = (id) => document.getElementById(id);

const elements = {
    room: "room",
    duration: "duration",
    p1_score: "p1_score",
    p2_score: "p2_score",
    p1_color: "p1_color",
    p2_color: "p2_color",
};

let socket;
let isSocketConnected = false;

// Function to connect or reconnect the WebSocket
const connectWebSocket = () => {
    socket = new WebSocket("wss://prompt-battle-server.glitch.me");

    socket.addEventListener("open", () => {
        isSocketConnected = true;
        document.body.classList.add("is-connected");
        console.log("WebSocket connection established.");
    });

    socket.addEventListener("close", () => {
        isSocketConnected = false;
        document.body.classList.remove("is-connected");
        console.log("WebSocket connection closed. Reconnecting...");
        setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
    });

    socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        socket.close(); // Close the socket to trigger reconnect
    });
};

// Initial connection
connectWebSocket();

const reset = () => send("reset");
const start = () => send("start");
const updateColor = () =>
    send("updateColor", {
        p1_color: elements.p1_color.value,
        p2_color: elements.p2_color.value,
    });
const updateScore = () =>
    send("updateScore", {
        p1_score: elements.p1_score.value,
        p2_score: elements.p2_score.value,
    });
const setDuration = () =>
    send("setDuration", {
        duration: elements.duration.value,
    });

const send = (type, data) => {
    const room = elements.room.value;
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: type, room: room, payload: data }));
    } else {
        console.error("WebSocket is not open. Cannot send message:", { type, data });
    }
};

// Initialize elements with DOM elements
Object.keys(elements).forEach((key) => {
    elements[key] = getElement(elements[key]);
});
