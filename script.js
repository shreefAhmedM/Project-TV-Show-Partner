// fetching functions
function fetchShowsOnce() {
  let showCache = null;

  return async function fetchShows() {
    if (showCache) {
      return showCache;
    }
    try {
      loadingData();
      const response = await fetch("https://api.tvmaze.com/shows");
      if (!response.ok)
        throw new Error(`Failed to fetch shows: ${response.status}`);
      const shows = await response.json();
      const sortedShows = shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      showCache = sortedShows;
      return sortedShows;
    } catch (error) {
      showError(error.message);
      throw new Error(`Response status: ${error.message}`);
    }
  };
}

function episodesFetcher() {
  let episodesCache = {};

  return async function fetchingEpisodes(selectedShowId) {
    if (episodesCache[selectedShowId]) {
      return episodesCache[selectedShowId];
    }
    try {
      loadingData();
      const response = await fetch(
        `https://api.tvmaze.com/shows/${selectedShowId}/episodes`
      );

      if (!response.ok)
        throw new Error(`Failed to fetch episodes: ${response.status}`);

      const episodes = await response.json();

      episodesCache[selectedShowId] = episodes;

      return episodes;
    } catch (error) {
      showError(error.message);
      throw new Error(`Response status: ${error.message}`);
    }
  };
}

// make page functions
function makePageForEpisodes(episodesList) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  const episodeCards = episodesList.map((episode) =>
    createEpisodeCard(episode)
  );
  root.append(...episodeCards);
}

function makePageForShows(showsList) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  const showCards = showsList.map((show) => createShowCard(show));
  root.append(...showCards);
}

// handler functions
function handleSearchTermInput(e, allEpisodesList) {
  const currentSearchTerm = e.target.value.trim().toLowerCase();
  document.getElementById("season-selector").selectedIndex = 0;
  document.getElementById("episode-selector").selectedIndex = 0;
  var filteredList = filterBySearchTerm(allEpisodesList, currentSearchTerm);
  updateMatchCount(filteredList, allEpisodesList);
  makePageForEpisodes(filteredList);
}

function handleShowSelector(episodesList) {
  resetSearchTerm();
  makePageForEpisodes(episodesList);
  updateEpisodeControls(episodesList);
  document.getElementById("episode-controls").style.display = "flex";
}

function handleSeasonSelector(e, allEpisodesList) {
  const seasonValue = e.target.value;
  document.getElementById("search-term-input").value = "";
  document.getElementById("episode-selector").selectedIndex = 0;
  if (!seasonValue) {
    makePageForEpisodes(allEpisodesList);
    updateMatchCount(allEpisodesList, allEpisodesList);
    return;
  }
  let episodesFoundList = allEpisodesList.filter(
    (episode) => episode.season === Number(seasonValue)
  );
  makePageForEpisodes(episodesFoundList);
  updateMatchCount(episodesFoundList ? episodesFoundList : 0, allEpisodesList);
}

function handleEpisodeSelector(e, allEpisodesList) {
  const episodeValue = e.target.value;
  if (!episodeValue) {
    makePageForEpisodes(allEpisodesList);
    updateMatchCount(allEpisodesList, allEpisodesList);
    return;
  }
  const episodeId = Number(episodeValue);
  const episodeSelected = allEpisodesList.filter(({ id }) => id === episodeId);
  makePageForEpisodes(episodeSelected);
  updateMatchCount(episodeSelected ? episodeSelected : 0, allEpisodesList);
  document.getElementById("search-term-input").value = "";
  document.getElementById("season-selector").selectedIndex = 0;
}

function handleShowFilter(e, allShowsList) {
  document.getElementById("episode-controls").style.display = "none";
  const searchTerm = e.target.value.trim().toLowerCase();
  const filteredShowsList = filterBySearchTerm(allShowsList, searchTerm);
  makePageForShows(filteredShowsList);
}

// utility functions
function loadingData() {
  const root = document.getElementById("root");
  root.innerHTML = "";
  const loading = document.createElement("p");
  loading.id = "loading-message";
  loading.textContent = "Loading data, please wait...";
  root.appendChild(loading);
}

function showError(message) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  const errorMessage = document.createElement("p");
  errorMessage.id = "error-message";
  errorMessage.textContent = `Something went wrong: ${message}`;
  root.appendChild(errorMessage);
}

function filterBySearchTerm(list, searchTerm) {
  if (!searchTerm) return list;
  return list.filter(({ name, summary, genres }) => {
    const nameMatch = (name ?? "").toLowerCase().includes(searchTerm);
    const summaryMatch = (summary ?? "").toLowerCase().includes(searchTerm);
    const genreMatch = genres?.some((genre) =>
      genre.toLowerCase().includes(searchTerm)
    );
    return nameMatch || summaryMatch || genreMatch;
  });
}

function updateMatchCount(filtered, total) {
  document.getElementById("numbers-of-episodes").textContent =
    `${filtered.length}/${total.length}`;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function updateNavShowName(episodesList) {
  const navShowNameElement = document.getElementById("nav-show-name");
  if (episodesList.length === 0) {
    navShowNameElement.textContent = "";
    return;
  }
  const currentShowName = episodesList[0]?._links?.show?.name ?? "";
  navShowNameElement.textContent = currentShowName;
}

function updateEpisodeControls(episodesList) {
  updateNavShowName(episodesList);
  populateSeasonSelector(episodesList);
  populateEpisodeSelector(episodesList);
  updateMatchCount(episodesList, episodesList);
}

function resetSearchTerm() {
  document.getElementById("search-term-input").value = "";
  document.getElementById("show-filter").value = "";
}

// create cards
function createShowCard({
  id,
  name,
  image,
  summary,
  genres,
  status,
  rating,
  runtime,
}) {
  const showCard = document.createElement("div");
  showCard.className = "show-card";

  const nameElement = document.createElement("h2");
  nameElement.className = "show-name";
  nameElement.textContent = name;

  const imageElement = document.createElement("img");
  if (image && image.medium) {
    imageElement.src = image.medium;
    imageElement.alt = name;
    imageElement.className = "show-image";
  }

  const posterElement = document.createElement("div");
  posterElement.className = "show-poster";
  posterElement.append(nameElement, imageElement);
  posterElement.addEventListener("click", async () => {
    const selectElement = document.getElementById("show-selector");
    selectElement.value = id;
    selectElement.dispatchEvent(new Event("change"));
  });

  const summaryElement = document.createElement("div");
  summaryElement.className = "show-summary";
  summaryElement.innerHTML = summary;

  const extraInfoElement = document.createElement("div");
  extraInfoElement.className = "show-extra-info";

  const genresElement = document.createElement("h4");
  genresElement.textContent = `Genres: ${genres.length === 0 ? "N/A" : genres}`;

  const statusElement = document.createElement("h4");
  statusElement.textContent = `Status: ${status}`;

  const ratingElement = document.createElement("h4");
  ratingElement.textContent = `Rating: ${rating.average}`;

  const runtimeElement = document.createElement("h4");
  runtimeElement.innerText = `Runtime: ${runtime} minutes`;

  extraInfoElement.append(
    genresElement,
    statusElement,
    ratingElement,
    runtimeElement
  );

  showCard.append(posterElement, summaryElement, extraInfoElement);

  return showCard;
}

function createEpisodeCard({ name, season, number, url, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = name;

  const code = document.createElement("h3");
  code.textContent = `S${pad(season)}E${pad(number)}`;

  const summaryElement = document.createElement("div");
  summaryElement.innerHTML = summary ?? "<p>No summary available.</p>";

  card.append(title, code, summaryElement);
  return card;
}

// populate selectors
function populateShowSelector(showsList) {
  const showSelector = document.getElementById("show-selector");
  showSelector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All shows";
  defaultOption.value = "";
  showSelector.appendChild(defaultOption);

  showsList.forEach(({ id, name }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    showSelector.appendChild(option);
  });
}

function populateSeasonSelector(episodes) {
  const seasonSelector = document.getElementById("season-selector");
  seasonSelector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All seasons";
  defaultOption.value = "";
  seasonSelector.appendChild(defaultOption);

  const availableSeasonsArray = Array.from(
    new Set(episodes.map((episode) => episode.season))
  );

  availableSeasonsArray.forEach((season) => {
    const seasonOption = document.createElement("option");
    seasonOption.value = `${season}`;
    seasonOption.textContent = `Season ${pad(season)}`;
    seasonSelector.appendChild(seasonOption);
  });
}

function populateEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All episodes";
  defaultOption.value = "";
  episodeSelector.appendChild(defaultOption);

  episodes.forEach(({ id, season, number, name }) => {
    const episodeOption = document.createElement("option");
    episodeOption.value = id;
    episodeOption.textContent = `S${pad(season)}E${pad(number)} - ${name}`;
    episodeSelector.appendChild(episodeOption);
  });
}

// main
function setup() {
  const state = {
    showsList: [],
    episodesList: [],
  };

  return {
    async fetchShowsFromEndPoint() {
      const shows = await fetchShows();
      state.showsList = shows;
    },
    renderPageForShows() {
      populateShowSelector(state.showsList);
      makePageForShows(state.showsList);
      state.episodesList = [];
      resetSearchTerm();
      updateEpisodeControls(state.episodesList);
      document.getElementById("episode-controls").style.display = "none";
    },
    addFunctionality() {
      document
        .getElementById("show-filter")
        .addEventListener("input", (e) =>
          handleShowFilter(e, state.showsList)
        );

      document
        .getElementById("show-selector")
        .addEventListener("change", async (e) => {
          const selectedShowId = e.target.value;
          if (!selectedShowId) return this.renderPageForShows();
          const episodes = await fetchEpisodes(selectedShowId);
          state.episodesList = episodes;
          handleShowSelector(state.episodesList);
        });

      document
        .getElementById("search-term-input")
        .addEventListener("input", (e) =>
          handleSearchTermInput(e, state.episodesList)
        );

      document
        .getElementById("season-selector")
        .addEventListener("change", (e) =>
          handleSeasonSelector(e, state.episodesList)
        );

      document
        .getElementById("episode-selector")
        .addEventListener("change", (e) =>
          handleEpisodeSelector(e, state.episodesList)
        );

      document
        .getElementById("nav-home")
        .addEventListener("click", () => this.renderPageForShows());
    },
  };
}

const fetchShows = fetchShowsOnce();
const fetchEpisodes = episodesFetcher();
const tvShow = setup();

window.onload = async () => {
  await tvShow.fetchShowsFromEndPoint();
  tvShow.renderPageForShows();
  tvShow.addFunctionality();
};
