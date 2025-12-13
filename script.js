// fetching functions

async function fetchShows() {
  loadingData();
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok)
      throw new Error(`Failed to fetch shows: ${response.status}`);
    const shows = await response.json();
    const sortedShows = shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    return sortedShows;
  } catch (error) {
    showError(error.message);
    throw new Error(`Response status: ${error.message}`);
  }
}

async function fetchingEpisodes(selectedShowId) {
  loadingData();
  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${selectedShowId}/episodes`
    );

    if (!response.ok)
      throw new Error(`Failed to fetch episodes: ${response.status}`);

    const episodes = await response.json();
    return episodes;
  } catch (error) {
    showError(error.message);
    throw new Error(`Response status: ${error.message}`);
  }
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

function padStartWithTwoZero(number) {
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

function imageMemory() {
  const imageCache = {};

  return function getImage(url, alt) {
    if (!imageCache[url]) {
      const img = new Image();
      img.src = url;
      img.alt = alt;
      imageCache[url] = img;
    }
    return imageCache[url];
  };
}

const getImage = imageMemory();

// create cards (shows, episodes)

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

  let imageElement;
  if (image && image.medium) {
    imageElement = getImage(image.medium, name);
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

  const nameElement = document.createElement("h2");
  nameElement.textContent = name;

  const seasonElement = document.createElement("h3");
  seasonElement.textContent = `S${padStartWithTwoZero(season)}E${padStartWithTwoZero(number)}`;

  const linkElement = document.createElement("a");
  linkElement.href = url;
  linkElement.target = "_blank";

  if (image && image.medium) {
    const imageElement = getImage(image.medium, name);
    linkElement.appendChild(imageElement);
  }

  const summaryElement = document.createElement("div");
  summaryElement.innerHTML = summary ?? "<p>No summary available.</p>";

  card.append(nameElement, seasonElement, linkElement, summaryElement);

  return card;
}

//Populate selectors (shows, seasons, and episodes)

function populateShowSelector(showsList) {
  const showSelector = document.getElementById("show-selector");

  showSelector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All shows";
  defaultOption.ariaLabel = "All shows";
  defaultOption.value = "";

  showSelector.appendChild(defaultOption);

  showsList.forEach(({ id, name }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    option.ariaLabel = name;
    showSelector.appendChild(option);
  });
}

function populateSeasonSelector(episodes) {
  const seasonSelector = document.getElementById("season-selector");
  seasonSelector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All seasons";
  defaultOption.ariaLabel = "All seasons";
  defaultOption.value = "";

  seasonSelector.appendChild(defaultOption);

  const availableSeasonsArray = Array.from(
    new Set(episodes.map((episodes) => episodes.season))
  );
  availableSeasonsArray.forEach((season) => {
    const seasonOption = document.createElement("option");
    seasonOption.value = `${season}`;
    seasonOption.textContent = `Season ${padStartWithTwoZero(season)}`;
    seasonOption.ariaLabel = `season${season}`;
    seasonSelector.appendChild(seasonOption);
  });
}

function populateEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All episodes";
  defaultOption.ariaLabel = "All episodes";
  defaultOption.value = "";

  episodeSelector.appendChild(defaultOption);

  episodes.forEach(({ id, season, number, name }) => {
    const episodeOption = document.createElement("option");
    const seasonAndEpisodeNumber = `S${padStartWithTwoZero(season)}E${padStartWithTwoZero(number)}`;
    episodeOption.value = id;
    episodeOption.textContent = `${seasonAndEpisodeNumber} - ${name}`;
    episodeOption.ariaLabel = name;
    episodeSelector.appendChild(episodeOption);
  });
}

// main function

function setup() {
  const state = {
    showsPromise: null,
    showsList: [],
    episodesList: [],
    episodesCache: {},
  };

  return {
    async fetchShowsFromEndPoint() {
      if (!state.showsPromise) {
        state.showsPromise = fetchShows();
      }
      const shows = await state.showsPromise;
      state.showsList = shows;
    },
    // default setting for the page
    renderPageForShows() {
      populateShowSelector(state.showsList);
      makePageForShows(state.showsList);
      state.episodesList = [];
      resetSearchTerm();
      updateEpisodeControls(state.episodesList);
      document.getElementById("episode-controls").style.display = "none";
    },
    addFunctionality() {
      const showFilter = document.getElementById("show-filter");
      showFilter.addEventListener("input", (e) => {
        handleShowFilter(e, state.showsList);
      });

      const showSelector = document.getElementById("show-selector");
      showSelector.addEventListener("change", async (e) => {
        const selectedShowId = e.target.value;
        if (!selectedShowId) {
          return this.renderPageForShows();
        }
        if (!state.episodesCache[selectedShowId]) {
          console.log("fetching a new show");
          state.episodesCache[selectedShowId] =
            fetchingEpisodes(selectedShowId);
        } else {
          console.log("already got this");
        }
        const episodes = await state.episodesCache[selectedShowId];
        state.episodesList = episodes;
        handleShowSelector(state.episodesList);
      });

      const searchTermInput = document.getElementById("search-term-input");
      searchTermInput.addEventListener("input", (e) =>
        handleSearchTermInput(e, state.episodesList)
      );

      const seasonSelector = document.getElementById("season-selector");
      seasonSelector.addEventListener("change", (e) =>
        handleSeasonSelector(e, state.episodesList)
      );

      const episodeSelector = document.getElementById("episode-selector");
      episodeSelector.addEventListener("change", (e) => {
        handleEpisodeSelector(e, state.episodesList);
      });

      const navHomeElement = document.getElementById("nav-home");
      navHomeElement.addEventListener("click", () => {
        this.renderPageForShows();
      });
    },
  };
}

const tvShow = setup();

window.onload = async () => {
  await tvShow.fetchShowsFromEndPoint();
  tvShow.renderPageForShows();
  tvShow.addFunctionality();
};
