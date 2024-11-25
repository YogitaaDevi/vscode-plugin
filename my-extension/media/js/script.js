const vscode = acquireVsCodeApi();
let loadingElement = document.getElementById("loading");
let componentList = document.getElementById("component-list");

document.querySelector(".search-input").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll(".component-card").forEach((card) => {
    const title = card.querySelector(".component-title").textContent.toLowerCase();
    card.style.display = title.includes(searchTerm) ? "flex" : "none";
  });
});

window.addEventListener("message", (event) => {
  const message = event.data;
  switch (message.type) {
    case "updatePosts":
      loadingElement.style.display = "none";
      if (message.posts && message.posts.length > 0) {
        componentList.innerHTML = message.posts
          .map(
            (post) => `
                        <div class="component-card">
                            <div class="component-preview">
                              <img src="${post.url}" alt="Component ${post.id}" />
                            </div>
                            <div class="component-info">
                              <span class="component-title">${post.title}</span>
                              <button class="create-button" onclick="createComponent('${post.id}')">
                               Create
                            </button>
                          </div>
                        </div>
                    `
          )
          .join("");
      } else {
        componentList.innerHTML = "<div>No components found</div>";
      }
      break;
  }
});

function createComponent(id) {
  vscode.postMessage({
    type: "cardClicked",
    id: id,
  });
}

vscode.postMessage({ type: "refresh" });
