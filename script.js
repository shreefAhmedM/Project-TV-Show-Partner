let allEpisodesList = [];
let currentSearchTerm = "";
let showsList = [];
let episodesCache = {}; // cache episodes per show

// Fetch all shows from TVMaze and populate the show selector
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

// When user selects a show, fetch episodes (or use cache)
// document
//   .getElementById("show-selector")
//   .addEventListener("change", async (e) => {
//     const showId = e.target.value;
//     if (!episodesCache[showId]) {
//       const res = await fetch(
//         `https://api.tvmaze.com/shows/${showId}/episodes`
//       );
//       if (!res.ok) return alert("Failed to fetch episodes");
//       const episodes = await res.json();
//       episodesCache[showId] = episodes;
//     }
//     allEpisodesList = episodesCache[showId];
//     // reset filters
//     document.getElementById("search-term-input").value = "";
//     document.getElementById("season-selector").selectedIndex = 0;
//     makePageForEpisodes(allEpisodesList);
//     populateSeasonSelector(allEpisodesList);
//     updateMatchCount(allEpisodesList.length, allEpisodesList.length);
//   });

function handleSearchTermInput(e) {
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
  selector.innerHTML = "";
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

  if (image && image.medium) {
    const imgElement = document.createElement("img");
    imgElement.src = image.medium;
    imgElement.alt = name;
    linkElement.appendChild(imgElement);
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
    populateShowSelector() {
      const selector = document.getElementById("show-selector");
      state.showsList.forEach(({ id, name }) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        selector.appendChild(option);
      });
    },
    addFunctionality() {
      const selectElement = document.getElementById("show-selector");
      selectElement.addEventListener("change", async () => {
        const selectedShowId = selectElement.value;
        if (!selectedShowId) return;

        document.getElementById("episode-search").value = "";
        state.searchTeam = "";
        if (selectedShowId !== state.currentShowId) {
          state.episodesList = await fetchingEpisodes(selectedShowId);
          state.currentShowId = selectedShowId;
          makePageForEpisodes(state.episodesList);
          populateSeasonSelector(state.episodesList);
        }
      });
      document
        .getElementById("search-term-input")
        .addEventListener("input", handleSearchTermInput);

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
  tvShow.populateShowSelector();
  tvShow.addFunctionality();
};
