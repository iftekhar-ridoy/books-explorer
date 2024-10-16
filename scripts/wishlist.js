// DOM Elements
const contentElement = document.getElementById("content");

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || {};

function showNotification(message) {
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 5000);
}

function displayWishlist() {
  const wishlistBooks = Object.values(wishlist);
  contentElement.innerHTML = `
    <h1>Wishlist</h1>
    ${
      wishlistBooks.length === 0
        ? `<p class="no-results"><i class="fa-solid fa-circle-exclamation"></i>  Your wishlist is empty.</p>`
        : `<div class="book-list">
            ${wishlistBooks
              .map(
                (book) => `
                  <div class="book-card">
                    <div class="book-card-div-1"> 
                      <img src="${book.formats["image/jpeg"]}" alt="Cover of ${
                  book.title
                }">
                      <h3>${book.title}</h3>
                      <p><span>Author:</span> ${
                        book.authors[0]?.name || "Unknown"
                      }</p>
                      <p><span>Genre:</span> ${
                        book.subjects[0] || "Unspecified"
                      }</p>
                    </div>
                    <div class="book-card-div-2"> 
                      <button>
                        <a href="book-details.html?id=${book.id}">
                          Details
                        </a>
                      </button>
                      <button onclick="removeFromWishlist(${
                        book.id
                      })" title="Remove from Wishlist">
                        <i class="fa-solid fa-heart"></i>
                      </button>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>`
    }
  `;
}

function removeFromWishlist(id) {
  showNotification(`${wishlist[id].title} removed from wishlist`);
  delete wishlist[id];
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayWishlist();
}

displayWishlist();
