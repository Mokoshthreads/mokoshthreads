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
  lightboxImg.alt = dial.alt || dial.title;

  lightboxCollection.textContent = collectionName;
  lightboxTitle.textContent = dial.title || "Untitled Dial";
  lightboxType.textContent = dial.type || "—";
  lightboxRarity.textContent = dial.rarity || "—";
  lightboxMadeIn.textContent = dial.madeIn || "—";
  lightboxYear.textContent = dial.year || "—";
  lightboxValue.textContent = dial.value || "—";

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
  button.setAttribute("aria-label", `Open ${dial.title}`);

  const img = document.createElement("img");
  img.src = dial.src;
  img.alt = dial.alt || dial.title;

  const caption = document.createElement("div");
  caption.className = "dial-card-caption";

  const title = document.createElement("p");
  title.className = "dial-card-title";
  title.textContent = dial.title;

  const subtitle = document.createElement("p");
  subtitle.className = "dial-card-subtitle";
  subtitle.textContent = dial.rarity;

  caption.appendChild(title);
  caption.appendChild(subtitle);

  button.appendChild(img);
  button.appendChild(caption);
  button.addEventListener("click", () => openLightbox(dial, collectionName));

  card.appendChild(button);
  return card;
}

function renderCollections() {
  dialCollections.forEach((collection) => {
    const grid = document.getElementById(collection.gridId);
    if (!grid) return;

    const items = dialData[collection.key] || [];
    grid.innerHTML = "";

    items.forEach((dial) => {
      grid.appendChild(createDialCard(dial, collection.fullName));
    });
  });
}

backdrop.addEventListener("click", closeLightbox);
closeBtn.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
  }
});

renderCollections();
