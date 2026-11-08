(() => {
  const tabs = [...document.querySelectorAll(".side-link")];
  const panels = [...document.querySelectorAll(".admin-panel")];
  const rows = document.getElementById("adminGameRows");
  const search = document.getElementById("adminSearch");
  let games = [];

  function showPanel(name) {
    tabs.forEach((tab) => tab.classList.toggle("selected", tab.dataset.panel === name));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === `panel-${name}`));
  }

  function renderRows() {
    const query = search.value.trim().toLowerCase();
    rows.replaceChildren();
    for (const game of games.filter((item) => item.name.toLowerCase().includes(query))) {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      name.className = "table-game";
      const image = document.createElement("img");
      image.src = `previews/${encodeURIComponent(game.id)}.jpg`;
      image.alt = "";
      image.loading = "lazy";
      const label = document.createElement("span");
      label.textContent = game.name;
      name.append(image, label);
      const type = document.createElement("td");
      type.innerHTML = '<span class="type-tag">SLOT DEMO</span>';
      const status = document.createElement("td");
      status.innerHTML = '<span class="status-tag">SHOWCASE</span>';
      const preview = document.createElement("td");
      const link = document.createElement("a");
      link.href = `games/new/${encodeURIComponent(game.id)}.html`;
      link.className = "text-button";
      link.textContent = "Open ↗";
      preview.append(link);
      row.append(name, type, status, preview);
      rows.append(row);
    }
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.panel)));
  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.open));
  });
  search.addEventListener("input", renderRows);

  fetch("games.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load game list (${response.status})`);
      return response.json();
    })
    .then((catalog) => {
      games = catalog;
      document.getElementById("statGames").textContent = String(games.length);
      document.getElementById("gameCount").textContent = `${games.length} GAMES`;
      const featured = document.getElementById("featuredGames");
      for (const game of games.slice(0, 4)) {
        const link = document.createElement("a");
        link.className = "featured-game";
        link.href = `games/new/${encodeURIComponent(game.id)}.html`;
        const image = document.createElement("img");
        image.src = `previews/${encodeURIComponent(game.id)}.jpg`;
        image.alt = "";
        image.loading = "lazy";
        const name = document.createElement("span");
        name.textContent = game.name;
        link.append(image, name);
        featured.append(link);
      }
      renderRows();
    })
    .catch((error) => {
      console.error(error);
      rows.innerHTML = '<tr><td colspan="4">Could not load the game catalogue.</td></tr>';
    });
})();

