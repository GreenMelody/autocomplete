const data = {
  google: {
    suggestions: [
      { name: "gmail", description: "google e-mail" },
      { name: "drive", description: "google drive for save files" },
    ],
  },
  naver: {
    suggestions: [
      { name: "mail", description: "naver e-mail" },
      { name: "drive", description: "naver drive for save files" },
    ],
  },
  nate: {
    suggestions: [
      { name: "mail", description: "nate e-mail" },
      { name: "drive", description: "nate drive for save files" },
    ],
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const textboxes = document.querySelectorAll(".autocomplete-input");

  // Create a reusable suggestions container
  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.id = "autocomplete-suggestions";
  suggestionsContainer.style.position = "absolute";
  suggestionsContainer.style.zIndex = "1000";
  suggestionsContainer.style.display = "none";
  suggestionsContainer.style.backgroundColor = "white";
  suggestionsContainer.style.border = "1px solid #ccc";
  suggestionsContainer.style.borderRadius = "4px";
  suggestionsContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  document.body.appendChild(suggestionsContainer);
  let selectedIndex = -1;

  // Attach event listeners to each textbox
  textboxes.forEach((textbox) => {
    textbox.addEventListener("input", (e) => handleInput(e, textbox, suggestionsContainer));
    textbox.addEventListener("keydown", (e) => handleKeydown(e, textbox, suggestionsContainer));
    textbox.addEventListener("focus", (e) => {
      handleInput(e, textbox, suggestionsContainer)
    });
    textbox.addEventListener("blur", () => suggestionsContainer.style.display = "none"); // Delay hiding
  });
});

function handleInput(e, textbox, suggestionsContainer) {
  const inputValue = e.target.value.toLowerCase();
  suggestionsContainer.innerHTML = "";
  selectedIndex = -1;

  if (!inputValue) {
    suggestionsContainer.style.display = "none";
    return;
  }

  let matchedKeys = [];
  let suggestions = [];

  if (!inputValue.includes(".")) {
    // Match top-level keys
    matchedKeys = Object.keys(data).filter((key) => key.startsWith(inputValue));
    matchedKeys.forEach((key) => {
      const suggestionDiv = document.createElement("div");
      suggestionDiv.className = "suggestion-item";
      suggestionDiv.innerHTML = `<div class="suggestion-name">${key}</div>`;
      suggestionDiv.addEventListener("click", () => {
        textbox.value = key;
        suggestionsContainer.style.display = "none";
      });
      suggestionsContainer.appendChild(suggestionDiv);
    });
  } else {
    // Match nested suggestions
    const [key, ...rest] = inputValue.split(".");
    if (data[key]) {
      suggestions = data[key].suggestions.filter((item) =>
        item.name.startsWith(rest.join("."))
      );
      suggestions.forEach((item) => {
        const suggestionDiv = document.createElement("div");
        suggestionDiv.className = "suggestion-item";
        suggestionDiv.innerHTML = `
          <div class="suggestion-name">${item.name}</div>
          <div class="suggestion-description">${item.description}</div>`;
        suggestionDiv.addEventListener("click", () => {
          textbox.value = `${key}.${item.name}`;
          suggestionsContainer.style.display = "none";
        });
        suggestionsContainer.appendChild(suggestionDiv);
      });
    }
  }

  // Update position of suggestion box
  updateSuggestionPosition(textbox, suggestionsContainer);
}

function updateSuggestionPosition(textbox, suggestionsContainer) {
  const { left, top } = getCaretCoordinates(textbox);
  const rect = textbox.getBoundingClientRect();
  suggestionsContainer.style.top = `${rect.bottom + window.scrollY}px`;

  suggestionsContainer.style.left = `${left}px`;
  suggestionsContainer.style.width = `${textbox.offsetWidth}px`;
  suggestionsContainer.style.display = "block";
}

function getCaretCoordinates(element) {
  const selectionStart = element.selectionStart;
  const value = element.value.substring(0, selectionStart);

  // Create a hidden element to mimic the input's text
  const div = document.createElement("div");
  div.id="hidden-div"
  div.style.position = "absolute";
  div.style.whiteSpace = "pre-wrap";
  div.style.visibility = "hidden";
  div.style.font = window.getComputedStyle(element).font;
  div.style.padding = window.getComputedStyle(element).padding;
  div.style.border = window.getComputedStyle(element).border;
  div.style.overflow = "hidden";

  // Copy text up to caret
  div.textContent = value;

  // Add a marker to identify caret position
  const span = document.createElement("span");
  span.textContent = "|"; // Marker
  div.appendChild(span);

  document.body.appendChild(div);

  // Get marker position
  const rect = span.getBoundingClientRect();
  document.body.removeChild(div);

  // Adjust for caret height (font size)
  const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY + fontSize,
  };
}

function handleKeydown(e, textbox, suggestionsContainer) {
  const items = suggestionsContainer.querySelectorAll(".suggestion-item");

  if (e.key === "ArrowDown") {
    // Move selection down
    if (items.length > 0) {
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
    }
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    // Move selection up
    if (items.length > 0) {
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
    }
    e.preventDefault();
  } else if (e.key === "Enter" || e.key === "Tab") {
    // Confirm selection
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].click();
      e.preventDefault(); // Prevent default form submission (Enter key)
    }
  }
}

function updateSelection(items) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add("selected");
      item.scrollIntoView({ block: "nearest" }); // Ensure selected item is visible
    } else {
      item.classList.remove("selected");
    }
  });
}