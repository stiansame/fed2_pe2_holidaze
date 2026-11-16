import { expect, test } from "@playwright/test";

const venue = {
  id: "venue",
  name: "Guest count test venue",
  price: 1500,
  maxGuests: 4,
  media: [{ url: "https://example.com/venue.jpg", alt: "Venue" }],
  bookings: [],
};
const booking = {
  id: "booking",
  dateFrom: "2099-06-10T00:00:00.000Z",
  dateTo: "2099-06-12T00:00:00.000Z",
  guests: 2,
  customer: { name: "test" },
  venue,
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "holidaze-session",
      JSON.stringify({
        name: "test",
        venueManager: false,
        accessToken: `test.${btoa("{}")}.test`,
      }),
    );
  });
  await page.route("https://example.com/venue.jpg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/>',
    }),
  );
  await page.route("https://v2.api.noroff.dev/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/venues/venue")
      ? venue
      : path.endsWith("/venues")
        ? [venue]
        : path.endsWith("/bookings/booking")
          ? booking
          : path.endsWith("/bookings")
            ? [booking]
            : { name: "test", venueManager: false };
    return route.fulfill({ json: { data, meta: { nextPage: null } } });
  });
});

for (const editing of [false, true]) {
  test(`${editing ? "changed" : "new"} bookings validate typed guests before review`, async ({
    page,
    isMobile,
  }) => {
    const path = editing
      ? "/bookings/booking/edit"
      : "/venues/venue?from=2099-06-10&to=2099-06-12&guests=2";
    await page.goto(path);
    if (isMobile && !editing)
      await page.getByRole("button", { name: "Change dates and guests" }).click();
    const guests = page.getByRole("spinbutton", { name: /guests/i });
    const submit = page.getByRole("region", { name: "Availability", exact: true }).getByRole("button", {
      name: editing ? "Review changes" : "Reserve",
      exact: true,
    }).filter({ visible: true });
    await expect(guests).toHaveValue("2");
    await expect(guests).toHaveAttribute("inputmode", "numeric");
    for (const value of ["", "0", "-1", "1.5", "5"]) {
      await guests.fill(value);
      await expect(guests).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByText("Enter a whole number of guests from 1 to 4.", { exact: true })).toBeVisible();
      await submit.click();
      await expect(page).toHaveURL(new RegExp(editing ? "/bookings/booking/edit$" : "/venues/venue\\?"));
      await expect(page.getByRole("button", { name: editing ? "Save changes" : "Confirm reservation" })).toHaveCount(0);
    }
    await guests.fill("1");
    await expect(guests).toHaveAttribute("aria-invalid", "false");
    await guests.fill("4");
    await expect(guests).toHaveAttribute("aria-invalid", "false");
    await expect(page.getByText("Maximum 4 guests", { exact: true })).toBeVisible();
    await submit.click();
    if (!editing) await expect(page).toHaveURL(/\/reserve\?.*guests=4/);
    await expect(page.getByRole("button", { name: editing ? "Save changes" : "Confirm reservation" })).toBeEnabled();

    // Capacity can change after review; fresh checks must block both POST and PUT.
    await page.route("**/holidaze/venues/venue?*", (route) =>
      route.fulfill({ json: { data: { ...venue, maxGuests: 3 } } }),
    );
    const mutations = [];
    page.on("request", (request) => {
      if (["POST", "PUT"].includes(request.method())) mutations.push(request.url());
    });
    await page.getByRole("button", { name: editing ? "Save changes" : "Confirm reservation" }).click();
    await expect(page.getByRole("alert")).toHaveText("Enter a whole number of guests from 1 to 3.");
    expect(mutations).toEqual([]);
  });
}

test("guest search accepts typed numbers, rejects fractions and resets to Any", async ({ page, isMobile }) => {
  await page.goto("/venues");
  if (isMobile) await page.getByRole("button", { name: /Filters and sort/ }).click();
  const guests = page.getByRole("spinbutton", { name: "Guests", exact: true });
  await expect(guests).toHaveValue("");
  await guests.fill("3");
  await expect(page).toHaveURL(/guests=3/);
  await guests.fill("2.5");
  await expect(guests).toHaveValue("2.5");
  await expect(guests).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a whole number of guests from 0 to 100.", { exact: true })).toBeVisible();
  await guests.fill("4");
  await page.reload();
  if (isMobile) await page.getByRole("button", { name: /Filters and sort/ }).click();
  await expect(guests).toHaveValue("4");
  await page.getByRole("button", { name: "Reset filters", exact: true }).click();
  await expect(guests).toHaveValue("");
  await expect(page).not.toHaveURL(/guests=/);
});
