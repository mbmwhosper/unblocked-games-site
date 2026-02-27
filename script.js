const games = (window.GAMES || []).slice();
let activeCategory = "All";

const grid = document.getElementById("gameGrid");
const featuredGrid = document.getElementById("featuredGrid");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");

function gameCard(game) {
  return `
    <article class="card">
      <h3>${game.name}</h3>
      <p>${game.category} • ${game.description}</p>
      <div class="player-controls">
        <a class="play-link" href="${game.url}" target="_blank" rel="noopener noreferrer">Play Now</a>
        <a class="play-link" href="/g/${game.slug}">Game Page</a>
      </div>
    </article>
  `;
}

function renderCategories() {
  const categories = ["All", ...new Set(games.map(g => g.category))].sort((a, b) => a.localeCompare(b));
  categoriesEl.innerHTML = "";

  categories.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = `chip ${cat === activeCategory ? "active" : ""}`;
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeCategory = cat;
      renderCategories();
      renderGrid();
    });
    categoriesEl.appendChild(chip);
  });
}

function filteredGames() {
  const q = searchEl.value.trim().toLowerCase();
  return games.filter(g => {
    const categoryPass = activeCategory === "All" || g.category === activeCategory;
    const searchPass = !q || `${g.name} ${g.description} ${g.category}`.toLowerCase().includes(q);
    return categoryPass && searchPass;
  });
}

function renderFeatured() {
  const featured = games.filter(g => g.featured).slice(0, 8);
  featuredGrid.innerHTML = featured.map(gameCard).join("");
}

function renderGrid() {
  const list = filteredGames();
  if (!list.length) {
    grid.innerHTML = `<p class="note">No games found for this filter.</p>`;
    return;
  }
  grid.innerHTML = list.map(gameCard).join("");
}

searchEl.addEventListener("input", renderGrid);

renderFeatured();
renderCategories();
renderGrid();
