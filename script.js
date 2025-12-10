async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error("Failed to fetch shows");
  const shows = await response.json();
  const sortedShows = shows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  return sortedShows;
}

async function fetchingEpisodes(selectedShowId) {
  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${selectedShowId}/episodes`
    );
    if (response.ok) {
      const episodes = await response.json();
      return episodes;
    }
  } catch (error) {
    throw new Error(`Response status: ${error.message}`);
  }
}

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

function handleSearchTermInput(e, allEpisodesList) {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  document.getElementById("season-selector").selectedIndex = 0;
  var filteredList = filterEpisodes(allEpisodesList, currentSearchTerm);
  updateMatchCount(filteredList.length, allEpisodesList.length);
  makePageForEpisodes(filteredList);
}

function handleSeasonSelector(e, allEpisodesList) {
  var seasonValue = e.target.value;
  document.getElementById("search-term-input").value = "";
  currentSearchTerm = "";
  if (!seasonValue) {
    makePageForEpisodes(allEpisodesList);
    updateMatchCount(allEpisodesList.length, allEpisodesList.length);
    return;
  }
  let episodesFoundList = allEpisodesList.filter(
    (episode) => episode.season === Number(seasonValue)
  );
  makePageForEpisodes(episodesFoundList ? episodesFoundList : []);
  updateMatchCount(
    episodesFoundList ? episodesFoundList.length : 0,
    allEpisodesList.length
  );
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
  selector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All seasons";
  defaultOption.ariaLabel = "All seasons";
  defaultOption.value = "";

  selector.appendChild(defaultOption);

  const availableSeasonsArray = Array.from(
    new Set(episodes.map((episodes) => episodes.season))
  );
  availableSeasonsArray.forEach((season) => {
    const seasonOption = document.createElement("option");
    seasonOption.value = `${season}`;
    seasonOption.textContent = `Season ${String(season).padStart(2, "0")}`;
    seasonOption.ariaLabel = `season${season}`;
    selector.appendChild(seasonOption);
  });

  const seasonFilterField = document.getElementById("season-filter");
  seasonFilterField.style.display = "block";
}

function updateMatchCount(filtered, total) {
  document.getElementById("numbers-of-episodes").textContent =
    `${filtered}/${total}`;
}

function padStartWithTwoZero(number) {
  return String(number).padStart(2, "0");
}

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
  showCard.className = "info-card";

  const nameElement = document.createElement("h2");
  nameElement.className = "show-name";
  nameElement.textContent = name;

  const imageElement = document.createElement("img");
  if (image && image.medium) {
    imageElement.src = image.medium;
    imageElement.alt = name;
  }

  const posterElement = document.createElement("div");
  posterElement.classList = "show-poster";
  posterElement.append(nameElement, imageElement);
  posterElement.addEventListener("click", async () => {
    const selectElement = document.getElementById("show-selector");
    selectElement.value = id;
    selectElement.dispatchEvent(new Event("change"));
  });

  const summaryElement = document.createElement("div");
  summaryElement.id = "show-summary";
  summaryElement.innerHTML = summary;

  const genresElement = document.createElement("h4");
  genresElement.textContent = `Genres: ${genres.length === 0 ? "N/A" : genres}`;

  const statusElement = document.createElement("h4");
  statusElement.textContent = `Status: ${status}`;

  const ratingElement = document.createElement("h4");
  ratingElement.textContent = `Rating: ${rating.average}`;

  const runtimeElement = document.createElement("div");
  runtimeElement.textContext = runtime;

  showCard.append(
    posterElement,
    summaryElement,
    genresElement,
    statusElement,
    ratingElement,
    runtimeElement
  );

  return showCard;
}

function populateShowSelector(showsList) {
  const selector = document.getElementById("show-selector");
  showsList.forEach(({ id, name }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    option.ariaLabel = name;
    selector.appendChild(option);
  });
}

function createEpisodeCard({ name, season, number, url, image, summary }) {
  const card = document.createElement("div");
  card.className = "info-card";

  const nameElement = document.createElement("h2");
  nameElement.textContent = name;

  const seasonElement = document.createElement("h3");
  seasonElement.textContent = `S${padStartWithTwoZero(season)}E${padStartWithTwoZero(number)}`;

  const linkElement = document.createElement("a");
  linkElement.href = url;
  linkElement.target = "_blank";

  if (image && image.medium) {
    const imageElement = document.createElement("img");
    imageElement.src = image.medium;
    imageElement.alt = name;
    linkElement.appendChild(imageElement);
  }

  const summaryElement = document.createElement("div");
  summaryElement.innerHTML = summary;

  card.append(nameElement, seasonElement, linkElement, summaryElement);

  return card;
}

function setup() {
  const state = {
    showsList: [],
    episodesList: [],
    currentSearchTerm: "",
    currentShowId: 0,
  };

  return {
    async fetchShowsFromEndPoint() {
      state.showsList = await fetchShows();
    },
    // Populate the show dropdown
    renderPageForShows() {
      populateShowSelector(state.showsList);
      makePageForShows(state.showsList);
    },
    addFunctionality() {
      const selectElement = document.getElementById("show-selector");
      selectElement.addEventListener("change", async () => {
        const selectedShowId = selectElement.value;
        if (!selectedShowId) return makePageForShows(state.showsList);

        document.getElementById("episode-search").value = "";
        state.currentSearchTerm = "";
        document.getElementById("search-term-input").value = "";
        if (selectedShowId !== state.currentShowId) {
          state.episodesList = await fetchingEpisodes(selectedShowId);
          state.currentShowId = selectedShowId;
          makePageForEpisodes(state.episodesList);
          populateSeasonSelector(state.episodesList);
          updateMatchCount(
            state.episodesList.length,
            state.episodesList.length
          );
        }
      });
      document
        .getElementById("search-term-input")
        .addEventListener("input", (e) =>
          handleSearchTermInput(e, state.episodesList)
        );

      const seasonSelector = document.getElementById("season-selector");
      seasonSelector.addEventListener("change", (e) =>
        handleSeasonSelector(e, state.episodesList)
      );
    },
  };
}

const tvShow = setup();

window.onload = async () => {
  await tvShow.fetchShowsFromEndPoint();
  tvShow.renderPageForShows();
  tvShow.addFunctionality();
};
