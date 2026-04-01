import relicItems from "./relics-data.js";

const gallery = document.getElementById("relicsGallery");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const filterButtons = document.querySelectorAll(".filter-btn");
const priceRangeFilter = document.getElementById("priceRangeFilter");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("relicsSearch");

const modal = document.getElementById("relicsModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalCategory = document.getElementById("modalCategory");
const modalMeta = document.getElementById("modalMeta");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
const modalMaterial = document.getElementById("modalMaterial");
const modalSymbol = document.getElementById("modalSymbol");
const modalOrigin = document.getElementById("modalOrigin");

const modalBuyBtn = document.getElementById("modalBuyBtn");
const modalCollectionBtn = document.getElementById("modalCollectionBtn");

const modalClose = document.getElementById("relicsModalClose");
const modalBackdrop = document.getElementById("relicsModalBackdrop");

let activeFilter = "all";
let visibleCount = 8;
const itemsPerPage = 8;

// ✅ Move this OUTSIDE (cleaner)
const collectionPackIds = [
  "thrones-old-gods-pack",
  "oaths-crown-sword-pack",
  "whispers-hearth-forest-pack",
  "veils-sorcery-pack",
  "fangs-myth-oath-pack",
  "singapore-legends-pack"
];

// ======================
// RENDER
// ======================
function render(items) {
  gallery.innerHTML = "";

  const visibleItems = items.slice(0, visibleCount);

  visibleItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "relic-card";
    card.dataset.category = item.category;

    card.innerHTML = `
      <div class="relic-card-inner">
        <img src="${item.image}" alt="${item.name}" />
        <div class="relic-card-info">
          <p class="relic-card-name">${item.name}</p>
          <p class="relic-card-price">${formatDualPrice(item.price)}</p>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openModal(item));

    gallery.appendChild(card);
  });

  loadMoreBtn.style.display =
    visibleCount < items.length ? "block" : "none";
}

// ======================
// FILTERING
// ======================
function getFilteredItems() {
  let filtered = [...relicItems];

  if (activeFilter !== "all") {
    filtered = filtered.filter(item => item.category === activeFilter);
  }

  const priceRange = priceRangeFilter.value;
  if (priceRange !== "all") {
    filtered = filtered.filter(item => item.priceRange === priceRange);
  }

  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.symbol.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }

  const sortValue = sortSelect.value;

  if (sortValue === "price-low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-high-low") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortValue === "name-a-z") {
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

  // ✅ update counts dynamically
  updateFilterCounts(filtered);
}

// ======================
// FILTER BUTTONS
// ======================
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

priceRangeFilter.addEventListener("change", () => applyFilters());
sortSelect.addEventListener("change", () => applyFilters());
searchInput.addEventListener("input", () => applyFilters());

// ======================
// LOAD MORE
// ======================
loadMoreBtn.addEventListener("click", () => {
  visibleCount += itemsPerPage;
  applyFilters(false);
});

// ======================
// MODAL
// ======================
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

  // ✅ SHOW / HIDE COLLECTION BUTTON
  if (modalCollectionBtn) {
    if (collectionPackIds.includes(item.id)) {
      modalCollectionBtn.style.display = "inline-flex";
      modalCollectionBtn.href = "../cards/";
    } else {
      modalCollectionBtn.style.display = "none";
    }
  }

  // TELEGRAM LINK
  if (modalBuyBtn) {
    modalBuyBtn.href = `https://t.me/Wantwotwee?text=${encodeURIComponent(
      `Hi, I'm interested in ${item.name}`
    )}`;
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

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ======================
// FILTER COUNT LABELS
// ======================
function updateFilterCounts(items) {
  const counts = {
    all: items.length,
    Necklace: 0,
    "Card Pack": 0,
    "Watch Strap": 0
  };

  items.forEach(item => {
    if (counts[item.category] !== undefined) {
      counts[item.category]++;
    }
  });

  filterButtons.forEach(btn => {
    const key = btn.dataset.filter;
    const label =
      key === "all"
        ? "All"
        : key === "Necklace"
        ? "Necklaces"
        : key === "Card Pack"
        ? "Card Pack"
        : "Watch Strap";

    btn.textContent = `${label} (${counts[key] || 0})`;
  });
}

// ======================
// PRICE FORMAT
// ======================
function formatDualPrice(sgd) {
  const usd = (sgd * 0.74).toFixed(2);
  return `S$${sgd} / US$${usd}`;
}

// ======================
// INITIAL LOAD
// ======================
render(relicItems);
updateFilterCounts(relicItems);
