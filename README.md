# yle-html-first

This repository illustrates how to use HTML First principles to simplify a web page. The original page to modify was copied from https://yle.fi/ (Chrome -> "Save As...") 03.09.2025. This copy can be run using a standalone server and I did my work against the copy.

## CSS

Since the original site relied on CSS generated through JavaScript, I opted for extracting CSS myself like this (courtesy of ChatGPT) by running the following script in Chrome Inspector:

```javascript
(async () => {
  let cssText = "";

  // Helper: format CSS rules with indentation
  function formatRule(ruleText) {
    return ruleText
      .replace(/\s*{\s*/g, " {\n  ")   // open brace on new line + indent
      .replace(/;\s*/g, ";\n  ")       // each property on new line + indent
      .replace(/\s*}\s*/g, "\n}\n\n"); // closing brace on new line
  }

  // 1. External + embedded stylesheets
  const sheets = [...document.styleSheets];
  for (const sheet of sheets) {
    try {
      for (const rule of sheet.cssRules) {
        cssText += formatRule(rule.cssText);
      }
    } catch (e) {
      console.warn("Skipped stylesheet due to CORS:", sheet.href);
    }
  }

  // 2. Inline <style> tags
  document.querySelectorAll("style").forEach(tag => {
    cssText += "\n/* Inline <style> */\n";
    cssText += formatRule(tag.innerHTML);
  });

  // 3. Inline style attributes
  document.querySelectorAll("[style]").forEach(el => {
    const selector =
      el.tagName.toLowerCase() +
      (el.id ? "#" + el.id : "") +
      (el.className ? "." + [...el.classList].join(".") : "");
    cssText += `\n/* Inline style on ${selector} */\n`;
    cssText += `${selector} {\n  ${el.getAttribute("style").replace(/;\s*/g, ";\n  ")}\n}\n\n`;
  });

  // 4. Trigger download
  const blob = new Blob([cssText], { type: "text/css" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "site-styles.css";
  link.click();
})();
```

I copied the resulting string, fixed two base64 string related issues (invalid syntax), and added the file to my modified project. The current script seems to capture duplicate rules so likely this has to be revisited and optimized further.
