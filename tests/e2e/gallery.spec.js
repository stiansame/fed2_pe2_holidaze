import { expect, test } from "@playwright/test";

test("mobile and modal strips keep the active photo in sync", async ({ page, isMobile }) => {
  await page.route("https://example.com/*.svg", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="teal"/></svg>',
  }));
  await page.route("https://v2.api.noroff.dev/**", (route) => route.fulfill({ json: { data: {
    id: "venue", name: "Gallery venue", price: 100, maxGuests: 2, bookings: [],
    media: [{ url: "https://example.com/one.svg" }, { url: "https://example.com/two.svg" }],
  } } }));
  await page.goto("/venues/venue");
  const strip = page.getByRole("group", { name: "Swipe venue photos", exact: true });
  if (isMobile) {
    await strip.evaluate((node) => node.scrollTo({ left: node.clientWidth, behavior: "instant" }));
    await expect(strip.locator("..").locator("p")).toHaveText("2 / 2");
    await page.getByRole("button", { name: "Open photo 2 of 2", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Open photo gallery", exact: true }).click();
  }
  const modal = page.getByRole("dialog", { name: "Photos of Gallery venue" });
  await expect(modal).toBeVisible();
  await expect(modal.locator("p[aria-live]")).toHaveText(isMobile ? "2 / 2" : "1 / 2");
  await modal.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(modal.locator("p[aria-live]")).toHaveText(isMobile ? "1 / 2" : "2 / 2");
  await modal.getByRole("button", { name: "Close gallery", exact: true }).click();
  await expect(modal).toBeHidden();
  if (isMobile) await expect(strip.locator("..").locator("p")).toHaveText("1 / 2");
});
