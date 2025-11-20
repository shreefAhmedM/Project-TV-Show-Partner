var allEpisodesList = [];
var currentSearchTerm = "";
var endPoint = "https://api.tvmaze.com/shows/82/episodes";

async function setup() {
  allEpisodesList = await fetchingShow();
  makePageForEpisodes(allEpisodesList);
  populateSeasonSelector(allEpisodesList);
  updateMatchCount(allEpisodesList.length, allEpisodesList.length);

  document
    .getElementById("search-term-input")
    .addEventListener("input", handleSearchTermInput);
  document
    .getElementById("season-selector")
    .addEventListener("change", handleSeasonSelector);
}

async function fetchingShow() {
  const response = await fetch(endPoint);
  if (response.ok) {
    const episodes = await response.json();
    return episodes;
  } else {
    throw new Error(`Response status: ${response.status}`);
  }
}

function handleSearchTermInput(e) {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  document.getElementById("season-selector").selectedIndex = 0;
  var filteredList = filterEpisodes(allEpisodesList, currentSearchTerm);
  updateMatchCount(filteredList.length, allEpisodesList.length);
  makePageForEpisodes(filteredList);
}

function handleSeasonSelector(e) {
  var seasonValue = e.target.value;
  document.getElementById("search-term-input").value = "";
  currentSearchTerm = "";
  if (!seasonValue) {
    makePageForEpisodes(allEpisodesList);
    return;
  }
  let found = allEpisodesList.filter(
    (episode) => episode.season === Number(seasonValue)
  );
  makePageForEpisodes(found ? found : []);
  updateMatchCount(found ? found.length : 0, allEpisodesList.length);
}

function filterEpisodes(episodesList, searchTerm) {
  if (!searchTerm) return episodesList;
  return episodesList.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
  );
}

function populateSeasonSelector(episodes) {
  const selector = document.getElementById("season-selector");
  selector.innerHTML = '<option value="">Show All Seasons</option>';
  const availableSeasonsArray = Array.from(
    new Set(episodes.map((episodes) => episodes.season))
  );
  availableSeasonsArray.forEach((season) => {
    const seasonOption = document.createElement("option");
    seasonOption.value = `${season}`;
    seasonOption.textContent = `S${String(season).padStart(2, "0")}`;
    selector.appendChild(seasonOption);
  });
}

function updateMatchCount(filtered, total) {
  document.getElementById("numbers-of-episodes").textContent =
    `${filtered}/${total}`;
}

function padStartWithTwoZero(number) {
  return String(number).padStart(2, "0");
}

function createEpisodeCard({ name, season, number, url, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const nameElement = document.createElement("h2");
  nameElement.textContent = name;

  const seasonElement = document.createElement("h3");
  seasonElement.textContent = `S${padStartWithTwoZero(season)}E${padStartWithTwoZero(number)}`;

  const linkElement = document.createElement("a");
  linkElement.href = url;
  linkElement.target = "_blank";

  const imgElement = document.createElement("img");
  imgElement.src = image.medium;
  imgElement.alt = name;
  linkElement.appendChild(imgElement);

  const summaryElement = document.createElement("div");
  summaryElement.innerHTML = summary;

  card.append(nameElement, seasonElement, linkElement, summaryElement);

  return card;
}

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");

  root.innerHTML = "";

  const episodeCards = episodeList.map((episode) => createEpisodeCard(episode));
  root.append(...episodeCards);
}

window.onload = setup;
