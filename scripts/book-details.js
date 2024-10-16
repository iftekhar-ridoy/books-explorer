// DOM Elements
const contentElement = document.getElementById("content");

function showDetailsLoader() {
  contentElement.innerHTML =
    '<div class="loader-container"><div class="loader"></div></div>';
}

async function viewBookDetails(id) {
  showDetailsLoader();
  try {
    const response = await fetch(`https://gutendex.com/books/${id}`);
    const book = await response.json();
    document.title = book.title
      ? `${book.title} - Book Explorer`
      : "Book Details";
    contentElement.innerHTML = `
      <div class="book-details">
        <button onclick="window.history.back()" class="backButton"><i class="fas fa-arrow-left"></i> Back to List</button>
        <h1>${book.title}</h1>
        <img src="${book.formats["image/jpeg"]}" alt="Cover of ${book.title}">
        <p><span><i class="fas fa-user"></i> Author:</span> ${
          book.authors[0]?.name || "Unknown"
        }</p>
        <p><span><i class="fas fa-tags"></i> Subjects:</span> ${book.subjects.join(
          ", "
        )}</p>
        <p><span><i class="fas fa-language"></i> Languages:</span> ${book.languages.join(
          ", "
        )}</p>
        <p><span><i class="fas fa-download"></i> Download Count:</span> ${
          book.download_count
        }</p>
        <h2><span><i class="fas fa-file-alt"></i> Available Formats:</span></h2>
        <ul>
          ${Object.entries(book.formats)
            .map(
              ([format, url]) => `
            <li><a href="${url}" target="_blank">${format}</a></li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching book details:", error);
    contentElement.innerHTML = `<p class="error"><i class="fas fa-exclamation-triangle"></i> Error loading book details. Please try again later.</p>`;
  }
}

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id");
if (bookId) {
  viewBookDetails(bookId);
} else {
  contentElement.innerHTML = "<p>No book ID provided.</p>";
}
