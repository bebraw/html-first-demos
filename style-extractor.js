// This was prompted with ChatGPT so there are still's a problem in the output
// related to base64 encoded values that seem to be broken to multiple lines.
// This probably has something to do with the way cssText is constructed using
// formatRule which could be doing too much in that particular case.
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
  document.querySelectorAll("[style]").forEach((el) => {
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
