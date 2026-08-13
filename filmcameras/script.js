/* ==========================================================
   MOKOSH THREADS CAMERA CATALOGUE

   EDITING PRICES
   1. Change RM_PER_SGD below when you want a new conversion.
   2. Change each camera's priceSGD value in CAMERA_DATA.
   3. Set available: false to show a camera as "Currently unavailable".

   IMAGES
   Add each WebP image to filmcameras/assets/ using the exact
   filename in the image property below. The placeholders will
   disappear automatically when the files exist.
   ========================================================== */

const RM_PER_SGD = 3.10;

const CAMERA_DATA = [
  {
    rank: 1, slug: "zenit-e", maker: "Zenit", model: "Zenit-E",
    format: "35mm SLR", years: "1965–1986", interest: "Very high",
    lens: "Helios-44-2 58mm f/2", priceSGD: 120, available: true,
    image: "assets/01-zenit-e.webp",
    summary: "The definitive Soviet SLR: solid, completely manual and closely associated with the celebrated swirly rendering of the Helios-44-2 lens.",
    notice: "Working vintage camera with lens included. Exact cosmetic condition varies by unit."
  },
  {
    rank: 2, slug: "smena-8m", maker: "Smena", model: "Smena 8M",
    format: "35mm viewfinder", years: "1970–1995", interest: "Very high",
    lens: "T-43 40mm f/4 (fixed)", priceSGD: 80, available: true,
    image: "assets/02-smena-8m.webp",
    summary: "One of the most recognisable mass-market Soviet cameras, with simple scale focusing, full manual control and a characterful coated glass triplet lens.",
    notice: "Working vintage camera with fixed lens. Exact cosmetic condition varies by unit."
  },
  {
    rank: 3, slug: "zorki-4", maker: "Zorki", model: "Zorki-4",
    format: "35mm rangefinder", years: "1956–1973", interest: "Very high",
    lens: "Jupiter-8 50mm f/2", priceSGD: 140, available: true,
    image: "assets/03-zorki-4.webp",
    summary: "A classic M39 rangefinder prized for its handsome profile, bright combined finder and access to an excellent family of interchangeable Soviet lenses.",
    notice: "Working vintage camera with lens included. Exact cosmetic condition varies by unit."
  },
  {
    rank: 4, slug: "kiev-4a", maker: "Kiev", model: "Kiev-4A",
    format: "35mm rangefinder", years: "1958–1980", interest: "Very high",
    lens: "Jupiter-8M 50mm f/2", priceSGD: 150, available: true,
    image: "assets/04-kiev-4a.webp",
    summary: "A meterless Contax-derived rangefinder with distinctive focusing controls, premium mechanical character and an acclaimed fast standard lens.",
    notice: "Working vintage camera with lens included. Exact cosmetic condition varies by unit."
  },
  {
    rank: 5, slug: "fed-2", maker: "FED", model: "FED-2",
    format: "35mm rangefinder", years: "1955–1970", interest: "Very high",
    lens: "Industar-26M 52mm f/2.8", priceSGD: 150, available: true,
    image: "assets/05-fed-2.webp",
    summary: "An elegant Leica-inspired Soviet rangefinder with a long rangefinder base, compact proportions and straightforward mechanical operation.",
    notice: "Working vintage camera with lens included. Lens model may vary between production versions."
  },
  {
    rank: 6, slug: "zenit-ttl", maker: "Zenit", model: "Zenit-TTL",
    format: "35mm SLR", years: "1977–1985", interest: "High",
    lens: "Helios-44M 58mm f/2", priceSGD: 140, available: true,
    image: "assets/06-zenit-ttl.webp",
    summary: "A practical development of the classic Zenit formula, adding through-the-lens exposure metering while retaining a rugged mechanical shutter.",
    notice: "Working vintage camera with lens included. Meter operation is stated for each individual unit."
  },
  {
    rank: 7, slug: "zorki-4k", maker: "Zorki", model: "Zorki-4K",
    format: "35mm rangefinder", years: "1972–1978", interest: "High",
    lens: "Jupiter-8 50mm f/2", priceSGD: 130, available: true,
    image: "assets/07-zorki-4k.webp",
    summary: "The lever-wind successor to the Zorki-4, combining the earlier camera's broad shutter range and bright finder with quicker film advance.",
    notice: "Working vintage camera with lens included. Exact cosmetic condition varies by unit."
  },
  {
    rank: 8, slug: "kiev-60", maker: "Kiev", model: "Kiev-60",
    format: "120 medium-format SLR", years: "1984–1999", interest: "High",
    lens: "Volna-3 80mm f/2.8", priceSGD: 280, available: true,
    image: "assets/08-kiev-60.webp",
    summary: "A commanding 6×6 medium-format SLR offering a large negative, interchangeable finders and access to the Pentacon Six lens family.",
    notice: "Working vintage camera with lens included. Ask for the exact finder and accessories supplied."
  },
  {
    rank: 9, slug: "kiev-88", maker: "Kiev", model: "Kiev-88",
    format: "120 medium-format SLR", years: "1979–2000s", interest: "High",
    lens: "Volna-3 80mm f/2.8", priceSGD: 350, available: true,
    image: "assets/09-kiev-88.webp",
    summary: "A visually impressive modular 6×6 system with interchangeable film backs, lenses and finders—often nicknamed the Soviet Hasselblad.",
    notice: "Working vintage camera with lens included. Ask for the exact film back, finder and accessories supplied."
  },
  {
    rank: 10, slug: "zenit-12xp", maker: "Zenit", model: "Zenit 12XP",
    format: "35mm SLR", years: "1983–2000", interest: "High",
    lens: "Helios-44M-4 58mm f/2", priceSGD: 150, available: true,
    image: "assets/10-zenit-12xp.webp",
    summary: "One of the friendliest Zenits for regular shooting, with through-the-lens metering and simple LED exposure indicators in the viewfinder.",
    notice: "Working vintage camera with lens included. Meter operation is stated for each individual unit."
  },
  {
    rank: 11, slug: "smena-symbol", maker: "Smena", model: "Smena Symbol",
    format: "35mm viewfinder", years: "1971–1993", interest: "Medium-high",
    lens: "T-43 40mm f/4 (fixed)", priceSGD: 100, available: true,
    image: "assets/11-smena-symbol.webp",
    summary: "A stylish and convenient development of the Smena idea, using exposure and distance symbols plus a film-advance lever coupled to the shutter.",
    notice: "Working vintage camera with fixed lens. Exact cosmetic condition varies by unit."
  },
  {
    rank: 12, slug: "fed-3", maker: "FED", model: "FED-3",
    format: "35mm rangefinder", years: "1961–1979", interest: "Medium-high",
    lens: "Industar-61 52mm f/2.8", priceSGD: 140, available: true,
    image: "assets/12-fed-3.webp",
    summary: "A familiar evolution of the FED-2 that added slow shutter speeds while retaining interchangeable M39 lenses and classic Soviet rangefinder character.",
    notice: "Working vintage camera with lens included. Lens model may vary between production versions."
  }
];

const grid = document.querySelector("#camera-grid");
const status = document.querySelector("#results-status");
const search = document.querySelector("#camera-search");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const dialog = document.querySelector("#camera-dialog");
let activeFilter = "all";

const money = (value, currency) => new Intl.NumberFormat("en-SG", {
  style: "currency", currency, maximumFractionDigits: 0
}).format(value);

const rmPrice = camera => Math.round(camera.priceSGD * RM_PER_SGD);

function imageMarkup(camera, className = "") {
  return `<img class="${className}" src="${camera.image}" alt="${camera.model} vintage Soviet ${camera.format} with ${camera.lens}" loading="lazy" onerror="this.classList.add('is-missing')">`;
}

function cardMarkup(camera) {
  const state = camera.available ? `${money(camera.priceSGD, "SGD")}` : "Unavailable";
  const secondary = camera.available ? `Approx. ${money(rmPrice(camera), "MYR").replace("MYR", "RM")}` : "Enquire for restock";
  return `
    <button class="camera-card reveal" type="button" data-maker="${camera.maker}" data-search="${[camera.model, camera.maker, camera.format, camera.lens].join(" ").toLowerCase()}" data-camera="${camera.slug}" aria-label="View details for ${camera.model}">
      <div class="camera-image" data-file="${camera.image.split("/").pop()}">
        ${imageMarkup(camera)}
        <span class="camera-rank">${String(camera.rank).padStart(2, "0")}</span>
        <span class="interest-tag">${camera.interest} interest</span>
      </div>
      <div class="camera-card-body">
        <div class="camera-meta"><span>${camera.maker}</span><span>${camera.format}</span></div>
        <h3>${camera.model}</h3>
        <p class="lens-line">Usually paired with ${camera.lens}</p>
        <div class="card-footer">
          <span><strong class="price-sgd">${state}</strong><small class="price-rm">${secondary}</small></span>
          <span class="view-details">View details +</span>
        </div>
      </div>
    </button>`;
}

function renderCards() {
  const term = search.value.trim().toLowerCase();
  const matches = CAMERA_DATA.filter(camera => {
    const passesMaker = activeFilter === "all" || camera.maker === activeFilter;
    const searchable = [camera.model, camera.maker, camera.format, camera.lens, camera.summary].join(" ").toLowerCase();
    return passesMaker && searchable.includes(term);
  });
  grid.innerHTML = matches.length
    ? matches.map(cardMarkup).join("")
    : `<div class="empty-state"><h3>No cameras found</h3><p>Try another model, maker or format.</p></div>`;
  status.textContent = `Showing ${matches.length} of ${CAMERA_DATA.length} cameras`;
  grid.querySelectorAll(".camera-card").forEach(card => card.addEventListener("click", () => openDialog(card.dataset.camera)));
  observeReveals();
}

function openDialog(slug) {
  const camera = CAMERA_DATA.find(item => item.slug === slug);
  if (!camera) return;
  document.querySelector("#dialog-kicker").textContent = `No. ${String(camera.rank).padStart(2, "0")} · ${camera.maker} · ${camera.interest} public interest`;
  document.querySelector("#dialog-title").textContent = camera.model;
  document.querySelector("#dialog-lead").textContent = camera.summary;
  const imageBox = document.querySelector("#dialog-image");
  imageBox.dataset.file = camera.image.split("/").pop();
  imageBox.innerHTML = imageMarkup(camera);
  document.querySelector("#dialog-specs").innerHTML = [
    ["Format", camera.format], ["Produced", camera.years], ["Usual lens", camera.lens], ["Condition", camera.notice]
  ].map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("");
  document.querySelector("#dialog-price").innerHTML = camera.available
    ? `<strong>${money(camera.priceSGD, "SGD")}</strong><span>Approx. ${money(rmPrice(camera), "MYR").replace("MYR", "RM")}</span>`
    : `<strong>Currently unavailable</strong><span>Enquire for restock</span>`;
  document.querySelector("#dialog-whatsapp").href = `https://wa.me/6589202646?text=${encodeURIComponent(`Hello Mokosh Threads, I am interested in the ${camera.model}. Is it currently available?`)}`;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeDialog() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}

function buildSchema() {
  const products = CAMERA_DATA.map(camera => ({
    "@type": "Product",
    "@id": `https://mokoshthreads.com/filmcameras/#${camera.slug}`,
    "name": camera.model,
    "image": `https://mokoshthreads.com/filmcameras/${camera.image}`,
    "description": `${camera.summary} Usually supplied with ${camera.lens}.`,
    "category": "Vintage Soviet film camera",
    "brand": { "@type": "Brand", "name": camera.maker },
    "offers": {
      "@type": "Offer",
      "url": `https://mokoshthreads.com/filmcameras/#${camera.slug}`,
      "priceCurrency": "SGD",
      "price": camera.priceSGD,
      "availability": camera.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/UsedCondition",
      "seller": { "@id": "https://mokoshthreads.com/#organization" }
    }
  }));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization", "@id": "https://mokoshthreads.com/#organization",
        "name": "Mokosh Threads", "url": "https://mokoshthreads.com/",
        "email": "mokoshthreads@gmail.com", "telephone": "+6589202646",
        "description": "A Singapore-based Slavic heritage store specialising in traditional Slavic clothing, vintage Soviet and Russian watches, vintage Soviet film cameras, cultural objects and workshops.",
        "areaServed": [{ "@type": "Country", "name": "Singapore" }, { "@type": "Country", "name": "Malaysia" }],
        "sameAs": ["https://www.instagram.com/mokoshthreads", "https://t.me/wantwotwee"]
      },
      {
        "@type": "CollectionPage", "@id": "https://mokoshthreads.com/filmcameras/#collection",
        "url": "https://mokoshthreads.com/filmcameras/", "name": "Vintage Soviet Film Cameras | Mokosh Threads",
        "description": "A curated collection of twelve celebrated Soviet film cameras available from Mokosh Threads in Singapore and Malaysia.",
        "publisher": { "@id": "https://mokoshthreads.com/#organization" },
        "mainEntity": {
          "@type": "ItemList", "name": "Twelve Famous Soviet Film Cameras",
          "numberOfItems": CAMERA_DATA.length,
          "itemListElement": CAMERA_DATA.map(camera => ({ "@type": "ListItem", "position": camera.rank, "item": { "@id": `https://mokoshthreads.com/filmcameras/#${camera.slug}` } }))
        },
        "inLanguage": "en"
      },
      {
        "@type": "BreadcrumbList", "@id": "https://mokoshthreads.com/filmcameras/#breadcrumbs",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Mokosh Threads", "item": "https://mokoshthreads.com/" },
          { "@type": "ListItem", "position": 2, "name": "Vintage Soviet Film Cameras", "item": "https://mokoshthreads.com/filmcameras/" }
        ]
      },
      ...products
    ]
  };
  document.querySelector("#catalogue-schema").textContent = JSON.stringify(schema);
}

function observeReveals() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(element => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    });
  }, { threshold: .08 });
  document.querySelectorAll(".reveal:not(.is-visible)").forEach(element => observer.observe(element));
}

filterButtons.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", active); });
  renderCards();
}));
search.addEventListener("input", renderCards);
document.querySelector(".dialog-close").addEventListener("click", closeDialog);
dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });

const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector("#mobile-nav");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  mobileNav.hidden = open;
});

buildSchema();
renderCards();
observeReveals();
