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
    updateSearchTerm() {
      const searchTermInput = document.getElementById("search-input");
      state.searchTerm = searchTermInput.value;
      document.getElementById("show").innerHTML = "";
      this.render();
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
      const show = document.getElementById("show");
      const filteredEpisodes = state.episodes.filter(({ name }) =>
        name.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
      const episodeCards = filteredEpisodes.map((episode) =>
        this.createEpisodeCard(episode)
      );
      show.append(...episodeCards);
    },
  };
}

const gameOfThrones = setup();

window.onload = () => {
  gameOfThrones.fetchAllEpisodes();
  gameOfThrones.render();

  const searchTermInput = document.getElementById("search-input");
  searchTermInput.addEventListener("keyup", () => {
    gameOfThrones.updateSearchTerm();
  });
};
