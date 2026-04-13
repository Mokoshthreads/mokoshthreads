const slavicGrid = document.getElementById("slavicnftsGrid");
const singaporeGrid = document.getElementById("singaporenftsGrid");

const lightbox = document.getElementById("cardsLightbox");
const lightboxImage = document.getElementById("cardsLightboxImage");
const lightboxClose = document.getElementById("cardsLightboxClose");
const lightboxBackdrop = document.getElementById("cardsLightboxBackdrop");

function createCardTile(src, alt) {
  const button = document.createElement("button");
  button.className = "card-tile";
  button.type = "button";
  button.setAttribute("aria-label", alt);

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";

  button.appendChild(img);

  button.addEventListener("click", () => {
    openLightbox(src, alt);
  });

  return button;
}

function openLightbox(src, alt) {
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("cards-lightbox-open");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.classList.remove("cards-lightbox-open");
}

function buildCollection(grid, folder, count, altPrefix) {
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(3, "0");
    const src = `./${folder}/card${num}.png`;
    const alt = `${altPrefix} ${i}`;
    grid.appendChild(createCardTile(src, alt));
  }
}

if (slavicGrid) {
  buildCollection(slavicnftsGrid, "slavicnfts", 9, "Slavic mythology card");
}

if (singaporeGrid) {
  buildCollection(singaporenftsGrid, "singaporenfts", 9, "Singapore mythology card");
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener("click", closeLightbox);
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) {
    closeLightbox();
  }
});
