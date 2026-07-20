const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTo);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const closeButton = lightbox.querySelector(".lightbox-close");

function openLightbox(button) {
  lightboxImage.src = button.dataset.image;
  lightboxImage.alt = `${button.dataset.title} catalogue panel`;
  lightboxCaption.textContent = button.dataset.title;
  lightbox.showModal();
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.close();
  document.body.style.overflow = "";
  lightboxImage.src = "";
}

document.querySelectorAll(".catalogue-page").forEach((button) => {
  button.addEventListener("click", () => openLightbox(button));
});

closeButton.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.classList.contains("lightbox-stage")) {
    closeLightbox();
  }
});

lightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLightbox();
});
