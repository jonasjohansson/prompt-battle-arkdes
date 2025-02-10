const elements = (() => {
    const ids = [
        "step-1",
        "step-2",
        "step-3",
        "playerScore",
        "playerName",
        "timer",
        "imageResult",
        "nameInput",
        "resetClientsButton",
        "nameSubmitButton",
        "promptInput",
        "promptText",
        "promptSubmitButton",
        "generatedImage",
        "tryAgainButton",
        "restartButton",
        "scoreIncreaseAudio",
        "generatingImageAudio",
        "generatingImageVideo",
    ];
    const query = (id) => document.querySelector(`#${id}`);
    return ids.reduce((acc, id) => ({ ...acc, [id]: query(id) }), {});
})();

const {
    playerName,
    nameInput,
    promptInput,
    promptText,
    promptSubmitButton,
    timer,
    generatedImage,
    nameSubmitButton,
    tryAgainButton,
    restartButton,
    generatingImageAudio,
    generatingImageVideo,
} = elements;

const setProperty = (property, value) =>
    document.body.style.setProperty(property, value);

const p1_color = localStorage.getItem("p1_color") || "red";
const p2_color = localStorage.getItem("p2_color") || "blue";
setProperty("--p1_color", p1_color);
setProperty("--p2_color", p2_color);

let p1_score = localStorage.getItem("p1_score") || 0;
let p2_score = localStorage.getItem("p2_score") || 0;
setProperty("--p1_score", `"${p1_score}"`);
setProperty("--p2_score", `"${p2_score}"`);

let pid = localStorage.getItem("pid");

while (pid !== "1" && pid !== "2") {
    pid = prompt("Vilket spelar-ID är du (ange 1 eller 2)");
}

localStorage.setItem("pid", pid);
document.body.setAttribute("data-pid", pid);
setProperty("--pid", `"${pid}"`);
playerName.textContent = `Spelare #${pid}:`;

const socket = new WebSocket("wss://prompt-battle-server.glitch.me");

function getRoomParam() {
    const url = window.location.href;
    const urlObj = new URL(url);
    const room = urlObj.searchParams.get("room");
    return room;
}

const submitName = () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Fyll i ditt namn.");
        return;
    }
    setProperty("--player_name", `"${name}"`);
    document.body.setAttribute("data-step", 2);
    focusInput(promptInput);
    startTimer();
};

let countdown;
let duration = 60;

const startTimer = () => {
    let timeLeft = duration;
    setTimer(timeLeft);

    countdown = setInterval(() => {
        setTimer(--timeLeft);
        if (timeLeft <= 0) {
            clearInterval(countdown);
            submitPrompt();
        }
    }, 1000);
};

const setTimer = (timeLeft) => {
    timer.textContent = timeLeft
        ? `Du har ${timeLeft} sekunder kvar…`
        : `Tiden är slut!`;
};

const clearTimer = () => clearInterval(countdown);

const focusInput = (input) => input.focus();

const handleKeyPress = (input, button) => {
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            button.click();
        }
    });
};

const resetForm = () => {
    document.body.setAttribute("data-step", 2);
    clearTimer();
    promptInput.textContent = "";
    generatedImage.src = "";
    promptInput.disabled = false;
    promptSubmitButton.disabled = false;
    promptSubmitButton.classList.remove("fade-in-out");
    toggleVideo(generatingImageVideo);
    startTimer();
};

const submitPrompt = () => {
    const promptText = promptInput.textContent.trim();
    if (!promptText) {
        alert("Fyll i din prompt.");
        return;
    }
    toggleAudio(generatingImageAudio, "in");
    toggleVideo(generatingImageVideo);
    elements.promptText.textContent = promptText;
    promptInput.disabled = true;
    promptSubmitButton.classList.add("fade-in-out");
    promptSubmitButton.innerHTML = `Bilden genereras…`;
    promptSubmitButton.disabled = true;
    clearTimer();
    timer.textContent = "";

    socket.send(
        JSON.stringify({
            type: "generateImage",
            payload: { prompt: promptText },
        })
    );
};

nameSubmitButton.addEventListener("click", submitName);
promptSubmitButton.addEventListener("click", submitPrompt);
tryAgainButton.addEventListener("click", resetForm);
restartButton.addEventListener("click", () => location.reload());

handleKeyPress(nameInput, nameSubmitButton);
handleKeyPress(promptInput, promptSubmitButton);

socket.addEventListener("open", () =>
    console.log("WebSocket connection established.")
);
socket.addEventListener("message", (event) => {
    const { type, room, payload, imageUrl } = JSON.parse(event.data);
    console.log(type, room, payload, imageUrl);
    roomValue = getRoomParam();
    if (roomValue && room !== roomValue) return;
    switch (type) {
        case "imageGenerated":
            generatedImage.src = imageUrl;
            toggleAudio(elements.generatingImageAudio, "out");
            generatedImage.addEventListener("load", () => {
                generatedImage.style.opacity = 1;
            });
            timer.textContent = "";
            document.body.setAttribute("data-step", 3);
            break;
        case "reset":
            localStorage.clear();
            location.reload();
            break;
        case "start":
            submitPrompt();
            break;
        case "updateColor":
            setProperty("--p1_color", payload.p1_color);
            setProperty("--p2_color", payload.p2_color);
            localStorage.setItem("p1_color", payload.p1_color);
            localStorage.setItem("p2_color", payload.p2_color);
            break;
        case "updateScore":
            setProperty("--p1_score", `"${payload.p1_score}"`);
            setProperty("--p2_score", `"${payload.p2_score}"`);
            payload.p1_score = parseInt(payload.p1_score);
            payload.p2_score = parseInt(payload.p2_score);
            if (pid == 1 && payload.p1_score > p1_score)
                playSound("scoreIncreaseAudio");
            if (pid == 2 && payload.p2_score > p2_score)
                playSound("scoreIncreaseAudio");
            localStorage.setItem("p1_score", payload.p1_score);
            localStorage.setItem("p2_score", payload.p2_score);
            p1_score = payload.p1_score;
            p2_score = payload.p2_score;
            break;
        case "setDuration":
            localStorage.setItem("duration", `"${payload.duration}"`);
            duration = payload.duration;
            console.log(duration);
            break;
        case "error":
            alert(
                "Oops! Det verkar som att din prompt fick DALL-E slå bakut. Städa upp och försök igen!"
            );
            promptSubmitButton.textContent =
                promptSubmitButton.getAttribute("alt");
            promptInput.disabled = false;
            toggleAudio(generatingImageAudio, "out");
            toggleVideo(generatingImageVideo);
            promptSubmitButton.classList.remove("fade-in-out");
            promptSubmitButton.disabled = false;
            promptSubmitButton.innerHTML =
                promptSubmitButton.getAttribute("alt");
            startTimer();
            break;
        default:
            console.warn("Unknown message type received:", type);
            break;
    }
});
socket.addEventListener("close", () =>
    console.log("WebSocket connection closed.")
);
socket.addEventListener("error", (error) =>
    console.error("WebSocket error:", error)
);

const playSound = (sound) => {
    elements[sound].play();
};

focusInput(nameInput);

const toggleAudio = (audio, type, duration = 600) => {
    const stepTime = 50; // Adjust the step time for smoother transitions
    const stepAmount = stepTime / duration;
    let volume = type === "in" ? 0 : 1;
    audio.volume = volume;
    audio.play();

    const fade = setInterval(() => {
        if (type === "in") {
            volume += stepAmount;
            if (volume >= 1) {
                volume = 1;
                clearInterval(fade);
            }
        } else {
            volume -= stepAmount;
            if (volume <= 0) {
                volume = 0;
                clearInterval(fade);
                audio.pause();
            }
        }
        audio.volume = volume;
    }, stepTime);
};

const toggleVideo = (video) => {
    video.classList.toggle("show");
};
