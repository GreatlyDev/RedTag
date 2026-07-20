import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeClientImage } from "@/features/scan/sanitize-client-image";

const createBitmap =
  vi.fn<(file: Blob, options?: ImageBitmapOptions) => Promise<ImageBitmap>>();
function bitmap(width = 4096, height = 2048) {
  return { width, height, close: vi.fn() } as unknown as ImageBitmap;
}
function canvas(encoded: Blob | null, contextAvailable = true) {
  const context = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() };
  const element = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => (contextAvailable ? context : null)),
    toBlob: vi.fn((callback: BlobCallback) => callback(encoded)),
  } as unknown as HTMLCanvasElement;
  vi.spyOn(document, "createElement").mockReturnValue(element);
  return { element, context };
}

describe("sanitizeClientImage", () => {
  beforeEach(() => {
    createBitmap.mockReset();
    vi.stubGlobal("createImageBitmap", createBitmap);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rejects a source larger than 12 MB before decoding", async () => {
    const source = new File(["x"], "private.jpg", { type: "image/jpeg" });
    Object.defineProperty(source, "size", { value: 12 * 1024 * 1024 + 1 });
    await expect(sanitizeClientImage(source, 1)).rejects.toThrow(
      "larger than 12 MB",
    );
    expect(createBitmap).not.toHaveBeenCalled();
  });

  it("bounds the longest edge, re-encodes JPEG, and assigns a generic monotonic name", async () => {
    const decoded = bitmap();
    createBitmap.mockResolvedValue(decoded);
    const { element, context } = canvas(
      new Blob(["jpeg"], { type: "image/jpeg" }),
    );
    const output = await sanitizeClientImage(
      new File(["x"], "private.png", { type: "image/png" }),
      7,
    );
    expect(element).toMatchObject({ width: 2048, height: 1024 });
    expect(context.drawImage).toHaveBeenCalledWith(decoded, 0, 0, 2048, 1024);
    expect(output).toMatchObject({
      name: "evidence-7.jpg",
      type: "image/jpeg",
      lastModified: 0,
    });
    expect(decoded.close).toHaveBeenCalledOnce();
  });

  it("rejects implausibly large decoded dimensions and always closes the bitmap", async () => {
    const decoded = bitmap(50_000, 50_000);
    createBitmap.mockResolvedValue(decoded);
    await expect(
      sanitizeClientImage(new File(["x"], "private.jpg"), 1),
    ).rejects.toThrow("decoded dimensions");
    expect(decoded.close).toHaveBeenCalledOnce();
  });

  it("rejects a re-encoded image larger than 8 MB", async () => {
    const decoded = bitmap(800, 600);
    createBitmap.mockResolvedValue(decoded);
    const encoded = new Blob(["jpeg"], { type: "image/jpeg" });
    Object.defineProperty(encoded, "size", { value: 8 * 1024 * 1024 + 1 });
    canvas(encoded);
    await expect(
      sanitizeClientImage(new File(["x"], "private.jpg"), 1),
    ).rejects.toThrow("still larger than 8 MB");
    expect(decoded.close).toHaveBeenCalledOnce();
  });

  it("explains variable HEIC support and offers manual fallback on decode failure", async () => {
    createBitmap.mockRejectedValue(new Error("decode failed"));
    await expect(
      sanitizeClientImage(new File(["x"], "private.heic"), 1),
    ).rejects.toThrow("HEIC and HEIF support varies by browser");
  });

  it("closes the bitmap when no private canvas context is available", async () => {
    const decoded = bitmap(800, 600);
    createBitmap.mockResolvedValue(decoded);
    canvas(new Blob(["x"]), false);
    await expect(
      sanitizeClientImage(new File(["x"], "private.jpg"), 1),
    ).rejects.toThrow("private image preview");
    expect(decoded.close).toHaveBeenCalledOnce();
  });

  it("fails closed when the browser encoder returns no blob", async () => {
    const decoded = bitmap(800, 600);
    createBitmap.mockResolvedValue(decoded);
    canvas(null);
    await expect(
      sanitizeClientImage(new File(["x"], "private.jpg"), 1),
    ).rejects.toThrow("re-encode");
    expect(decoded.close).toHaveBeenCalledOnce();
  });
});
