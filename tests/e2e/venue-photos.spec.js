import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

test("photo previews are explicit and edited fields retain their values", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "holidaze-session",
      JSON.stringify({
        name: "photo_test",
        venueManager: true,
        accessToken: `test.${btoa(JSON.stringify({ exp: 4102444800 }))}.test`,
      }),
    );
  });
  await page.route("https://v2.api.noroff.dev/**", (route) => {
    expect(route.request().method()).toBe("GET");
    return route.fulfill({
      json: {
        data: {
          id: "photo-venue",
          name: "Photo test venue",
          description: "Test description",
          price: 100,
          maxGuests: 2,
          owner: { name: "photo_test" },
          media: [
            {
              url: "https://images.example.test/first.png",
              alt: "Original photo",
            },
          ],
        },
      },
    });
  });
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.route("https://images.example.test/**", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7x8AAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.goto("/manager/venues/photo-venue/edit");
  const photos = page.locator('section[aria-labelledby="venue-images"]');
  const url = photos.getByRole("textbox", { name: "Image URL", exact: true });
  const image = photos.getByRole("img", { name: "Original photo" });
  await expect(image).toBeVisible();
  await url.fill("https://images.example.test/second.png");
  await expect(image).toHaveAttribute(
    "src",
    "https://images.example.test/first.png",
  );
  await photos
    .getByRole("button", { name: "Preview image 1", exact: true })
    .click();
  await expect(image).toHaveAttribute(
    "src",
    "https://images.example.test/second.png",
  );
  await url.fill("javascript:alert(1)");
  await photos
    .getByRole("button", { name: "Preview image 1", exact: true })
    .click();
  await expect(image).toHaveAttribute(
    "src",
    "https://images.example.test/second.png",
  );
  await url.fill("https://images.example.test/third.png");
  await photos
    .getByRole("button", { name: "Preview image 1", exact: true })
    .click();
  await expect(image).toHaveAttribute(
    "src",
    "https://images.example.test/third.png",
  );
  const up = await photos
    .getByRole("button", { name: "Move image 1 up", exact: true })
    .boundingBox();
  const previewButton = await photos
    .getByRole("button", { name: "Preview image 1", exact: true })
    .boundingBox();
  if (testInfo.project.name === "mobile") {
    expect(up.y).toBe(previewButton.y);
    expect(up.x).toBeGreaterThan(previewButton.x);
  } else {
    expect(up.y).toBeLessThan(previewButton.y);
    expect(up.x).toBe(previewButton.x);
  }
  if (testInfo.project.name === "mobile") {
    const inputBounds = await url.boundingBox();
    const panelBounds = await photos.boundingBox();
    expect(inputBounds.width).toBeGreaterThan(panelBounds.width - 40);
    await page.setViewportSize({ width: 320, height: 740 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await photos.screenshot({ path: testInfo.outputPath("photos.png") });
  await photos.getByRole("button", { name: "Add image", exact: true }).click();
  await photos
    .getByRole("textbox", { name: "Image URL", exact: true })
    .nth(1)
    .fill("https://images.example.test/new.png");
  await photos
    .getByRole("textbox", { name: "Alt text", exact: true })
    .nth(1)
    .fill("New photo");
  await expect(
    photos.getByRole("button", { name: "Move image 1 up", exact: true }),
  ).toBeDisabled();
  await expect(
    photos.getByRole("button", { name: "Move image 2 down", exact: true }),
  ).toBeDisabled();
  await photos
    .getByRole("button", { name: "Move image 2 up", exact: true })
    .click();
  await expect(url.nth(0)).toHaveValue("https://images.example.test/new.png");
  await expect(
    photos.getByRole("textbox", { name: "Alt text", exact: true }).nth(0),
  ).toHaveValue("New photo");
  const formOrder = await page
    .getByRole("form", { name: "Edit venue" })
    .evaluate((form) => new FormData(form).getAll("mediaUrl"));
  expect(formOrder).toEqual([
    "https://images.example.test/new.png",
    "https://images.example.test/third.png",
  ]);
  await photos
    .getByRole("button", { name: "Move image 1 down", exact: true })
    .click();
  await photos
    .getByRole("button", { name: "Remove image 1", exact: true })
    .click();
  await expect(url).toHaveValue("https://images.example.test/new.png");
  for (const theme of ["", "sunny"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(
      photos.getByRole("button", { name: "Preview image 1", exact: true }),
    ).toBeVisible();
  }
});
