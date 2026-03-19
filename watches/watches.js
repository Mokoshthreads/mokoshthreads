async function loadWatches() {
  const gallery = document.getElementById("watchGallery");
  const searchInput = document.getElementById("watchSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");

  try {
    const response = await fetch("./watches.json");
    const watches = await response.json();

    let activeFilter = "all";
    let searchTerm = "";

    function render(items) {
      gallery.innerHTML = "";

      if (items.length === 0) {
        gallery.innerHTML = "<p>No watches found.</p>";
        return;
      }

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
    <p class="watch-price">${watch.priceRange}</p>
  </div>
`;

        gallery.appendChild(card);
      });
    }

    function applyFilters() {
      const filtered = watches.filter((watch) => {
        const matchesSearch =
          watch.name.toLowerCase().includes(searchTerm) ||
          watch.brand.toLowerCase().includes(searchTerm) ||
          watch.era.toLowerCase().includes(searchTerm) ||
          watch.type.toLowerCase().includes(searchTerm);

        const matchesBrand =
          activeFilter === "all" || watch.brand === activeFilter;

        return matchesSearch && matchesBrand;
      });

      render(filtered);
    }

    render(watches);

    searchInput.addEventListener("input", function () {
      searchTerm = this.value.toLowerCase();
      applyFilters();
    });

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        activeFilter = this.dataset.filter;
        applyFilters();
      });
    });
  } catch (error) {
    gallery.innerHTML = "<p>Unable to load watches right now.</p>";
    console.error(error);
  }
}

loadWatches();
