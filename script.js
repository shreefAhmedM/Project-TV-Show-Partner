//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function createEpisodeCard() {}

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");
  const card = document.getElementById("episodeCard").content.cloneNode(true);
  card.getElementById("episodeName").textContent = episodeList[0].name;
  card.getElementById("seasonEpisode").textContent = `S${String(
    episodeList[0].season
  ).padStart(2, 0)}E${(String(episodeList[0].number).padStart2, 0)}`;
  card.getElementById("episodeImage").src = episodeList[0].image.medium;
  card.getElementById("episodeSummary").innerHTML = episodeList[0].summary;
  root.append(card);
}

window.onload = setup;
