//You can edit ALL of the code here
function setup() {
  const state = {
    episodes: [],
    searchTerm: "",
  };
  return {
    fetchAllEpisodes() {
      state.episodes = getAllEpisodes();
    },
    createEpisodeCard({ name, season, number, url, image, summary }) {
      const card = document
        .getElementById("episodeCard")
        .content.cloneNode(true);
      card.getElementById("episodeName").textContent = name;
      card.getElementById("seasonEpisode").textContent = `S${String(
        season
      ).padStart(2, 0)}E${String(number).padStart(2, 0)}`;
      card.getElementById("episodeLink").href = url;
      card.getElementById("episodeImage").src = image.medium;
      card.getElementById("episodeSummary").innerHTML = summary;
      return card;
    },
    render() {
      this.fetchAllEpisodes();
      const root = document.getElementById("root");
      const episodeCards = state.episodes.map((episode) =>
        this.createEpisodeCard(episode)
      );
      root.append(...episodeCards);
    },
  };
}

window.onload = setup().render();
