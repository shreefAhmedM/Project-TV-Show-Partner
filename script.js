let allEpisodesList = [];
let currentSearchTerm = "";
let showsList = [];
let episodesCache = {}; // cache episodes per show

// Fetch all shows from TVMaze and populate the show selector
async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error("Failed to fetch shows");
  const shows = await response.json();
  shows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  showsList = shows;
  populateShowSelector(showsList);
}

// Populate the show dropdown
function populateShowSelector(shows) {
  const selector = document.getElementById("show-selector");
  selector.innerHTML = "";
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  });
}

// When user selects a show, fetch episodes (or use cache)
document
  .getElementById("show-selector")
  .addEventListener("change", async (e) => {
    const showId = e.target.value;
    if (!episodesCache[showId]) {
      const res = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`
      );
      if (!res.ok) return alert("Failed to fetch episodes");
      const episodes = await res.json();
      episodesCache[showId] = episodes;
    }
    allEpisodesList = episodesCache[showId];
    // reset filters
    document.getElementById("search-term-input").value = "";
    document.getElementById("season-selector").selectedIndex = 0;
    makePageForEpisodes(allEpisodesList);
    populateSeasonSelector(allEpisodesList);
    updateMatchCount(allEpisodesList.length, allEpisodesList.length);
  });

async function fetchingEpisodes() {
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

function createHeader() {
  const headerElement = document.createElement("header");
  const bodyElement = document.querySelector("body");
  const rootElement = document.getElementById("root");
  bodyElement.insertBefore(headerElement, rootElement);
}

function createShowSelector() {
  const showSelectorContainer = document.createElement("div");
  showSelectorContainer.id = "show-selector-container";
  const labelElement = document.createElement("label");
  labelElement.htmlFor = "show-selector";
  const selectElement = document.createElement("select");
  selectElement.id = "show-selector";
  selectElement.name = "show-selector";
}

async function setup() {
  const state = {
    showsList: [],
  };

  await fetchShows(); // load all shows into selector
  // select first show automatically
  document.getElementById("show-selector").selectedIndex = 0;
  const firstShowId = document.getElementById("show-selector").value;
  document.getElementById("show-selector").dispatchEvent(new Event("change"));

  // keep search and season selector functionality
  document
    .getElementById("search-term-input")
    .addEventListener("input", handleSearchTermInput);
  document
    .getElementById("season-selector")
    .addEventListener("change", handleSeasonSelector);

  return {
    fetchShowsFromEndPoint() {
      state.showsList = fetchShows();
    },
  };
}

const tvShow = setup();

window.onload = async () => {
  await tvShow;
};
