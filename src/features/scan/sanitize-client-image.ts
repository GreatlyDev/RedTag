const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;
const MAX_EDGE_PIXELS = 2048;
const MAX_DECODED_DIMENSION = 16_384;
const MAX_DECODED_PIXELS = 40_000_000;
const JPEG_QUALITY = 0.9;

export class ClientImageError extends Error {}

function outputSize(width: number, height: number) {
  const scale = Math.min(1, MAX_EDGE_PIXELS / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new ClientImageError(
                "The browser could not re-encode this image.",
              ),
            ),
      "image/jpeg",
      JPEG_QUALITY,
    ),
  );
}

export async function sanitizeClientImage(
  file: File,
  sequence: number,
): Promise<File> {
  if (file.size > MAX_SOURCE_BYTES)
    throw new ClientImageError(
      "That image is larger than 12 MB. Choose a smaller photo.",
    );
  let decoded: ImageBitmap;
  try {
    decoded = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ClientImageError(
      "This browser could not prepare that photo. HEIC and HEIF support varies by browser. Choose JPEG, PNG, or WebP, try another browser, or enter details manually.",
    );
  }
  try {
    if (
      decoded.width > MAX_DECODED_DIMENSION ||
      decoded.height > MAX_DECODED_DIMENSION ||
      decoded.width * decoded.height > MAX_DECODED_PIXELS
    ) {
      throw new ClientImageError(
        "That image has implausibly large decoded dimensions. Choose a smaller photo or enter details manually.",
      );
    }
    const size = outputSize(decoded.width, decoded.height);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context)
      throw new ClientImageError(
        "The browser could not create a private image preview.",
      );
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(decoded, 0, 0, size.width, size.height);
    const sanitized = await canvasToBlob(canvas);
    if (sanitized.size > MAX_OUTPUT_BYTES)
      throw new ClientImageError(
        "The prepared image is still larger than 8 MB. Crop closer to the label and try again.",
      );
    return new File([sanitized], `evidence-${sequence}.jpg`, {
      type: "image/jpeg",
      lastModified: 0,
    });
  } finally {
    decoded.close();
  }
}
