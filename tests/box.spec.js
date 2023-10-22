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

  await expect(
    page.getByText("https://mirri.link", { exact: false })
  ).toBeVisible({
    timeout: 15000,
  });

  await expect(page.getByTestId("copy-button")).toBeVisible();
  await page.getByTestId("copy-button").click();

  const url = await page
    .getByText("https://mirri.link", { exact: false })
    .innerText();
  let clipboardText = await page.evaluate("navigator.clipboard.readText()");
  expect(clipboardText).toEqual(url);

  await page.goto(url);
  await expect(page.getByText("Hello, world!")).toBeVisible();
});
