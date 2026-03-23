async function loadWatches() {
  const gallery = document.getElementById("watchGallery");
  const searchInput = document.getElementById("watchSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("sortSelect");
  const priceRangeFilter = document.getElementById("priceRangeFilter");

  const modal = document.getElementById("watchModal");
  const modalBackdrop = document.getElementById("watchModalBackdrop");
  const modalClose = document.getElementById("watchModalClose");
  const modalImage = document.getElementById("modalImage");
  const modalBrand = document.getElementById("modalBrand");
  const modalName = document.getElementById("modalName");
  const modalMeta = document.getElementById("modalMeta");
  const modalPrice = document.getElementById("modalPrice");

  try {
    const response = await fetch("./watches.json");
    const watches = await response.json();

    let activeFilter = "all";
    let searchTerm = "";
    let activeSort = "default";
    let activePriceRange = "all";

    function eraToNumber(era) {
      if (!era) return 0;
      const match = era.match(/\d{4}/);
      if (match) return parseInt(match[0], 10);
      const decadeMatch = era.match(/\d{4}s/);
      if (decadeMatch) return parseInt(decadeMatch[0], 10);
      return 0;
    }

    function openModal(watch) {
      modalImage.src = watch.image;
      modalImage.alt = `${watch.brand} ${watch.name}`;
      modalBrand.textContent = watch.brand;
      modalName.textContent = watch.name;
      modalMeta.textContent = `${watch.era} • ${watch.type}`;
      modalPrice.textContent = watch.priceRange;

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }

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

        card.addEventListener("click", () => openModal(watch));
        gallery.appendChild(card);
      });
    }

    function applyFilters() {
      let filtered = watches.filter((watch) => {
        const matchesSearch =
          watch.name.toLowerCase().includes(searchTerm) ||
          watch.brand.toLowerCase().includes(searchTerm) ||
          watch.era.toLowerCase().includes(searchTerm) ||
          watch.type.toLowerCase().includes(searchTerm);

        const matchesBrand =
          activeFilter === "all" || watch.brand === activeFilter;

        const matchesPriceRange =
          activePriceRange === "all" || watch.priceRange === activePriceRange;

        return matchesSearch && matchesBrand && matchesPriceRange;
      });

      if (activeSort === "price-low-high") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (activeSort === "price-high-low") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (activeSort === "brand-a-z") {
        filtered.sort((a, b) => a.brand.localeCompare(b.brand));
      } else if (activeSort === "era-old-new") {
        filtered.sort((a, b) => eraToNumber(a.era) - eraToNumber(b.era));
      } else if (activeSort === "era-new-old") {
        filtered.sort((a, b) => eraToNumber(b.era) - eraToNumber(a.era));
      }

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

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        activeSort = this.value;
        applyFilters();
      });
    }

    if (priceRangeFilter) {
      priceRangeFilter.addEventListener("change", function () {
        activePriceRange = this.value;
        applyFilters();
      });
    }

    modalBackdrop.addEventListener("click", closeModal);
    modalClose.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  } catch (error) {
    gallery.innerHTML = "<p>Unable to load watches right now.</p>";
    console.error(error);
  }
}

loadWatches();
