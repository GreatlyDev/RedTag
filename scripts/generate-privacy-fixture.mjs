import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const directory = fileURLToPath(
  new URL("../tests/fixtures/images/", import.meta.url),
);
const output = fileURLToPath(
  new URL("../tests/fixtures/images/exif-location.jpg", import.meta.url),
);
const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640">
  <rect width="960" height="640" fill="#f5f0e7"/>
  <rect x="40" y="40" width="880" height="560" rx="24" fill="#fffdf8" stroke="#486154" stroke-width="4"/>
  <text x="80" y="210" font-family="Arial" font-size="58" font-weight="700" fill="#1f2925">DEMO FIXTURE</text>
  <text x="80" y="285" font-family="Arial" font-size="34" fill="#53646b">NOT A CONSUMER PRODUCT</text>
  <text x="80" y="420" font-family="monospace" font-size="44" fill="#1f2925">MODEL RT-DEMO-01</text>
</svg>`);

await mkdir(directory, { recursive: true });
await sharp(svg)
  .jpeg({ quality: 92 })
  .withExif({
    IFD0: { ImageDescription: "SENSITIVE-EXIF-SENTINEL" },
    IFD3: {
      GPSLatitudeRef: "N",
      GPSLatitude: "40/1 42/1 0/1",
      GPSLongitudeRef: "W",
      GPSLongitude: "74/1 0/1 0/1",
    },
  })
  .toFile(output);
