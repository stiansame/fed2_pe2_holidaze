import { expect, test } from "@playwright/test";

test("calendar pricing follows valid selections, reset and booked nights", async ({
  page,
  isMobile,
}) => {
  const venue = {
    id: "venue",
    name: "Calendar test venue",
    price: 1500,
    maxGuests: 4,
    media: [],
    bookings: [],
  };
  await page.route("https://v2.api.noroff.dev/**", (route) =>
    route.fulfill({ json: { data: venue } }),
  );
  await page.goto("/venues/venue?from=2099-06-10&to=2099-06-12&guests=2");
  await expect(
    page.locator("p:visible").filter({ hasText: /^NOK 3\s000,- total$/ }),
  ).toHaveCount(1);
  if (isMobile)
    await page.getByRole("button", { name: "Change dates and guests" }).click();
  await page.getByRole("button", { name: "Reset selection" }).click();
  await expect(
    page.locator("p:visible").filter({ hasText: /^NOK 3\s000,- total$/ }),
  ).toHaveCount(0);
  await expect(
    page
      .locator("p:visible")
      .filter({ hasText: /^NOK 1\s500,- \/ night$/ })
      .first(),
  ).toBeVisible();

  venue.bookings = [{ dateFrom: "2099-06-10", dateTo: "2099-06-12" }];
  await page.reload();
  if (isMobile)
    await page
      .getByRole("button", { name: "Select dates", exact: true })
      .click();
  await expect(
    page.getByRole("button", { name: /Wednesday, 10 June 2099: Booked night/ }),
  ).toBeDisabled();
  await expect(
    page.locator("p:visible").filter({ hasText: /^NOK 3\s000,- total$/ }),
  ).toHaveCount(0);
});
