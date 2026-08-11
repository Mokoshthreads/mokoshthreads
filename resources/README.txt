MOKOSH THREADS /resources/

Upload these files into /resources/:
  index.html
  resources.css
  resources.js
  resources.json

HOW TO ADD A NEW ARTICLE
------------------------
1. Create the article folder, for example:
   /resources/history-of-raketa-watches/index.html

2. Add a new object inside resources.json:

{
  "id": "history-raketa",
  "title": "A History of Raketa Watches",
  "category": "Watch History",
  "excerpt": "Short description shown on the Resources page.",
  "url": "./history-of-raketa-watches/",
  "image": "./assets/raketa-history.webp",
  "imageAlt": "Vintage Soviet Raketa watch",
  "date": "2026-09-01",
  "readingTime": 8,
  "tags": ["Raketa", "Soviet watches", "Petrodvorets"],
  "featured": false,
  "published": true
}

VALID CATEGORIES
----------------
Guides
Watch History
Camera History
Slavic Culture
Renfaire
Buying Guides

IMPORTANT
---------
- Set "published": true only when the article URL exists.
- Use "featured": true on only one article at a time.
- Add thumbnails inside /resources/assets/ and put the path in "image".
- If "image" is blank, the page displays an elegant category symbol.
- Published articles are automatically added to an ItemList JSON-LD block by resources.js.
- Individual article pages should still have their own Article JSON-LD.
