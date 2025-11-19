var allEpisodesList = [];
var currentSearchTerm = "";

function setup() {
  allEpisodesList = getAllEpisodes();
  makePageForEpisodes(allEpisodesList);
  populateEpisodeSelector(allEpisodesList);
  updateMatchCount(allEpisodesList.length, allEpisodesList.length);

  document
    .getElementById("search-term-input")
    .addEventListener("input", handleSearchTermInput);
  document
    .getElementById("season-selector")
    .addEventListener("change", onSelectorChange);
}

function handleSearchTermInput(e) {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  document.getElementById("season-selector").selectedIndex = 0;
  var filteredList = filterEpisodes(allEpisodesList, currentSearchTerm);
  updateMatchCount(filteredList.length, allEpisodesList.length);
  makePageForEpisodes(filteredList);
}

function onSelectorChange(e) {
  var val = e.target.value;
  document.getElementById("search-term-input").value = "";
  currentSearchTerm = "";
  if (!val) {
    makePageForEpisodes(allEpisodesList);
    return;
  }
  let [season, number] = val.split("-");
  let found = allEpisodesList.find(
    (episode) =>
      episode.season === Number(season) && episode.number === Number(number)
  );
  makePageForEpisodes(found ? [found] : []);
  updateMatchCount(found ? 1 : 0, allEpisodesList.length);
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
  const selector = document.getElementById("season-selector");
  selector.innerHTML = '<option value="">Show All Episodes</option>';
  const availableSeasons = new Set(episodes.map((episodes) => episodes.season));
  console.log(availableSeasons);
  episodes.forEach(({ season }) => {
    const option = document.createElement("option");
    option.value = `${season}`;
    option.textContent = `S${String(season).padStart(2, "0")}`;
    selector.appendChild(option);
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
