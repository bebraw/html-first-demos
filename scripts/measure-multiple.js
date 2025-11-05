import puppeteer from "puppeteer";
import fs from "fs";

async function measureJS(page, url) {
  let jsBytes = 0;
  const jsRequests = [];

  page.on("response", async (response) => {
    const req = response.request();
    if (req.resourceType() === "script") {
      const headers = response.headers();
      const length = headers["content-length"]
        ? parseInt(headers["content-length"], 10)
        : 0;
      jsBytes += length;
      jsRequests.push(req.url());
    }
  });

  const start = performance.now();
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  const metrics = await page.metrics();
  const end = performance.now();

  return {
    url,
    jsRequests: jsRequests.length,
    jsKB: jsBytes / 1024,
    loadMs: end - start,
    scriptSec: metrics.ScriptDuration,
  };
}

async function main() {
  const urlsFile = process.argv[2];
  if (!urlsFile) {
    console.error("Usage: node measure-multiple-js.js urls.txt");
    process.exit(1);
  }

  const urls = fs
    .readFileSync(urlsFile, "utf8")
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter(Boolean);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const url of urls) {
    console.log(`Testing ${url}...`);
    try {
      const result = await measureJS(page, url);
      results.push(result);
    } catch (err) {
      console.error(`❌ Error for ${url}:`, err.message);
      results.push({ url, error: err.message });
    }
    // Reset listeners for the next page
    page.removeAllListeners("response");
  }

  await browser.close();

  console.table(
    results.map((r) => ({
      URL: r.url,
      "JS KB": r.jsKB ? r.jsKB.toFixed(1) : "-",
      "JS reqs": r.jsRequests ?? "-",
      "Exec s": r.scriptSec?.toFixed(2) ?? "-",
      "Load ms": r.loadMs?.toFixed(0) ?? "-",
    }))
  );

  fs.writeFileSync("js-results.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to js-results.json");
}

main();
