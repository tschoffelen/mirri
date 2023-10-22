const { test, expect } = require("@playwright/test");
const path = require("path");

test("page loads", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Drop your stuff")).toBeVisible();
});

test("can upload file", async ({ page }) => {
  await page.goto("/");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Drop your stuff").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(
    path.join(__dirname, "fixtures", "example-file.txt")
  );

  await expect(page.getByText("https://mirri.link")).toBeVisible({
    timeout: 10000,
  });
  const url = await page.getByText("https://mirri.link").innerText();

  await page.goto(url);
  await expect(page.getByText("Hello, world!")).toBeVisible();
});
