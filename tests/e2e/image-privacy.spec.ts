import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const SENTINEL = "SENSITIVE-EXIF-SENTINEL";
function hasGpsExif(bytes: Uint8Array): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 4 < bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    const length = view.getUint16(offset + 2, false);
    if (
      marker === 0xe1 &&
      String.fromCharCode(...bytes.slice(offset + 4, offset + 10)) ===
        "Exif\0\0"
    ) {
      const tiff = offset + 10;
      const little = view.getUint16(tiff, false) === 0x4949;
      const ifd = tiff + view.getUint32(tiff + 4, little);
      const entries = view.getUint16(ifd, little);
      for (let index = 0; index < entries; index += 1) {
        if (view.getUint16(ifd + 2 + index * 12, little) === 0x8825)
          return true;
      }
    }
    if (marker === 0xda || length < 2) break;
    offset += 2 + length;
  }
  return false;
}

test("re-encodes a GPS-tagged fixture without metadata and revokes its preview", async ({
  page,
}) => {
  const source = await readFile("tests/fixtures/images/exif-location.jpg");
  expect(source.toString("latin1")).toContain(SENTINEL);
  expect(hasGpsExif(source)).toBe(true);
  await page.goto("/");
  await page
    .getByLabel("Choose one or two product photos")
    .setInputFiles("tests/fixtures/images/exif-location.jpg");
  const preview = page.getByRole("img", {
    name: "Selected evidence: Evidence 1",
  });
  await expect(preview).toBeVisible();
  await expect(page.getByText("exif-location.jpg")).toHaveCount(0);
  const objectUrl = await preview.getAttribute("src");
  expect(objectUrl).toMatch(/^blob:/);
  const prepared = await page.evaluate(async (url) => {
    const blob = await (await fetch(url)).blob();
    return {
      type: blob.type,
      size: blob.size,
      bytes: Array.from(new Uint8Array(await blob.arrayBuffer())),
    };
  }, objectUrl as string);
  const preparedBytes = Uint8Array.from(prepared.bytes);
  expect(prepared.type).toBe("image/jpeg");
  expect(prepared.size).toBeLessThanOrEqual(8 * 1024 * 1024);
  expect(Buffer.from(preparedBytes).toString("latin1")).not.toContain(SENTINEL);
  expect(hasGpsExif(preparedBytes)).toBe(false);
  await page.getByRole("button", { name: "Start over" }).click();
  expect(
    await page.evaluate(async (url) => {
      try {
        await fetch(url);
        return true;
      } catch {
        return false;
      }
    }, objectUrl as string),
  ).toBe(false);
});
