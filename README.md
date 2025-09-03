# yle-html-first

This repository illustrates how to use HTML First principles to simplify a web page. The original page to modify was copied from https://yle.fi/ (Chrome -> "Save As...") 03.09.2025. This copy can be run using a standalone server and I did my work against the copy.

## CSS

Since the original site relied on CSS generated through JavaScript, I opted for extracting CSS myself like this (courtesy of ChatGPT) by running the following script in Chrome Inspector:

```javascript
(async () => {
  const seen = new Set();
  let cssText = "";

  // Helper: format CSS rules
  function formatRule(ruleText) {
    return ruleText
      .replace(/\s*{\s*/g, " {\n  ")
      .replace(/;\s*/g, ";\n  ")
      .replace(/\s*}\s*/g, "\n}\n\n");
  }

  // 1. Stylesheets (external + inline <style>)
  for (const sheet of [...document.styleSheets]) {
    try {
      for (const rule of sheet.cssRules) {
        if (!seen.has(rule.cssText)) {
          seen.add(rule.cssText);
          cssText += formatRule(rule.cssText);
        }
      }
    } catch (e) {
      console.warn("Skipped stylesheet due to CORS:", sheet.href);
    }
  }

  // 2. Inline style attributes
  document.querySelectorAll("[style]").forEach(el => {
    const selector =
      el.tagName.toLowerCase() +
      (el.id ? "#" + el.id : "") +
      (el.className ? "." + [...el.classList].join(".") : "");
    const inlineRule = `${selector} {\n  ${el
      .getAttribute("style")
      .replace(/;\s*/g, ";\n  ")}\n}\n\n`;

    if (!seen.has(inlineRule)) {
      seen.add(inlineRule);
      cssText += inlineRule;
    }
  });

  // 3. Trigger download
  const blob = new Blob([cssText], { type: "text/css" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "site-styles.css";
  link.click();
})();
```

I copied the resulting string, fixed two base64 string related issues (invalid syntax), and added the file to my modified project.
