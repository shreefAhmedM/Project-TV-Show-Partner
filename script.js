//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function createEpisodeCard({ name, season, number, image, summary }) {
  const card = document.getElementById("episodeCard").content.cloneNode(true);
  card.getElementById("episodeName").textContent = name;
  card.getElementById("seasonEpisode").textContent = `S${String(
    season
  ).padStart(2, 0)}E${String(number).padStart(2, 0)}`;
  card.getElementById("episodeImage").src = image.medium;
  card.getElementById("episodeSummary").innerHTML = summary;
  return card;
}

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");
  const episodeCards = episodeList.map((episode) => createEpisodeCard(episode));
  root.append(...episodeCards);
}

window.onload = setup;
