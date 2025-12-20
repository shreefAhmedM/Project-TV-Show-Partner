var allEpisodesList = [];
var currentSearchTerm = "";
var endPoint = "https://api.tvmaze.com/shows/82/episodes";

async function setup() {
  allEpisodesList = await fetchingEpisodes();
  makePageForEpisodes(allEpisodesList);
  populateEpisodeSelector(allEpisodesList);
  updateMatchCount(allEpisodesList.length, allEpisodesList.length);

  document
    .getElementById("search-term-input")
    .addEventListener("input", handleSearchTermInput);

  document
    .getElementById("episode-selector")
    .addEventListener("change", handleEpisodeSelector);
}

async function fetchingEpisodes() {
  const response = await fetch(endPoint);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return await response.json();
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
    return;
  }

  const found = allEpisodesList.find((ep) => ep.id === episodeId);
  makePageForEpisodes(found ? [found] : []);
  updateMatchCount(1, allEpisodesList.length);
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
    `${filtered}/${total}`;
}

function createEpisodeCard({ name, season, number, url, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  card.innerHTML = `
    <h2>${name}</h2>
    <h3>S${pad(season)}E${pad(number)}</h3>
    <a href="${url}" target="_blank">
      <img src="${image.medium}" alt="${name}">
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
