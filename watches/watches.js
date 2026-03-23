async function loadWatches() {
  const gallery = document.getElementById("watchGallery");
  const searchInput = document.getElementById("watchSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("sortSelect");
  const priceRangeFilter = document.getElementById("priceRangeFilter");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

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
   function getBrandCounts(items) {
  const counts = {};

  items.forEach((watch) => {
    const brand = watch.brand;
    counts[brand] = (counts[brand] || 0) + 1;
  });

  return counts;
}

function updateFilterCounts(items) {
  const counts = getBrandCounts(items);

  filterButtons.forEach((button) => {
    const brand = button.dataset.filter;

    if (brand === "all") {
      button.textContent = `All (${items.length})`;
    } else {
      const count = counts[brand] || 0;
      button.textContent = `${brand} (${count})`;
    }
  });
}

    let activeFilter = "all";
    let searchTerm = "";
    let activeSort = "default";
    let activePriceRange = "all";

    const itemsPerPage = 12;
    let visibleCount = itemsPerPage;

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
      modalPrice.textContent = watch.price ? `$${watch.price}` : "Price on request";
        
      const modalBuyBtn = document.getElementById("modalBuyBtn");
      if (modalBuyBtn) {
        modalBuyBtn.href = `https://t.me/Wantwotwee?text=${encodeURIComponent(`Hi, I'm interested in ${watch.brand} ${watch.name}`)}`;
      }

      document.getElementById("modalDescription").textContent = watch.description || "";
      document.getElementById("modalMovement").textContent = watch.movement || "-";
      document.getElementById("modalCase").textContent = watch.caseShape || "-";
      document.getElementById("modalCondition").textContent = watch.condition || "-";

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

      const visibleItems = items.slice(0, visibleCount);

      if (visibleItems.length === 0) {
        gallery.innerHTML = "<p>No watches found.</p>";
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
      }

      visibleItems.forEach((watch) => {
        const card = document.createElement("article");
        card.className = "watch-card";

        card.innerHTML = `
          <div class="watch-card-image">
            <img src="${watch.image}" loading="lazy" alt="${watch.brand} ${watch.name}" />
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

      if (loadMoreBtn) {
        loadMoreBtn.style.display = items.length > visibleCount ? "inline-block" : "none";
      }
    }

    function getFilteredItems() {
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

      return filtered;
    }

    function applyFilters(resetVisible = true) {
      if (resetVisible) {
        visibleCount = itemsPerPage;
      }

      const filtered = getFilteredItems();
      render(filtered);
    }

    render(watches);
    updateFilterCounts(watches);

    searchInput.addEventListener("input", function () {
      searchTerm = this.value.toLowerCase();
      applyFilters(true);
    });

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        activeFilter = this.dataset.filter;
        applyFilters(true);
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        activeSort = this.value;
        applyFilters(true);
      });
    }

    if (priceRangeFilter) {
      priceRangeFilter.addEventListener("change", function () {
        activePriceRange = this.value;
        applyFilters(true);
      });
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", function () {
        visibleCount += itemsPerPage;
        render(getFilteredItems());
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
