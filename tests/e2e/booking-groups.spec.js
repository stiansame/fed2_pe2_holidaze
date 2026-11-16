import { expect, test } from "@playwright/test";

for (const manager of [false, true]) {
  test(`${manager ? "manager bookings" : "my stays"} retain preview and expansion`, async ({
    page,
  }) => {
    const bookings = Array.from({ length: 4 }, (_, index) => ({
      id: `booking-${index}`,
      dateFrom: "2099-06-10",
      dateTo: "2099-06-12",
      guests: 2,
      customer: { name: "Guest" },
    }));
    const venue = {
      id: "venue",
      name: "Test venue",
      price: 1500,
      maxGuests: 4,
      location: { city: " Oslo ", country: "Norway" },
      media: [],
      bookings,
    };
    await page.addInitScript(
      ({ manager }) => {
        localStorage.setItem(
          "holidaze-session",
          JSON.stringify({
            name: "test",
            venueManager: manager,
            accessToken: `test.${btoa("{}")}.test`,
          }),
        );
      },
      { manager },
    );
    await page.route("https://v2.api.noroff.dev/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      const data = path.endsWith("/bookings")
        ? bookings.map((booking) => ({ ...booking, venue }))
        : path.endsWith("/venues")
          ? [venue]
          : { name: "test", venueManager: manager };
      return route.fulfill({ json: { data, meta: { nextPage: null } } });
    });
    await page.goto(manager ? "/manager/bookings" : "/bookings");
    const title = manager ? "Upcoming bookings" : "My upcoming stays";
    const group = page.getByRole("region", {
      name: `${title} Total: 4`,
      exact: true,
    });
    await expect(group.locator("article")).toHaveCount(3);
    await expect(group.getByText("Oslo, Norway", { exact: true })).toHaveCount(
      3,
    );
    await group
      .getByRole("button", { name: `Show all ${title.toLowerCase()}` })
      .click();
    await expect(group.locator("article")).toHaveCount(4);
    await expect(group.getByRole("article", { name: "Test venue", exact: true })).toHaveCount(4);
    const headingIds = await group.locator("article").evaluateAll((cards) =>
      cards.map((card) => card.getAttribute("aria-labelledby")),
    );
    expect(new Set(headingIds).size).toBe(4);
    await group
      .getByRole("button", { name: `Show fewer ${title.toLowerCase()}` })
      .click();
    await expect(group.locator("article")).toHaveCount(3);
    if (manager) {
      await page.goto("/manager/venues");
      await expect(page.getByRole("article", { name: "Test venue", exact: true })).toHaveCount(1);
    }
  });
}
