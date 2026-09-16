import { expect, test } from "@playwright/test";

test.describe("KLYK landing", () => {
  test("leads with the product and its spec sheet", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/KLYK-65/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("65 клавіш");
    await expect(page.getByText("Hot-swap 5-pin")).toBeVisible();
  });

  test("navigates to a section from the header", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Анатомія" }).click();
    await expect(page).toHaveURL(/#anatomy$/);
    await expect(page.getByRole("heading", { name: /П.ять шарів/ })).toBeInViewport();
  });

  test("says plainly that the product does not exist", async ({ page }) => {
    await page.goto("/");

    const order = page.locator("#order");
    await expect(order.getByText("Концепт — оформити замовлення неможливо.")).toBeVisible();
    await expect(order.getByText(/вигаданий бренд/)).toBeVisible();
    // Nothing in the pricing card may look like a working checkout.
    await expect(order.getByRole("button")).toHaveCount(0);
  });

  test("serves robots and a sitemap", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
  });
});

test.describe("flat board fallback", () => {
  // A phone viewport: the page must never start a WebGL context here.
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("draws the whole keyboard as SVG instead", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("canvas")).toHaveCount(0);
    const board = page.locator("svg[role=img]").first();
    await expect(board).toBeVisible();
    // 68 caps, drawn from the same layout table the 3D scene uses.
    await expect(board.locator("rect[data-key]")).toHaveCount(68);
  });

  test("recolours the flat board from the configurator", async ({ page }) => {
    await page.goto("/");
    await page.locator("#configurator").scrollIntoViewIfNeeded();

    const cap = page.locator("#configurator rect[data-key='KeyF']");
    const before = await cap.getAttribute("fill");

    await page.getByRole("button", { name: /Signal/ }).click();

    await expect(cap).not.toHaveAttribute("fill", before ?? "");
    await expect(page.locator("#configurator svg[role=img]")).toHaveAttribute(
      "aria-label",
      /Signal/,
    );
  });

  test("keeps the keyboard-only controls out of the way on touch", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: /Звук світчів/ })).toBeHidden();
    await expect(page.getByText(/оживає на комп.ютері/)).toBeVisible();
  });
});
