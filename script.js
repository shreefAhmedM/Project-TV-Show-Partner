let allEpisodes = [];
let searchTerm = "";

function setup() {
  allEpisodes = getAllEpisodes();

  renderEpisodes(allEpisodes);
  populateEpisodeSelector(allEpisodes);

  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);
  document
    .getElementById("episode-option-selector")
    .addEventListener("change", handleSelect);
}

function handleSearch(e) {
  searchTerm = e.target.value.toLowerCase();
  const filtered = filterEpisodes(allEpisodes, searchTerm);
  renderEpisodes(filtered);
  updateMatchCount(filtered.length, allEpisodes.length);
}

function handleSelect(e) {
  const val = e.target.value;
  if (!val) {
    renderEpisodes(allEpisodes);
    updateMatchCount(allEpisodes.length, allEpisodes.length);
    return;
  }
  const [season, number] = val.split("-");
  const found = allEpisodes.find(
    (ep) => ep.season === +season && ep.number === +number
  );
  renderEpisodes(found ? [found] : []);
  updateMatchCount(found ? 1 : 0, allEpisodes.length);
}

function filterEpisodes(list, term) {
  return list.filter(
    (ep) =>
      ep.name.toLowerCase().includes(term) ||
      ep.summary.toLowerCase().includes(term)
  );
}

function renderEpisodes(episodes) {
  const container = document.getElementById("episodes-container");
  container.innerHTML = "";
  if (!episodes.length) {
    container.textContent = "No episodes found.";
    return;
  }
  episodes.forEach(({ name, season, number, image, summary }) => {
    container.innerHTML += `
      <section class="film-card">
        <h3 class="title">${name} - S${String(season).padStart(
      2,
      "0"
    )}E${String(number).padStart(2, "0")}</h3>
        <img class="img" src="${image.medium}" alt="${name} Image">
        <p class="summary">${summary}</p>
      </section>
    `;
  });
}

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episode-option-selector");
  selector.innerHTML = '<option value="">Show All Episodes</option>';
  episodes.forEach(({ name, season, number }) => {
    const opt = document.createElement("option");
    opt.value = `${season}-${number}`;
    opt.textContent = `S${String(season).padStart(2, "0")}E${String(
      number
    ).padStart(2, "0")} - ${name}`;
    selector.appendChild(opt);
  });
}

function updateMatchCount(filtered, total) {
  document.getElementById(
    "NumsOfEpisodes"
  ).textContent = `${filtered}/${total}`;
}

window.onload = setup;
