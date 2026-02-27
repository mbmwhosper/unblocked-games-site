const CATALOG_URL = "/games.local.json";

let games = [];
let category = "All";

const featuredEl = document.getElementById("featured");
const gamesEl = document.getElementById("games");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");

const slugify = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function normalize(item, i) {
  const name = item.name || `Game ${i + 1}`;
  return {
    slug: item.slug || slugify(name),
    name,
    category: item.category || "Games",
    description: item.description || "Play in your browser",
    url: item.url || "",
    featured: Boolean(item.featured) || i < 8
  };
}

function card(g) {
  return `<article class="card"><h3>${g.name}</h3><p>${g.category} • ${g.description}</p><a class="play" href="/g/${g.slug}">Play</a></article>`;
}

function renderCategories() {
  const cats = ["All", ...new Set(games.map(g => g.category))].sort((a,b)=>a.localeCompare(b));
  categoriesEl.innerHTML = "";
  cats.forEach(c => {
    const b = document.createElement("button");
    b.className = `chip ${c === category ? "on" : ""}`;
    b.textContent = c;
    b.onclick = () => { category = c; renderCategories(); renderGames(); };
    categoriesEl.appendChild(b);
  });
}

function filtered() {
  const q = searchEl.value.trim().toLowerCase();
  return games.filter(g => {
    const cOk = category === "All" || g.category === category;
    const qOk = !q || `${g.name} ${g.description} ${g.category}`.toLowerCase().includes(q);
    return cOk && qOk;
  });
}

function renderGames() {
  const list = filtered();
  gamesEl.innerHTML = list.length ? list.map(card).join("") : `<p class="hero"><span>No games matched.</span></p>`;
}

function renderFeatured() {
  featuredEl.innerHTML = games.filter(g => g.featured).slice(0, 12).map(card).join("");
}

async function init() {
  try {
    const res = await fetch(CATALOG_URL, { cache: "no-store" });
    const data = await res.json();
    games = (Array.isArray(data) ? data : []).map(normalize).filter(g => g.url.startsWith("/"));
    if (!games.length) throw new Error("empty");
  } catch {
    featuredEl.innerHTML = "";
    gamesEl.innerHTML = `<p class="hero"><span>Catalog unavailable. Check /games.local.json.</span></p>`;
    return;
  }
  renderFeatured();
  renderCategories();
  renderGames();
}

searchEl.addEventListener("input", renderGames);
init();