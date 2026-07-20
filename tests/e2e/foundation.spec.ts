import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("exposes the foundation contract without serious accessibility findings", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();

  const headers = response?.headers() ?? {};
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toBe(
    "camera=(self), geolocation=(), microphone=()",
  );
  expect(headers["x-powered-by"]).toBeUndefined();

  await expect(page).toHaveTitle("RedTag");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Scan a supported item. Verify the evidence. Know what to do next.",
  );
  await expect.soft(page.getByRole("banner")).toBeVisible();

  const homeLink = page.getByRole("link", { name: "RedTag home" });
  await expect(homeLink).toBeVisible();
  await expect.soft(homeLink).toHaveAttribute("href", "/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Evidence first. Answers you can trace.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Scan a supported item. Verify the evidence. Know what to do next.",
      { exact: true },
    ),
  ).toBeVisible();

  for (const name of ["Scan with camera", "Choose from photos"]) {
    const action = page.getByRole("button", { name });
    await expect(action).toBeVisible();
    await expect(action).toBeInViewport({ ratio: 1 });
  }

  const report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
});

test("accepts two gallery images and resets the ephemeral session", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Choose one or two product photos")
    .setInputFiles([
      "tests/fixtures/images/exif-location.jpg",
      "tests/fixtures/images/exif-location.jpg",
    ]);
  await expect(
    page.getByText(
      "2 evidence images selected. No source has been queried yet.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Evidence 1")).toBeVisible();
  await expect(page.getByText("Evidence 2")).toBeVisible();
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(page.getByText("No source has been queried yet.")).toBeVisible();
});

test("accepts desktop drop without displaying the source filename", async ({
  page,
}) => {
  const encoded = (
    await readFile("tests/fixtures/images/exif-location.jpg")
  ).toString("base64");
  await page.goto("/");
  await page
    .getByRole("group", { name: "Photo upload and drop area" })
    .evaluate((dropZone, value) => {
      const bytes = Uint8Array.from(atob(value), (character) =>
        character.charCodeAt(0),
      );
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([bytes], "source-private-name.jpg", { type: "image/jpeg" }),
      );
      dropZone.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
    }, encoded);
  await expect(
    page.getByRole("img", { name: "Selected evidence: Evidence 1" }),
  ).toBeVisible();
  await expect(page.getByText("source-private-name.jpg")).toHaveCount(0);
});

test("keeps manual entry explicit, category-confirmed, and source-free", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter details manually" }).click();
  await page.getByLabel("Model or identifier").fill("ABC-123");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Food and infant formula/ }).check();
  await expect(page.getByRole("status")).toContainText(
    "Details ready for evidence review",
  );
  await expect(page.getByRole("status")).toContainText(
    "No source has been queried yet",
  );
});
