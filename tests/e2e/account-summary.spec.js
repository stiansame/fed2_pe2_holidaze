import { expect, test } from "@playwright/test";

for (const mode of ["manager", "customer", "public"]) {
  for (const sunny of [false, true]) {
    test(`${mode} account summary in ${sunny ? "sunny" : "standard"} mode`, async ({ page, isMobile }, testInfo) => {
      await page.addInitScript(({ mode, sunny }) => {
        if (sunny) localStorage.setItem("holidaze-theme", "sunny");
        localStorage.setItem("holidaze-session", JSON.stringify({
          name: "test",
          venueManager: mode === "manager",
          accessToken: `test.${btoa("{}")}.test`,
        }));
      }, { mode, sunny });
      await page.route("https://v2.api.noroff.dev/**", (route) => {
        const path = new URL(route.request().url()).pathname;
        const data = /\/(venues|bookings)$/.test(path)
          ? []
          : { name: "test", venueManager: mode === "manager", bio: "Profile stays visible." };
        return route.fulfill({ json: { data, meta: { nextPage: null } } });
      });
      await page.goto(mode === "public" ? "/profiles/test" : "/profile");
      await expect(page.locator("body")).toHaveCSS("font-family", /Inter/);
      await expect(page.locator("body")).toHaveCSS("font-size", "16px");
      await expect(page.locator("body")).toHaveCSS("line-height", "24px");
      const summary = page.locator('dl[aria-label="Account statistics"]');
      const toggle = page.getByRole("button", { name: "Account summary", exact: true });
      await expect(summary).toBeVisible();
      await expect(summary.locator("dt")).toHaveCount(mode === "manager" ? 9 : 5);
      if (isMobile) {
        if (mode === "manager") await page.screenshot({ path: testInfo.outputPath("summary.png"), fullPage: true });
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        const columns = await summary.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
        expect(columns).toBe(3);
        await toggle.click();
        await expect(summary).toBeHidden();
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await expect(page.getByText("Profile stays visible.", { exact: true })).toBeVisible();
        await page.setViewportSize({ width: 1280, height: 800 });
        await expect(summary).toBeVisible();
        await expect(toggle).toBeHidden();
        await page.setViewportSize({ width: 320, height: 720 });
        await expect(summary).toBeHidden();
        await toggle.click();
        await expect(summary).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (mode !== "public") {
          const titles = mode === "manager"
            ? ["My venues", "Venue bookings", "My upcoming stays"]
            : ["My upcoming stays"];
          for (const title of titles) {
            const control = page.getByRole("button", { name: title, exact: true });
            const contentId = await control.getAttribute("aria-controls");
            await control.focus();
            await page.keyboard.press("Enter");
            await expect(control).toHaveAttribute("aria-expanded", "false");
            await expect(page.locator(`[id="${contentId}"]`)).toBeHidden();
            await expect(summary).toBeVisible();
          }
          if (mode === "manager") {
            await page.getByRole("link", { name: "View all my venues", exact: true }).click();
            await expect(page).toHaveURL(/\/manager\/venues$/);
          }
        }
      } else {
        await expect(toggle).toBeHidden();
        const columns = await summary.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
        expect(columns).toBe(mode === "manager" ? 3 : 2);
      }
    });
  }
}
