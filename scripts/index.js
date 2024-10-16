const contentElement = document.getElementById("content");
const searchInput = document.getElementById("searchInput");
const topicSelect = document.getElementById("topicSelect");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const searchClearButton = document.getElementById("clearButton");
const topicClearButton = document.getElementById("topicClearButton");
const notification = document.getElementById("notification");

let currentPage = 1;
let books = [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || {};
let topics = [];
let debounceTimer;

function debounce(func, delay) {
  return function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
  };
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function showNotification(message) {
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 5000);
}

function setLoadingState(isLoading) {
  if (isLoading) {
    prevPageButton.style.display = "none";
    nextPageButton.style.display = "none";
  }
}

function showSkeletonLoader() {
  contentElement.innerHTML = `
    <div class="book-list">
      ${Array(8)
        .fill()
        .map(
          () => `
        <div class="book-card">
          <div class="book-card-div-1">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
          <div class="book-card-div-2">
            <div class="skeleton skeleton-button"></div>
            <div class="skeleton skeleton-button"></div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function saveSearchParams() {
  const searchParams = {
    searchTerm: searchInput.value,
    selectedTopic: topicSelect.value,
  };
  localStorage.setItem("searchParams", JSON.stringify(searchParams));
  updateClearButtonsVisibility();
}

function loadSearchParams() {
  const savedParams = JSON.parse(localStorage.getItem("searchParams")) || {};
  searchInput.value = savedParams.searchTerm || "";
  updateTopics(savedParams.selectedTopic);
  updateClearButtonsVisibility();
}

function clearSearchInput() {
  searchInput.value = "";
  saveSearchParams();
  currentPage = 1;
  fetchBooks();
}

function clearTopicSelection() {
  topicSelect.value = "";
  saveSearchParams();
  currentPage = 1;
  fetchBooks();
}

function updateClearButtonsVisibility() {
  topicClearButton.style.display = topicSelect.value ? "inline-block" : "none";
  searchClearButton.style.display = searchInput.value ? "inline-block" : "none";
}

async function fetchBooks() {
  setLoadingState(true);
  showSkeletonLoader();
  try {
    const searchTerm = searchInput.value;
    const selectedTopic = topicSelect.value;
    let url = `https://gutendex.com/books/?page=${currentPage}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    if (selectedTopic) url += `&topic=${encodeURIComponent(selectedTopic)}`;

    const response = await fetch(url);
    const data = await response.json();
    books = data.results;

    updateTopics(selectedTopic);
    displayBooks();
    scrollToTop();
    updatePaginationButtons(data);
    saveSearchParams();
  } catch (error) {
    contentElement.innerHTML = `<p class="error"><i class="fas fa-exclamation-triangle"></i> Error loading book details. Please try again later.</p>`;
  } finally {
    setLoadingState(false);
  }
}

function updateTopics(savedTopic = "") {
  const newTopics = [...new Set(books.flatMap((book) => book.subjects))].sort();
  if (JSON.stringify(newTopics) !== JSON.stringify(topics)) {
    topics = newTopics;
    localStorage.setItem("topics", JSON.stringify(topics));
  } else {
    topics = JSON.parse(localStorage.getItem("topics")) || [];
  }

  topicSelect.innerHTML =
    '<option value="">Select topic</option>' +
    topics
      .map((topic) => `<option value="${topic}">${topic}</option>`)
      .join("");

  if (savedTopic && topics.includes(savedTopic)) {
    topicSelect.value = savedTopic;
  } else {
    topicSelect.value = "";
  }
}

function displayBooks() {
  contentElement.innerHTML = `
    <div class="book-list">
      ${books
        .map(
          (book) => `
        <div class="book-card">
         <div class="book-card-div-1"> 
            <img src="${book.formats["image/jpeg"]}" alt="Cover of ${
            book.title
          }">
            <h3>${book.title}</h3>
            <p><span>Author:</span> ${book.authors[0]?.name || "Unknown"}</p>
            <p><span>Genre:</span> ${book.subjects[0] || "Unspecified"}</p>
          </div>
          <div class="book-card-div-2">
            <button>
              <a href="book-details.html?id=${book.id}">
                Details 
              </a>
            </button>
            <button onclick="toggleWishlist(${book.id})"
            title="${
              wishlist[book.id] ? "Remove from Wishlist" : "Add to Wishlist"
            }"
            >
               ${
                 wishlist[book.id]
                   ? '<i class="fa-solid fa-heart"></i>'
                   : '<i class="fa-regular fa-heart"></i>'
               }
            </button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  if (books.length === 0) {
    contentElement.innerHTML = `<p class="no-results"><i class="fa-solid fa-circle-exclamation"></i>  No books found.</p>`;
  }
}

function toggleWishlist(id) {
  const book = books.find((b) => b.id === id);
  if (wishlist[id]) {
    delete wishlist[id];
  } else {
    wishlist[id] = book;
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayBooks();
  showNotification(
    wishlist[id]
      ? `${book.title} added to your Wishlist!`
      : `${book.title} removed from your Wishlist!`
  );
}

function updatePaginationButtons(data) {
  let hasNext = data.next !== null;
  let hasPrevious = currentPage > 1;
  console.log(hasNext, hasPrevious);

  prevPageButton.style.display = hasPrevious
    ? "inline-block"
    : "none !important";
  nextPageButton.style.display = hasNext ? "inline-block" : "none !important";
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchBooks();
  }
}

function nextPage() {
  currentPage++;
  fetchBooks();
}

searchInput?.addEventListener(
  "input",
  debounce(() => {
    currentPage = 1;
    fetchBooks();
  }, 500)
);

topicSelect?.addEventListener("change", () => {
  currentPage = 1;
  saveSearchParams();
  fetchBooks();
});

searchClearButton?.addEventListener("click", clearSearchInput);
topicClearButton?.addEventListener("click", clearTopicSelection);

prevPageButton?.addEventListener("click", prevPage);
nextPageButton?.addEventListener("click", nextPage);

loadSearchParams();
fetchBooks();
