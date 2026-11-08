(() => {
  const grid = document.getElementById("gameGrid");
  const search = document.getElementById("gameSearch");
  const empty = document.getElementById("emptyState");
  const filters = [...document.querySelectorAll(".chip")];
  const featured = new Set([
    "aurora-descent", "cosmic-gold", "gem-empire", "golden-pharaoh",
    "neon-heist", "pirate-fortune", "sakura-storm", "phoenix-rising",
  ]);
  let games = [];
  let activeFilter = "all";

  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = games.filter((game) => {
      const matchesQuery = `${game.name} ${game.description}`.toLowerCase().includes(query);
      return matchesQuery && (activeFilter === "all" || featured.has(game.id));
    });

    grid.replaceChildren();
    for (const game of visible) {
      const card = document.createElement("article");
      card.className = "game-card";

      const image = document.createElement("img");
      image.src = `previews/${encodeURIComponent(game.id)}.jpg`;
      image.alt = `${game.name} game preview`;
      image.loading = "lazy";
      image.width = 1365;
      image.height = 768;

      const content = document.createElement("div");
      content.className = "card-content";
      const title = document.createElement("h3");
      title.className = "card-title";
      title.textContent = game.name;
      const description = document.createElement("p");
      description.className = "card-description";
      description.textContent = game.description;
      const link = document.createElement("a");
      link.className = "card-link";
      link.href = `games/new/${encodeURIComponent(game.id)}.html`;
      const label = document.createElement("span");
      label.textContent = "Play demo";
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      link.append(label, arrow);
      content.append(title, description, link);
      card.append(image, content);
      grid.append(card);
    }

    empty.hidden = visible.length > 0;
  }

  search.addEventListener("input", render);
  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      activeFilter = filter.dataset.filter;
      filters.forEach((item) => item.classList.toggle("active", item === filter));
      render();
    });
  });

  fetch("games.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load game list (${response.status})`);
      return response.json();
    })
    .then((catalog) => {
      games = catalog;
      render();
    })
    .catch((error) => {
      console.error(error);
      grid.innerHTML = '<p class="loading">Could not load the game list. Please refresh the page.</p>';
    });
})();

