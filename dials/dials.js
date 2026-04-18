const collectionConfig = {
  ur: {
    gridId: "urDialGrid",
    countId: "urCount",
    shortName: "UR Collection",
    fullName: "Ultimate Rare Dial Collection"
  },
  sr: {
    gridId: "srDialGrid",
    countId: "srCount",
    shortName: "SR Collection",
    fullName: "Special Rare Dial Collection"
  },
  r: {
    gridId: "rDialGrid",
    countId: "rCount",
    shortName: "R Collection",
    fullName: "Rare Dial Collection"
  },
  uc: {
    gridId: "ucDialGrid",
    countId: "ucCount",
    shortName: "UC Collection",
    fullName: "Uncommon Dial Collection"
  },
  n: {
    gridId: "nDialGrid",
    countId: "nCount",
    shortName: "N Collection",
    fullName: "Normal Dial Collection"
  }
};

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const backdrop = document.getElementById("lightboxBackdrop");
const closeBtn = document.getElementById("lightboxClose");

const lightboxCollection = document.getElementById("lightboxCollection");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxType = document.getElementById("lightboxType");
const lightboxRarity = document.getElementById("lightboxRarity");
const lightboxMadeIn = document.getElementById("lightboxMadeIn");
const lightboxYear = document.getElementById("lightboxYear");
const lightboxValue = document.getElementById("lightboxValue");

function openLightbox(dial, collectionName) {
  lightboxImg.src = dial.src;
  lightboxImg.alt = dial.alt || dial.title || "Dial image";

  lightboxCollection.textContent = collectionName;
  lightboxTitle.textContent = dial.title || "Untitled Dial";
  lightboxType.textContent = dial.description || "—";
  lightboxRarity.textContent = dial.rarity || "—";
  lightboxMadeIn.textContent = dial.madeIn || "—";
  lightboxYear.textContent = dial.yearOfManufacture || "—";
  lightboxValue.textContent = dial.estimatedValue || "—";

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function createDialCard(dial, collectionName) {
  const card = document.createElement("article");
  card.className = "dial-card";

  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", `Open ${dial.title || "dial"}`);

  const img = document.createElement("img");
  img.src = dial.src;
  img.alt = dial.alt || dial.title || "Dial image";

  const caption = document.createElement("div");
  caption.className = "dial-card-caption";

  const title = document.createElement("p");
  title.className = "dial-card-title";
  title.textContent = dial.title || "Untitled Dial";

  const subtitle = document.createElement("p");
  subtitle.className = "dial-card-subtitle";
  subtitle.textContent = dial.rarity || collectionName;

  caption.appendChild(title);
  caption.appendChild(subtitle);

  button.appendChild(img);
  button.appendChild(caption);

  button.addEventListener("click", () => {
    openLightbox(dial, collectionName);
  });

  card.appendChild(button);
  return card;
}

function renderCollection(key, items) {
  const config = collectionConfig[key];
  if (!config) return;

  const grid = document.getElementById(config.gridId);
  const count = document.getElementById(config.countId);

  if (!grid || !count) return;

  grid.innerHTML = "";
  count.textContent = `${items.length} Dials`;

  items.forEach((dial) => {
    grid.appendChild(createDialCard(dial, config.fullName));
  });
}

async function loadDialData() {
  try {
    const response = await fetch("./dials-data.json");

    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }

    const data = await response.json();

    Object.keys(collectionConfig).forEach((key) => {
      renderCollection(key, data[key] || []);
    });
  } catch (error) {
    console.error("Error loading dial data:", error);
  }
}

backdrop.addEventListener("click", closeLightbox);
closeBtn.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
  }
});

loadDialData();
