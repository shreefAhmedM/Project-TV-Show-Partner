var allEpisodesList = [];
var currentSearchTerm = "";
var allShows = [];
var episodesCache = {};
var initialShowId = 82;

async function setup() {
  await loadShows();
  await loadEpisodesForShow(initialShowId);

  makePageForEpisodes(allEpisodesList);
  populateEpisodeSelector(allEpisodesList);
  updateMatchCount(allEpisodesList.length, allEpisodesList.length);

  document
    .getElementById("search-term-input")
    .addEventListener("input", handleSearchTermInput);

  document
    .getElementById("episode-selector")
    .addEventListener("change", handleEpisodeSelector);

  document
    .getElementById("show-selector")
    .addEventListener("change", handleShowSelector);
}

async function loadShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  allShows = await response.json();

  allShows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const selector = document.getElementById("show-selector");
  selector.innerHTML = "";

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  });

  selector.value = String(initialShowId);
}

async function loadEpisodesForShow(showId) {
  if (episodesCache[showId]) {
    allEpisodesList = episodesCache[showId];
    return;
  }

  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const episodes = await response.json();
  episodesCache[showId] = episodes;
  allEpisodesList = episodes;
}

function handleSearchTermInput(e) {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  document.getElementById("episode-selector").selectedIndex = 0;

  const filtered = filterEpisodes(allEpisodesList, currentSearchTerm);
  updateMatchCount(filtered.length, allEpisodesList.length);
  makePageForEpisodes(filtered);
}

function handleEpisodeSelector(e) {
  const episodeId = Number(e.target.value);
  if (!episodeId) {
    makePageForEpisodes(allEpisodesList);
    updateMatchCount(allEpisodesList.length, allEpisodesList.length);
    return;
  }

  const found = allEpisodesList.find((ep) => ep.id === episodeId);
  makePageForEpisodes(found ? [found] : []);
  updateMatchCount(found ? 1 : 0, allEpisodesList.length);
}

async function handleShowSelector(e) {
  const showId = Number(e.target.value);
  if (!showId) return;

  currentSearchTerm = "";
  document.getElementById("search-term-input").value = "";
  document.getElementById("episode-selector").selectedIndex = 0;

  await loadEpisodesForShow(showId);

  populateEpisodeSelector(allEpisodesList);
  updateMatchCount(allEpisodesList.length, allEpisodesList.length);
  makePageForEpisodes(allEpisodesList);
}

function filterEpisodes(list, term) {
  if (!term) return list;
  return list.filter(
    (ep) =>
      ep.name.toLowerCase().includes(term) ||
      ep.summary.toLowerCase().includes(term)
  );
}

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episode-selector");
  selector.innerHTML = `<option value="">Jump to episode</option>`;

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${pad(episode.season)}E${pad(
      episode.number
    )} - ${episode.name}`;
    selector.appendChild(option);
  });
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function updateMatchCount(filtered, total) {
  document.getElementById("numbers-of-episodes").textContent =
    `${filtered.length}/${total.length}`;
}

function createEpisodeCard({ name, season, number, url, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const imgSrc = image && image.medium ? image.medium : "";
  const imgAlt = name || "Episode image";

  card.innerHTML = `
    <h2>${name}</h2>
    <h3>S${pad(season)}E${pad(number)}</h3>
    <a href="${url}" target="_blank">
      <img src="${imgSrc}" alt="${imgAlt}">
    </a>
    ${summary}
  `;

  return card;
}

function makePageForEpisodes(list) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  root.append(...list.map(createEpisodeCard));
}

window.onload = setup;
