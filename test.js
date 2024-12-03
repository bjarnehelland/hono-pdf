import { chromium as playwright } from "playwright";

// Verify that playwright is working
(async () => {
  const browser = await playwright.launch();
  console.log("Chromium launched successfully!");
  const page = await browser.newPage();
  await page.goto("https://example.com");
  console.log("Page loaded successfully!");
  await browser.close();
})();
