"use strict";

const workshopGrid = document.getElementById("workshopGrid");

const modal = document.getElementById("workshopModal");
const modalImage = document.getElementById("modalImage");
const modalCategory = document.getElementById("modalCategory");
const modalStatus = document.getElementById("modalStatus");
const modalTitle = document.getElementById("modalTitle");
const modalSummary = document.getElementById("modalSummary");
const modalDuration = document.getElementById("modalDuration");
const modalPrice = document.getElementById("modalPrice");
const modalLocation = document.getElementById("modalLocation");
const modalLevel = document.getElementById("modalLevel");
const modalDescription = document.getElementById("modalDescription");
const modalProgramme = document.getElementById("modalProgramme");
const modalInclusions = document.getElementById("modalInclusions");
const modalSignupButton = document.getElementById("modalSignupButton");

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.getElementById("mainNav");

let workshops = [];
let lastFocusedElement = null;


/* =========================================================
   LOAD WORKSHOPS
   ========================================================= */

async function loadWorkshops() {
  try {
    const response = await fetch("workshops.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load workshops. HTTP status: ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new TypeError("The workshop data must be an array.");
    }

    workshops = data.filter(isValidWorkshop);
    renderWorkshops(workshops);
  } catch (error) {
    console.error("Workshop loading error:", error);

    workshopGrid.innerHTML = `
      <div class="error-state">
        <p>
          We could not load the workshop information.
          Please refresh the page or contact Mokosh Threads directly.
        </p>
      </div>
    `;
  }
}


/* =========================================================
   BASIC DATA VALIDATION
   ========================================================= */

function isValidWorkshop(workshop) {
  return (
    workshop &&
    typeof workshop.id === "string" &&
    typeof workshop.title === "string" &&
    typeof workshop.summary === "string"
  );
}


/* =========================================================
   RENDER WORKSHOP CARDS
   ========================================================= */

function renderWorkshops(items) {
  workshopGrid.innerHTML = "";

  if (items.length === 0) {
    workshopGrid.innerHTML = `
      <div class="empty-state">
        <p>
          No workshops are currently listed.
          Please check again soon.
        </p>
      </div>
    `;

    return;
  }

  items.forEach((workshop) => {
    const card = document.createElement("article");

    card.className = "workshop-card reveal";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `View details for ${workshop.title}`
    );

    card.innerHTML = `
      <img
        class="workshop-card-image"
        src="${escapeAttribute(workshop.image || "assets/workshop-placeholder.webp")}"
        alt="${escapeAttribute(workshop.imageAlt || workshop.title)}"
      >

      <div class="workshop-card-overlay"></div>

      <div class="workshop-card-content">

        <p class="workshop-card-status">
          ${escapeHTML(workshop.status || "Workshop")}
        </p>

        <h3>${escapeHTML(workshop.title)}</h3>

        <p class="workshop-card-summary">
          ${escapeHTML(workshop.summary)}
        </p>

        <div class="workshop-card-meta">

          <span class="workshop-meta-item">
            ${escapeHTML(workshop.duration || "Duration to be confirmed")}
          </span>

          <span class="workshop-meta-item">
            ${escapeHTML(workshop.price || "Price to be confirmed")}
          </span>

          <span class="workshop-meta-item">
            ${escapeHTML(workshop.location || "Singapore")}
          </span>

        </div>

        <span class="workshop-card-action">
          View Workshop Details
          <span aria-hidden="true">→</span>
        </span>

      </div>
    `;

    card.addEventListener("click", () => {
      openWorkshopModal(workshop);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openWorkshopModal(workshop);
      }
    });

    workshopGrid.appendChild(card);
  });

  observeRevealElements();
}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openWorkshopModal(workshop) {
  lastFocusedElement = document.activeElement;

  modalImage.src =
    workshop.image || "assets/workshop-placeholder.webp";

  modalImage.alt =
    workshop.imageAlt || workshop.title;

  modalCategory.textContent =
    workshop.category || "Mokosh Threads Workshop";

  modalStatus.textContent =
    workshop.status || "Workshop";

  modalTitle.textContent =
    workshop.title;

  modalSummary.textContent =
    workshop.summary;

  modalDuration.textContent =
    workshop.duration || "To be confirmed";

  modalPrice.textContent =
    workshop.price || "To be confirmed";

  modalLocation.textContent =
    workshop.location || "Singapore";

  modalLevel.textContent =
    workshop.level || "All levels";

  renderDescription(workshop.description);
  renderList(modalProgramme, workshop.programme);
  renderList(modalInclusions, workshop.inclusions);

  const signupUrl = workshop.signupUrl || "";

  if (
    signupUrl &&
    signupUrl !== "PASTE-YOUR-GOOGLE-FORM-LINK-HERE"
  ) {
    modalSignupButton.href = signupUrl;
    modalSignupButton.style.display = "inline-flex";
  } else {
    modalSignupButton.removeAttribute("href");
    modalSignupButton.style.display = "none";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const closeButton = modal.querySelector(".modal-close");

  window.setTimeout(() => {
    closeButton?.focus();
  }, 50);
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeWorkshopModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}


/* =========================================================
   MODAL CONTENT HELPERS
   ========================================================= */

function renderDescription(description) {
  modalDescription.innerHTML = "";

  const paragraphs = Array.isArray(description)
    ? description
    : [description];

  paragraphs
    .filter((paragraph) => typeof paragraph === "string")
    .forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      modalDescription.appendChild(element);
    });
}


function renderList(container, items) {
  container.innerHTML = "";

  if (!Array.isArray(items)) {
    return;
  }

  items.forEach((item) => {
    if (typeof item !== "string") {
      return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = item;
    container.appendChild(listItem);
  });
}


/* =========================================================
   SAFE HTML HELPERS
   ========================================================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {
  return escapeHTML(value);
}


/* =========================================================
   MODAL EVENTS
   ========================================================= */

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeWorkshopModal);
});


document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    modal.classList.contains("open")
  ) {
    closeWorkshopModal();
  }
});


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}


/* =========================================================
   REVEAL ANIMATION
   ========================================================= */

function observeRevealElements() {
  const elements = document.querySelectorAll(
    ".reveal:not(.visible)"
  );

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    elements.forEach((element) => {
      element.classList.add("visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}


/* =========================================================
   FOOTER YEAR
   ========================================================= */

const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}


/* =========================================================
   INITIALISE
   ========================================================= */

observeRevealElements();
loadWorkshops();
