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
