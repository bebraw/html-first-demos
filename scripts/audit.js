import { playAudit } from "playwright-lighthouse";
import playwright from "playwright";

describe("audit", () => {
  it("original", () => audit("original"));
  // it("modified", () => audit("modified"));
});

async function audit(variant) {
  const browser = await playwright["chromium"].launch({
    args: ["--remote-debugging-port=9222"],
  });
  const page = await browser.newPage();
  await page.goto(`https://localhost:3000/${variant}`);

  await playAudit({
    page: page,
    port: 9222,
  });

  await browser.close();
}
