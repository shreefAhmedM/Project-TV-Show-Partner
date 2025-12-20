let allEpisodesList = [];
let currentSearchTerm = "";
let endPoint = "https://api.tvmaze.com/shows/82/episodes";

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
  return response.json();
}

function handleSearchTermInput(e) {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  document.getElementById("episode-selector").selectedIndex = 0;

  const filteredList = filterEpisodes(allEpisodesList, currentSearchTerm);
  updateMatchCount(filteredList.length, allEpisodesList.length);
  makePageForEpisodes(filteredList);
}

function filterEpisodes(episodesList, searchTerm) {
  if (!searchTerm) return episodesList;
  return episodesList.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
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

function handleEpisodeSelector(e) {
  const episodeId = Number(e.target.value);
  document.getElementById("search-term-input").value = "";

  if (!episodeId) {
    makePageForEpisodes(allEpisodesList);
    updateMatchCount(allEpisodesList.length, allEpisodesList.length);
    return;
  }

  const episode = allEpisodesList.find((ep) => ep.id === episodeId);
  makePageForEpisodes([episode]);
  updateMatchCount(1, allEpisodesList.length);
}

function updateMatchCount(filtered, total) {
  document.getElementById("numbers-of-episodes").textContent =
    `${filtered}/${total}`;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function createEpisodeCard({ name, season, number, url, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = name;

  const code = document.createElement("h3");
  code.textContent = `S${pad(season)}E${pad(number)}`;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";

  const img = document.createElement("img");
  img.src = image.medium;
  img.alt = name;
  link.appendChild(img);

  const desc = document.createElement("div");
  desc.innerHTML = summary;

  card.append(title, code, link, desc);
  return card;
}

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  root.append(...episodeList.map(createEpisodeCard));
}

window.onload = setup;
