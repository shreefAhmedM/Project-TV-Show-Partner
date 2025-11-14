let allEpisodesList = [];
let currentSearchTerm = "";

function setup() {
  allEpisodesList = getAllEpisodes();
  makePageForEpisodes(allEpisodesList);
  populateEpisodeSelector(allEpisodesList);
  updateMatchCount(allEpisodesList.length, allEpisodesList.length);

  document
    .getElementById("search-input")
    .addEventListener("input", onSearchInput);
  document
    .getElementById("episode-option-selector")
    .addEventListener("change", onSelectorChange);
}

function onSearchInput(e) {
  currentSearchTerm = e.target.value.toLowerCase();
  document.getElementById("episode-option-selector").selectedIndex = 0;
  const filteredList = filterEpisodes(allEpisodesList, currentSearchTerm);
  makePageForEpisodes(filteredList);
  updateMatchCount(filteredList.length, allEpisodesList.length);
}

function onSelectorChange(e) {
  const val = e.target.value;
  document.getElementById("search-input").value = "";
  currentSearchTerm = "";
  if (!val) {
    makePageForEpisodes(allEpisodesList);
    updateMatchCount(allEpisodesList.length, allEpisodesList.length);
    return;
  }
  const [season, number] = val.split("-");
  const found = allEpisodesList.find(
    (ep) => ep.season === Number(season) && ep.number === Number(number)
  );
  makePageForEpisodes(found ? [found] : []);
  updateMatchCount(found ? 1 : 0, allEpisodesList.length);
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
  const selector = document.getElementById("episode-option-selector");
  selector.innerHTML = '<option value="">Show All Episodes</option>';
  episodes.forEach(({ name, season, number }) => {
    const opt = document.createElement("option");
    opt.value = `${season}-${number}`;
    opt.textContent = `S${String(season).padStart(2, "0")}E${String(
      number
    ).padStart(2, "0")} - ${name}`;
    selector.appendChild(opt);
  });
}

function updateMatchCount(filtered, total) {
  document.getElementById(
    "NumsOfEpisodes"
  ).textContent = `${filtered}/${total}`;
}
function createEpisodeCard({ name, season, number, url, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const nameEl = document.createElement("h3");
  nameEl.textContent = name;

  const seasonEl = document.createElement("p");
  seasonEl.textContent = `S${String(season).padStart(2, "0")}E${String(
    number
  ).padStart(2, "0")}`;

  const linkEl = document.createElement("a");
  linkEl.href = url;
  linkEl.target = "_blank";

  const imgEl = document.createElement("img");
  imgEl.src = image.medium;
  imgEl.alt = name;
  linkEl.appendChild(imgEl);

  const summaryEl = document.createElement("p");
  summaryEl.innerHTML = summary;

  card.append(nameEl, seasonEl, linkEl, summaryEl);

  return card;
}

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");

  root.innerHTML = "";
  const episodeCards = episodeList.map((episode) => createEpisodeCard(episode));
  root.append(...episodeCards);
}

window.onload = setup;
