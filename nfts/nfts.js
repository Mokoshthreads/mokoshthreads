const grid = document.getElementById("slavicMythsGrid");
const countEl = document.getElementById("slavicMythsCount");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const backdrop = document.getElementById("lightboxBackdrop");
const closeBtn = document.getElementById("lightboxClose");

async function loadNFTs() {
  try {
    const response = await fetch("./nfts.json");
    const data = await response.json();

    const collection = data.collections.find(
      (item) => item.id === "slavic-myths"
    );

    if (!collection || !collection.items || !collection.items.length) {
      grid.innerHTML = `<p class="nfts-empty">No NFTs available yet.</p>`;
      return;
    }

    countEl.textContent = `${collection.items.length} NFTs`;

    collection.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "nft-card";

      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" />
        <div class="nft-card-body">
          <p class="nft-card-title">${item.title}</p>
          <p class="nft-card-meta">${item.label || "Mokosh NFT"}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        lightboxImg.src = item.image;
        lightboxImg.alt = item.title;
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
      });

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Unable to load NFTs:", error);
    grid.innerHTML = `<p class="nfts-empty">Unable to load NFTs right now.</p>`;
  }
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

backdrop.addEventListener("click", closeLightbox);
closeBtn.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
  }
});

loadNFTs();
