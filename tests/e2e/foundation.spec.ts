import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("shows the primary scan action above the fold without serious accessibility findings", async ({
  page,
}) => {
  await page.goto("/");
  const viewportHeight = page.viewportSize()?.height ?? 0;

  for (const name of ["Scan with camera", "Choose from photos"]) {
    const action = page.getByRole("button", { name });
    await expect(action).toBeVisible();
    const box = await action.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? viewportHeight) + (box?.height ?? 0)).toBeLessThanOrEqual(
      viewportHeight,
    );
  }

  const report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
});
