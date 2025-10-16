# yle-html-first

This repository illustrates how to use HTML First principles to simplify a web page.

## Lighthouse

To run Lighthouse performance tests, execute `npm run start:<site>:<variant>` and `npm run lh:<site>:<variant>` in separate terminals. Only `yle` is available as a site for now while variants include `original` and `modified`. To see the reports in the browser, execute `npm run start:reports` and you can access `/original` and `/modified` paths to see Lighthouse reports.

## Case Yle

The original page to modify was copied from https://yle.fi/ (Google Chrome (Incognito mode) -> "Save As...") 15.10.2025.

## CSS

Since the original site relied on CSS generated through JavaScript, I opted for extracting CSS myself using a small script created with ChatGPT. The code itself is available at `scripts/style-extractor.js`.

After running the script in browser inspector, I copied the resulting string, fixed two base64 string related issues with invalid syntax, and added the file to my modified project while dropping earlier references from HTML and using the new file instead.

## Caveats

There are several caveats to consider in the modified implementation:

1. By removing css-in-js, I likely broke some functionality somewhere
2. Videos do not load in the modified version
3. Lazy-loading has not been restored in the modified version
4. There is not cookie consent form in the modified version
5. The second carousel is broken (easily fixable without a lot of code, though)
6. Likely something else I didn't notice is broken (second)

That said, the modified page matches the original page mostly and the caveats I pointed out are fixable with a modest amount of code. The key point here was to illustrate some value of HTML First principles without going for a full port to give a baseline for some kind of a "best" case. Most likely there would be further optimizations to be done but the current solution shows how to get most done (dropping most of JS + replacing css-in-js with CSS) with a reasonable effort.
