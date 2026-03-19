async function loadWatches() {
  const gallery = document.getElementById("watchGallery");
  const searchInput = document.getElementById("watchSearch");

  try {
    const response = await fetch("./watches.json");
    const watches = await response.json();

    function render(items) {
      gallery.innerHTML = "";

      items.forEach((watch) => {
        const card = document.createElement("article");
        card.className = "watch-card";

        card.innerHTML = `
          <div class="watch-card-image">
            <img src="${watch.image}" alt="${watch.brand} ${watch.name}" />
          </div>
          <div class="watch-card-body">
            <p class="watch-brand">${watch.brand}</p>
            <h2>${watch.name}</h2>
            <p class="watch-meta">${watch.era} • ${watch.type}</p>
          </div>
        `;

        gallery.appendChild(card);
      });
    }

    render(watches);

    searchInput.addEventListener("input", function () {
      const term = this.value.toLowerCase();

      const filtered = watches.filter((watch) => {
        return (
          watch.name.toLowerCase().includes(term) ||
          watch.brand.toLowerCase().includes(term) ||
          watch.era.toLowerCase().includes(term) ||
          watch.type.toLowerCase().includes(term)
        );
      });

      render(filtered);
    });
  } catch (error) {
    gallery.innerHTML = "<p>Unable to load watches right now.</p>";
    console.error(error);
  }
}

loadWatches();
