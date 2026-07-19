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
