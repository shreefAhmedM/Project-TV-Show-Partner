function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
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
