ws.onopen = () => {
  ws.send(JSON.stringify({ type: "registerDisplay" }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message);
  if (message.type === "imageGenerated") {
    saveImageData(message);
    displayImage(message);
  }
};

function saveImageData(imageData) {
  console.log(imageData);
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
    <img src="${imageUrl}" title="${prompt}" alt="${prompt}">
    <p class="small"><strong>Player:</strong> ${playerId}</p>
  `;
  gallery.prepend(imageBox);
}

document.getElementById("clearStorage").addEventListener("click", () => {
  localStorage.removeItem("imageHistory");
  document.getElementById("imageGallery").innerHTML = "";
});

// Load images from localStorage on page load
loadStoredImages();
