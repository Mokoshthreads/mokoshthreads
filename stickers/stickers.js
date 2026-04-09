const grid = document.getElementById("babaYagaGrid");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const backdrop = document.getElementById("lightboxBackdrop");
const closeBtn = document.getElementById("lightboxClose");

// Generate 13 stickers automatically
for (let i = 1; i <= 13; i++) {
  const img = document.createElement("img");

  const num = String(i).padStart(2, "0");
  img.src = `../images/stickers/baba-yaga-bad-day/sticker${num}.png`;
  img.alt = `Sticker ${i}`;

  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.classList.add("open");
  });

  grid.appendChild(img);
}

// Close lightbox
function closeLightbox() {
  lightbox.classList.remove("open");
}

backdrop.addEventListener("click", closeLightbox);
closeBtn.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});
