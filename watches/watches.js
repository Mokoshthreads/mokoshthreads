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
  const modalCollectionBtn = document.getElementById("modalCollectionBtn");
  const modalTelegramBtn = document.getElementById("modalTelegramBtn");
  const modalWhatsappBtn = document.getElementById("modalWhatsappBtn");

  const modalDescription = document.getElementById("modalDescription");
  const modalMovement = document.getElementById("modalMovement");
  const modalCase = document.getElementById("modalCase");
  const modalCondition = document.getElementById("modalCondition");

  const SGD_TO_MYR = 3.1;

  function formatDualPrice(price) {
    if (price === undefined || price === null || price === "") {
      return "Price on request";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price on request";
    }

    const myrPrice = (numericPrice * SGD_TO_MYR).toFixed(2);

    return `S$${numericPrice} / RM${myrPrice}`;
  }

  function getWatchPriceText(watch) {
    if (watch.sold === true) {
      return "SOLD";
    }

    return formatDualPrice(watch.price);
  }

  try {
    const response = await fetch("./watches.json");

    if (!response.ok) {
      throw new Error(`Unable to load watches.json: ${response.status}`);
    }

    const watches = await response.json();

    if (!Array.isArray(watches)) {
      throw new Error("watches.json must contain an array of watches.");
    }

    function getAvailableWatches(items) {
      return items.filter((watch) => watch.sold !== true);
    }

    function getSoldWatches(items) {
      return items.filter((watch) => watch.sold === true);
    }

    function getBrandCounts(items) {
      const counts = {};

      items.forEach((watch) => {
        if (!watch.brand) return;

        counts[watch.brand] = (counts[watch.brand] || 0) + 1;
      });

      return counts;
    }

    function updateFilterCounts(items) {
      const availableWatches = getAvailableWatches(items);
      const soldWatches = getSoldWatches(items);
      const counts = getBrandCounts(availableWatches);

      filterButtons.forEach((button) => {
        const filter = button.dataset.filter;

        if (filter === "all") {
          button.textContent = `All (${availableWatches.length})`;
        } else if (filter === "sold") {
          button.textContent = `SOLD (${soldWatches.length})`;
        } else {
          button.textContent = `${filter} (${counts[filter] || 0})`;
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

      const match = String(era).match(/\d{4}/);

      if (match) {
        return parseInt(match[0], 10);
      }

      return 0;
    }

    function openModal(watch) {
      modalImage.src = watch.image || "";
      modalImage.alt = `${watch.brand || ""} ${watch.name || ""}`.trim();

      modalBrand.textContent = watch.brand || "";
      modalName.textContent = watch.name || "";
      modalMeta.textContent = [watch.era, watch.type]
        .filter(Boolean)
        .join(" • ");

      modalPrice.textContent = getWatchPriceText(watch);
      modalPrice.classList.toggle("is-sold", watch.sold === true);

      if (modalCollectionBtn) {
        if (watch.collectionLink) {
          modalCollectionBtn.style.display = "inline-flex";
          modalCollectionBtn.href = watch.collectionLink;
          modalCollectionBtn.textContent =
            watch.collectionButtonText || "Browse Collection";
        } else {
          modalCollectionBtn.style.display = "none";
          modalCollectionBtn.href = "#";
          modalCollectionBtn.textContent = "Browse Collection";
        }
      }

      const enquiryMessage =
        `Hi, I'm interested in ${watch.brand || ""} ${watch.name || ""}`.trim();

      if (watch.sold === true) {
        if (modalTelegramBtn) {
          modalTelegramBtn.style.display = "none";
          modalTelegramBtn.removeAttribute("href");
        }

        if (modalWhatsappBtn) {
          modalWhatsappBtn.style.display = "none";
          modalWhatsappBtn.removeAttribute("href");
        }
      } else {
        if (modalTelegramBtn) {
          modalTelegramBtn.style.display = "inline-flex";
          modalTelegramBtn.href =
            `https://t.me/Wantwotwee?text=${encodeURIComponent(enquiryMessage)}`;
        }

        if (modalWhatsappBtn) {
          modalWhatsappBtn.style.display = "inline-flex";
          modalWhatsappBtn.href =
            `https://wa.me/6589202646?text=${encodeURIComponent(enquiryMessage)}`;
        }
      }

      modalDescription.textContent = watch.description || "";
      modalMovement.textContent = watch.movement || "-";
      modalCase.textContent = watch.caseShape || "-";
      modalCondition.textContent = watch.condition || "-";

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
        const emptyMessage =
          activeFilter === "sold"
            ? "No sold watches found."
            : "No watches found.";

        gallery.innerHTML = `<p>${emptyMessage}</p>`;

        if (loadMoreBtn) {
          loadMoreBtn.style.display = "none";
        }

        return;
      }

      visibleItems.forEach((watch) => {
        const card = document.createElement("article");

        card.className = watch.sold === true
          ? "watch-card is-sold"
          : "watch-card";

        card.innerHTML = `
          <div class="watch-card-image">
            <img
              src="${watch.image || ""}"
              loading="lazy"
              alt="${watch.brand || ""} ${watch.name || ""}"
            />

            ${
              watch.sold === true
                ? '<span class="sold-badge">SOLD</span>'
                : ""
            }
          </div>

          <div class="watch-card-body">
            <p class="watch-brand">${watch.brand || ""}</p>
            <h2>${watch.name || ""}</h2>

            <p class="watch-meta">
              ${[watch.era, watch.type].filter(Boolean).join(" • ")}
            </p>

            <p class="watch-price ${
              watch.sold === true ? "is-sold" : ""
            }">
              ${getWatchPriceText(watch)}
            </p>
          </div>
        `;

        card.addEventListener("click", () => openModal(watch));
        gallery.appendChild(card);
      });

      if (loadMoreBtn) {
        loadMoreBtn.style.display =
          items.length > visibleCount ? "inline-block" : "none";
      }
    }

    function matchesWatchSearch(watch) {
      const searchableText = [
        watch.name,
        watch.brand,
        watch.era,
        watch.type,
        watch.description,
        watch.movement,
        watch.condition
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    }

    function matchesSelectedCategory(watch) {
      if (activeFilter === "sold") {
        return watch.sold === true;
      }

      if (watch.sold === true) {
        return false;
      }

      if (activeFilter === "all") {
        return true;
      }

      return watch.brand === activeFilter;
    }

    function matchesSelectedPriceRange(watch) {
      if (activePriceRange === "all") {
        return true;
      }

      return watch.priceRange === activePriceRange;
    }

    function getFilteredItems() {
      let filtered = watches.filter((watch) => {
        return (
          matchesWatchSearch(watch) &&
          matchesSelectedCategory(watch) &&
          matchesSelectedPriceRange(watch)
        );
      });

      if (activeSort === "price-low-high") {
        filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      } else if (activeSort === "price-high-low") {
        filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      } else if (activeSort === "brand-a-z") {
        filtered.sort((a, b) =>
          String(a.brand || "").localeCompare(String(b.brand || ""))
        );
      } else if (activeSort === "era-old-new") {
        filtered.sort(
          (a, b) => eraToNumber(a.era) - eraToNumber(b.era)
        );
      } else if (activeSort === "era-new-old") {
        filtered.sort(
          (a, b) => eraToNumber(b.era) - eraToNumber(a.era)
        );
      }

      return filtered;
    }

    function applyFilters(resetVisible = true) {
      if (resetVisible) {
        visibleCount = itemsPerPage;
      }

      render(getFilteredItems());
    }

    updateFilterCounts(watches);
    applyFilters(true);

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchTerm = this.value.trim().toLowerCase();
        applyFilters(true);
      });
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => {
          btn.classList.remove("active");
        });

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

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", closeModal);
    }

    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        modal.classList.contains("open")
      ) {
        closeModal();
      }
    });
  } catch (error) {
    gallery.innerHTML = "<p>Unable to load watches right now.</p>";
    console.error("Watch loading error:", error);
  }
}

loadWatches();
