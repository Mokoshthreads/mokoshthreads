async function loadClothing() {
  const gallery = document.getElementById("clothingGallery");
  const searchInput = document.getElementById("clothingSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("sortSelect");
  const priceRangeFilter = document.getElementById("priceRangeFilter");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  const modal = document.getElementById("clothingModal");
  const modalBackdrop = document.getElementById("clothingModalBackdrop");
  const modalClose = document.getElementById("clothingModalClose");
  const modalImage = document.getElementById("modalImage");
  const modalCategory = document.getElementById("modalCategory");
  const modalName = document.getElementById("modalName");
  const modalMeta = document.getElementById("modalMeta");
  const modalPrice = document.getElementById("modalPrice");
  const modalDescription = document.getElementById("modalDescription");
  const modalMaterial = document.getElementById("modalMaterial");
  const modalOrigin = document.getElementById("modalOrigin");
  const modalFit = document.getElementById("modalFit");
  const modalTelegramBtn = document.getElementById("modalTelegramBtn");
const modalWhatsappBtn = document.getElementById("modalWhatsappBtn");

  const SGD_TO_MYR = 3.10;

  function formatDualPrice(price) {
    if (!price && price !== 0) return "Price on request";
    const myrPrice = (price * SGD_TO_MYR).toFixed(2);
    return `S$${price} / RM${myrPrice}`;
  }

  try {
    const response = await fetch("./clothing.json");
    const clothingItems = await response.json();

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
        const style = item.style;

        if (category) {
          counts[category] = (counts[category] || 0) + 1;
        }

        if (style) {
          counts[style] = (counts[style] || 0) + 1;
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
      modalMeta.textContent = item.style || "";
      modalPrice.textContent = formatDualPrice(item.price);
      modalDescription.textContent = item.description || "";
      modalMaterial.textContent = item.material || "-";
      modalOrigin.textContent = item.origin || "-";
      modalFit.textContent = item.fit || "-";

      const enquiryMessage = `Hi, I'm interested in ${item.name}`;

if (modalTelegramBtn) {
  modalTelegramBtn.href = `https://t.me/Wantwotwee?text=${encodeURIComponent(enquiryMessage)}`;
}

if (modalWhatsappBtn) {
  modalWhatsappBtn.href = `https://wa.me/6589202646?text=${encodeURIComponent(enquiryMessage)}`;
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
        gallery.innerHTML = "<p>No clothing items found.</p>";
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
      }

      visibleItems.forEach((item) => {
        const card = document.createElement("article");
        card.className = "clothing-card";

        card.innerHTML = `
          <div class="clothing-card-image">
            <img src="${item.image}" loading="lazy" alt="${item.name}" />
          </div>
          <div class="clothing-card-body">
            <p class="clothing-tag">${item.category || ""}</p>
            <h2>${item.name}</h2>
            <p class="clothing-meta">${item.style || ""}</p>
            <p class="clothing-price">${formatDualPrice(item.price)}</p>
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
      let filtered = clothingItems.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm) ||
          (item.category || "").toLowerCase().includes(searchTerm) ||
          (item.style || "").toLowerCase().includes(searchTerm) ||
          (item.material || "").toLowerCase().includes(searchTerm);

        const matchesFilter =
          activeFilter === "all" ||
          item.category === activeFilter ||
          item.style === activeFilter;

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

    render(clothingItems);
    updateFilterCounts(clothingItems);

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
    gallery.innerHTML = "<p>Unable to load clothing right now.</p>";
    console.error(error);
  }
}

loadClothing();
