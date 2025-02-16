document.addEventListener("DOMContentLoaded", function () {
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
});
