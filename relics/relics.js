async function loadRelics() {
  const gallery = document.getElementById("relicsGallery");
  const searchInput = document.getElementById("relicsSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("sortSelect");
  const priceRangeFilter = document.getElementById("priceRangeFilter");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  const modal = document.getElementById("relicsModal");
  const modalBackdrop = document.getElementById("relicsModalBackdrop");
  const modalClose = document.getElementById("relicsModalClose");
  const modalImage = document.getElementById("modalImage");
  const modalCategory = document.getElementById("modalCategory");
  const modalName = document.getElementById("modalName");
  const modalMeta = document.getElementById("modalMeta");
  const modalPrice = document.getElementById("modalPrice");
  const modalDescription = document.getElementById("modalDescription");
  const modalMaterial = document.getElementById("modalMaterial");
  const modalSymbol = document.getElementById("modalSymbol");
  const modalOrigin = document.getElementById("modalOrigin");
  const modalBuyBtn = document.getElementById("modalBuyBtn");
  const modalCollectionBtn = document.getElementById("modalCollectionBtn");

  const SGD_TO_MYR = 3.10;

  function formatDualPrice(price) {
    if (!price && price !== 0) return "Price on request";
    const myrPrice = (price * SGD_TO_MYR).toFixed(2);
    return `S$${price} / RM${myrPrice}`;
  }

  try {
    const response = await fetch("./relics.json");
    const relicItems = await response.json();

    let activeFilter = "all";
    let searchTerm = "";
    let activeSort = "default";
    let activePriceRange = "all";

    const itemsPerPage = 12;
    let visibleCount = itemsPerPage;

    function getCategoryCounts(items) {
      const counts = {};

      items.forEach((item) => {
        const category = item.category;

        if (category) {
          counts[category] = (counts[category] || 0) + 1;
        }
      });

      return counts;
    }

    function updateFilterCounts(items) {
      const counts = getCategoryCounts(items);

      filterButtons.forEach((button) => {
        const filter = button.dataset.filter;

        if (filter === "all") {
          button.textContent = `All (${items.length})`;
        } else {
          const count = counts[filter] || 0;
          button.textContent = `${filter} (${count})`;
        }
      });
    }

    function openModal(item) {
      modalImage.src = item.image;
      modalImage.alt = item.name;
      modalCategory.textContent = item.category || "";
      modalName.textContent = item.name;
      modalMeta.textContent = item.type || "";
      modalPrice.textContent = formatDualPrice(item.price);
      modalDescription.textContent = item.description || "";
      modalMaterial.textContent = item.material || "-";
      modalSymbol.textContent = item.symbol || "-";
      modalOrigin.textContent = item.origin || "-";
      
      const collectionPackIds = [
  "thrones-old-gods-pack",
  "oaths-crown-sword-pack",
  "whispers-hearth-forest-pack",
  "veils-sorcery-pack",
  "fangs-myth-oath-pack",
  "singapore-legends-pack"
];

if (collectionPackIds.includes(item.id)) {
  modalCollectionBtn.style.display = "inline-flex";
  modalCollectionBtn.href = "../cards/";
} else {
  modalCollectionBtn.style.display = "none";
}

      if (modalBuyBtn) {
        modalBuyBtn.href = `https://t.me/Wantwotwee?text=${encodeURIComponent(`Hi, I'm interested in ${item.name}`)}`;
      }

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
        gallery.innerHTML = "<p>No relics found.</p>";
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
      }

      visibleItems.forEach((item) => {
        const card = document.createElement("article");
        card.className = "relics-card";

        card.innerHTML = `
          <div class="relics-card-image">
            <img src="${item.image}" loading="lazy" alt="${item.name}" />
          </div>
          <div class="relics-card-body">
            <p class="relics-tag">${item.category || ""}</p>
            <h2>${item.name}</h2>
            <p class="relics-meta">${item.type || ""}</p>
            <p class="relics-price">${formatDualPrice(item.price)}</p>
          </div>
        `;

        card.addEventListener("click", () => openModal(item));
        gallery.appendChild(card);
      });

      if (loadMoreBtn) {
        loadMoreBtn.style.display = items.length > visibleCount ? "inline-block" : "none";
      }
    }

    function getFilteredItems() {
      let filtered = relicItems.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm) ||
          (item.category || "").toLowerCase().includes(searchTerm) ||
          (item.type || "").toLowerCase().includes(searchTerm) ||
          (item.symbol || "").toLowerCase().includes(searchTerm);

        const matchesFilter =
          activeFilter === "all" || item.category === activeFilter;

        const matchesPriceRange =
          activePriceRange === "all" || item.priceRange === activePriceRange;

        return matchesSearch && matchesFilter && matchesPriceRange;
      });

      if (activeSort === "price-low-high") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (activeSort === "price-high-low") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (activeSort === "name-a-z") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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

    render(relicItems);
    updateFilterCounts(relicItems);

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
    gallery.innerHTML = "<p>Unable to load relics right now.</p>";
    console.error(error);
  }
}

loadRelics();
