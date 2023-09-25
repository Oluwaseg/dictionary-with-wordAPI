const result = document.getElementById("result");
const sound = document.getElementById("sound");
const btn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-history-btn");
const wordHistoryContent = document.getElementById("word-history-content");
const wordHistorySection = document.querySelector(".word-history");
const wordHistoryHeader = document.querySelector(".word-history h3");
const loadingIndicator = document.getElementById("loading");
const pagination = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

let word;
let currentPage = 1;
const itemsPerPage = 5;
let wordHistory = [];

function displayPage(pageNumber) {
  const totalPages = Math.ceil(wordHistory.length / itemsPerPage);
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = wordHistory.slice(startIndex, endIndex);

  wordHistoryContent.innerHTML = "";

  pageItems.forEach((word) => {
    const historyItem = document.createElement("div");
    historyItem.textContent = word;
    wordHistoryContent.appendChild(historyItem);
  });

  if (totalPages > 0) {
    pageInfo.textContent = `Page ${pageNumber} of ${totalPages}`;
  } else {
    pageInfo.textContent = "Page 1 of 0";
  }
}

displayPage(currentPage);

const inputField = document.getElementById("inp-word");

inputField.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    btn.click();
  }
});

btn.addEventListener("click", () => {
  word = document.getElementById("inp-word").value;

  if (btn.textContent === "Search") {
    loadingIndicator.style.display = "block";

    setTimeout(() => {
      const apiKey = "bc3f3f3ef4msh0d21e9ec3b316b8p1c75d3jsnb1597cbf522d";
      const url = `https://wordsapiv1.p.rapidapi.com/words/${word}`;

      fetch(url, {
        method: "GET",
        headers: {
          "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
          "X-RapidAPI-Key": apiKey,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.word) {
            const partOfSpeech =
              data.results[0].partOfSpeech || "Not available";
            const example = data.results[0].examples
              ? data.results[0].examples.join("<br>")
              : "No examples available";
            result.innerHTML = `
              <div class="word">
                <h3>${word}</h3>
                <button onclick="playSound()"><i class="fas fa-volume-up"></i></button>
              </div>
              <div class="details">
                <p>${partOfSpeech}</p>
                <p>/${data.pronunciation.all || "Not available"}/</p>
              </div>
              <p class="word-meaning">
                ${data.results[0].definition || "Not available"}
              </p>
              <p class="word-example">
                ${example}
              </p>
            `;

            sound.setAttribute("src", `https:${data.pronunciation.audio}`);
            btn.textContent = "Clear";

            addToWordHistory(word);
          } else {
            result.innerHTML = `
              <div class="word">
                <h3>${word}</h3>
                <button><i class="fas fa-volume-up"></i></button>
              </div>
              <div class="details">
                <p>No meaning found</p>
              </div>
            `;
            sound.src = "";
          }

          loadingIndicator.style.display = "none";
          wordHistorySection.style.display = "none";
          pagination.style.display = "none";
        })
        .catch((error) => {
          result.innerHTML = `<p class="error">Error fetching data for "${word}"</p>`;
          loadingIndicator.style.display = "none";
        });
    }, 1000);
  } else {
    result.innerHTML = "";
    sound.src = "";
    inputField.value = "";
    btn.textContent = "Search";
    wordHistorySection.style.display = "flex";
    displayPage(currentPage);
    pagination.style.display = "block";
  }
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage(currentPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(wordHistory.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayPage(currentPage);
  }
});

clearBtn.addEventListener("click", () => {
  wordHistory = [];
  updateWordHistory();
  wordHistoryContent.style.display = "none";
});

function addToWordHistory(word) {
  wordHistory.unshift(word);
  if (wordHistory.length > 20) {
    wordHistory.pop();
  }
  updateWordHistory();
}

function updateWordHistory() {
  localStorage.setItem("wordHistory", JSON.stringify(wordHistory));
  displayPage(currentPage);
}

function renderInitialWordHistory() {
  const savedWordHistory = JSON.parse(localStorage.getItem("wordHistory"));
  if (Array.isArray(savedWordHistory)) {
    wordHistory = savedWordHistory;
    displayPage(currentPage);
    pagination.style.display = "block";
  }
}

renderInitialWordHistory();

function playSound() {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(word);
  synth.speak(utterance);
}
