# yle-html-first

This repository illustrates how to use HTML First principles to simplify a web page. The original page to modify was copied from https://yle.fi/ (Chrome -> "Save As...") 03.09.2025. This copy can be run using a standalone server and I did my work against the copy.

## CSS

Since the original site relied on CSS generated through JavaScript, I opted for extracting CSS myself using a small script created with ChatGPT. The code itself is available at `scripts/style-extractor.js`.

After running the script, I copied the resulting string, fixed two base64 string related issues with invalid syntax, and added the file to my modified project while dropping earlier references from HTML and using the new file instead.

## Lighthouse

To run Lighthouse performance tests, execute `npm run start:<variant>` and `npm run lh:<variant>` in separate terminals. Available variants are `original` and `modified`.
