MOKOSH THREADS FILM CAMERA PAGE

FILES
- index.html
- styles.css
- script.js
- assets/ (create this folder for the camera images)

HOW TO INSTALL
Replace the existing files inside your website's /filmcameras/ folder with
these three files. Then create /filmcameras/assets/ and add the camera images.

HOW TO CHANGE PRICES
Open script.js. Near the top you will find:

  const RM_PER_SGD = 3.10;

Change this one number whenever you want to update the approximate Malaysian
Ringgit conversion. Each camera also has a priceSGD number. Change that number
and both the SGD and RM prices will update on the card, detail window and
JSON-LD product data.

The initial prices for models not previously listed by Mokosh Threads are
starter prices only. Review them before publishing.

HOW TO CHANGE AVAILABILITY
For a camera in script.js, change:

  available: true

to:

  available: false

HOW TO ADD IMAGES
Use these exact filenames inside /filmcameras/assets/:

01-zenit-e.webp
02-smena-8m.webp
03-zorki-4.webp
04-kiev-4a.webp
05-fed-2.webp
06-zenit-ttl.webp
07-zorki-4k.webp
08-kiev-60.webp
09-kiev-88.webp
10-zenit-12xp.webp
11-smena-symbol.webp
12-fed-3.webp

Until each image exists, the page displays a styled placeholder showing its
expected filename.

IMPORTANT
The navigation links use the known Mokosh Threads page paths. If your website
uses different paths, edit the links in index.html before publishing.
