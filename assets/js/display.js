const remote_server = "https://prompt-battle-server-arkdes.glitch.me";
const local_server = "ws://localhost:8080";
const ws = new WebSocket(remote_server);

ws.onopen = () => {
  console.log("Display connected to WebSocket server");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === "imageGenerated") {
    saveImageData(message);
    displayImage(message);
  }
};

function saveImageData(imageData) {
  let storedImages = JSON.parse(localStorage.getItem("imageHistory")) || [];
  storedImages.unshift(imageData); // Add new image to the beginning
  localStorage.setItem("imageHistory", JSON.stringify(storedImages));
}

function loadStoredImages() {
  let storedImages = JSON.parse(localStorage.getItem("imageHistory")) || [];
  storedImages.forEach(displayImage);
}

function displayImage({ playerId, prompt, imageUrl }) {
  const gallery = document.getElementById("imageGallery");
  const imageBox = document.createElement("div");
  imageBox.classList.add("image-box");
  imageBox.innerHTML = `
    <p><strong>Player:</strong> ${playerId}</p>
    <p><strong>Prompt:</strong> ${prompt}</p>
    <img src="${imageUrl}" alt="Generated Image">
  `;
  gallery.prepend(imageBox);
}

document.getElementById("clearStorage").addEventListener("click", () => {
  localStorage.removeItem("imageHistory");
  document.getElementById("imageGallery").innerHTML = "";
});

// Load images from localStorage on page load
loadStoredImages();
