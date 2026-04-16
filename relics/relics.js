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

const modalTelegramBtn = document.getElementById("modalTelegramBtn");
const modalWhatsappBtn = document.getElementById("modalWhatsappBtn");
const modalCollectionBtn = document.getElementById("modalCollectionBtn");

const modalClose = document.getElementById("relicsModalClose");
const modalBackdrop = document.getElementById("relicsModalBackdrop");

let relicItems = [];
let activeFilter = "all";
let visibleCount = 8;
const itemsPerPage = 8;

const collectionPackIds = [
  "thrones-old-gods-pack",
  "oaths-pack",
  "hearth-pack",
  "veils-sorcery-pack",
  "fangs-myth-pack",
  "singapore-pack"
];

const stickerPackIds = [
  "babayaga-sticker"
  ];

function render(items) {
  gallery.innerHTML = "";

  const visibleItems = items.slice(0, visibleCount);

  visibleItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "relics-card";
    card.dataset.category = item.category;

    card.innerHTML = `
      <div class="relics-card-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="relics-card-body">
        <p class="relics-tag">${item.category || ""}</p>
        <h2>${item.name}</h2>
        <p class="relics-price">${formatDualPrice(item.price)}</p>
      </div>
    `;

    card.addEventListener("click", () => openModal(item));
    gallery.appendChild(card);
  });

  loadMoreBtn.style.display =
    visibleCount < items.length ? "block" : "none";
}

function getFilteredItems() {
  let filtered = [...relicItems];

  if (activeFilter !== "all") {
    filtered = filtered.filter(item => item.category === activeFilter);
  }

  const priceRange = priceRangeFilter.value;
  if (priceRange !== "all") {
    filtered = filtered.filter(item => item.priceRange === priceRange);
  }

  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {filtered = filtered.filter(item =>
  (item.name || "").toLowerCase().includes(searchTerm) ||
  (item.symbol || "").toLowerCase().includes(searchTerm) ||
  (item.category || "").toLowerCase().includes(searchTerm) ||
  (item.type || "").toLowerCase().includes(searchTerm)
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
  updateFilterCounts(filtered);
}

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

loadMoreBtn.addEventListener("click", () => {
  visibleCount += itemsPerPage;
  applyFilters(false);
});

function openModal(item) {
  modalImage.src = item.image;
  modalImage.alt = item.name;
  modalCategory.textContent = item.category || "";
  modalName.textContent = item.name || "";
  modalMeta.textContent = item.type || "";
  modalPrice.textContent = formatDualPrice(item.price);
  modalDescription.textContent = item.description || "";
  modalMaterial.textContent = item.material || "-";
  modalSymbol.textContent = item.symbol || "-";
  modalOrigin.textContent = item.origin || "-";

  if (modalCollectionBtn) {
    if (collectionPackIds.includes(item.id)) {
      modalCollectionBtn.style.display = "inline-flex";
      modalCollectionBtn.textContent = "Enter the Card Collection";

      if (item.id === "singapore-pack") {
        modalCollectionBtn.href = "../cards/#singapore";
      } else {
        modalCollectionBtn.href = "../cards/#slavic";
      }
    } else if (stickerPackIds.includes(item.id)) {
      modalCollectionBtn.style.display = "inline-flex";
      modalCollectionBtn.href = "../stickers/#babayaga";
      modalCollectionBtn.textContent = "Enter the Sticker Collection";
    } else {
      modalCollectionBtn.style.display = "none";
      modalCollectionBtn.textContent = "Enter the Card Collection";
      modalCollectionBtn.href = "../cards/";
    }
  }

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

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeModal);
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
  }
});

function updateFilterCounts(items) {
  const counts = {
    all: items.length,
    Necklace: 0,
    "Card Pack": 0,
    "Watch Strap": 0,
    "Sticker Pack": 0
  };

  items.forEach(item => {
    if (counts[item.category] !== undefined) {
      counts[item.category]++;
    }
  });

  filterButtons.forEach(btn => {
    const key = btn.dataset.filter;

    let label = key;
    if (key === "all") {
      label = "All";
    } else if (key === "Necklace") {
      label = "Necklaces";
    } else if (key === "Card Pack") {
      label = "Card Pack";
    } else if (key === "Watch Strap") {
      label = "Watch Strap";
    } else if (key === "Sticker Pack") {
      label = "Sticker Pack";
    }

    btn.textContent = `${label} (${counts[key] || 0})`;
  });
}

function formatDualPrice(sgd) {
  const myr = (sgd * 3).toFixed(2);
  return `S$${sgd} / RM${myr}`;
}

async function initRelics() {
  try {
    const response = await fetch("./relics.json");

    if (!response.ok) {
      throw new Error(`Failed to load relics.json: ${response.status}`);
    }

    relicItems = await response.json();

    render(relicItems);
    updateFilterCounts(relicItems);
  } catch (error) {
    console.error("Error loading relic items:", error);
    gallery.innerHTML = `
      <p style="padding:20px; text-align:center;">
        Unable to load relics at the moment.
      </p>
    `;
    loadMoreBtn.style.display = "none";
  }
}

initRelics();
