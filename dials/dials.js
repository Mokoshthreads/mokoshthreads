const normalGrid = document.getElementById("normalDialGrid");
const premiumGrid = document.getElementById("premiumDialGrid");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const backdrop = document.getElementById("lightboxBackdrop");
const closeBtn = document.getElementById("lightboxClose");

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.classList.remove("modal-open");
}

function createDialImage(src, alt) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;

  img.addEventListener("click", () => {
    openLightbox(src, alt);
  });

  return img;
}

// Normal $10 collection: 30 dials
for (let i = 1; i <= 30; i++) {
  const num = String(i).padStart(2, "0");
  const src = `../images/dials/normal/dial${num}.png`;
  const alt = `$10 Normal Dial ${i}`;
  normalGrid.appendChild(createDialImage(src, alt));
}

// Premium $20 collection: 30 dials
for (let i = 1; i <= 30; i++) {
  const num = String(i).padStart(2, "0");
  const src = `../images/dials/premium/dial${num}.png`;
  const alt = `$20 Premium Dial ${i}`;
  premiumGrid.appendChild(createDialImage(src, alt));
}

backdrop.addEventListener("click", closeLightbox);
closeBtn.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
  }
});
