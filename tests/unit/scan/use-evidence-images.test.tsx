import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { StrictMode, useEffect, useReducer } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  initialScanSession,
  scanReducer,
} from "@/features/scan/model/scan-reducer";
import { sanitizeClientImage } from "@/features/scan/sanitize-client-image";
import { useEvidenceImages } from "@/features/scan/use-evidence-images";

vi.mock("@/features/scan/sanitize-client-image", () => ({
  ClientImageError: class ClientImageError extends Error {},
  sanitizeClientImage: vi.fn(),
}));
const sanitize = vi.mocked(sanitizeClientImage);
const createUrl = vi.fn<(blob: Blob) => string>();
const revokeUrl = vi.fn<(url: string) => void>();
type AddFiles = (
  files: readonly File[],
  mode: "camera" | "photos",
) => Promise<void>;
let addFiles: AddFiles | null = null;
let reset: (() => void) | null = null;

function Harness() {
  const [state, dispatch] = useReducer(
    scanReducer,
    undefined,
    initialScanSession,
  );
  const controller = useEvidenceImages(state.images, dispatch);
  useEffect(() => {
    addFiles = controller.addFiles;
    reset = controller.clearImages;
    return () => {
      addFiles = null;
      reset = null;
    };
  }, [controller.addFiles, controller.clearImages]);
  return (
    <div>
      {state.images.map((image) => (
        <div key={image.id}>
          <span>{image.label}</span>
          <button onClick={() => controller.removeImage(image)}>
            Remove {image.label}
          </button>
        </div>
      ))}
      {state.notice ? <span role="status">{state.notice}</span> : null}
      <button onClick={controller.clearImages}>Clear</button>
    </div>
  );
}
const source = (name = "private.jpg", type = "image/jpeg") =>
  new File(["source"], name, { type });
const clean = (sequence: number) =>
  new File(["clean"], `evidence-${sequence}.jpg`, {
    type: "image/jpeg",
    lastModified: 0,
  });

describe("useEvidenceImages", () => {
  beforeEach(() => {
    addFiles = null;
    reset = null;
    sanitize
      .mockReset()
      .mockImplementation(async (_file, sequence) => clean(sequence));
    createUrl
      .mockReset()
      .mockImplementation(() => `blob:clean-${createUrl.mock.calls.length}`);
    revokeUrl.mockReset();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeUrl,
    });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("never exposes source names and uses monotonic labels across removal", async () => {
    render(<Harness />);
    await act(async () => {
      await addFiles?.([source("secret-one.jpg")], "photos");
    });
    expect(screen.queryByText("secret-one.jpg")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Evidence 1" }));
    await act(async () => {
      await addFiles?.([source("secret-two.jpg")], "photos");
    });
    expect(screen.getByText("Evidence 2")).toBeVisible();
    expect(revokeUrl).toHaveBeenCalledTimes(1);
  });

  it("expires a sanitized reference within fifteen minutes with neutral recovery", async () => {
    vi.useFakeTimers();
    render(<Harness />);
    await act(async () => {
      await addFiles?.([source()], "photos");
    });
    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000);
    });
    expect(screen.queryByText("Evidence 1")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Evidence 1 expired. Add the photo again or enter details manually.",
    );
    expect(revokeUrl).toHaveBeenCalledWith("blob:clean-1");
    expect(revokeUrl).toHaveBeenCalledTimes(1);
  });

  it("retains valid sanitized results while reporting unsupported files", async () => {
    render(<Harness />);
    await act(async () => {
      await addFiles?.(
        [source("label.jpg"), source("notes.txt", "text/plain")],
        "photos",
      );
    });
    expect(screen.getByText("Evidence 1")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Some files were unsupported",
    );
    expect(sanitize).toHaveBeenCalledTimes(1);
  });

  it("cancels an in-flight selection on reset without creating a URL", async () => {
    let finish: ((file: File) => void) | undefined;
    sanitize.mockImplementationOnce(
      () =>
        new Promise<File>((resolve) => {
          finish = resolve;
        }),
    );
    render(<Harness />);
    const pending = addFiles?.([source()], "photos");
    act(() => reset?.());
    finish?.(clean(1));
    await act(async () => {
      await pending;
    });
    expect(createUrl).not.toHaveBeenCalled();
  });

  it("cancels rapid overlap and retains only the latest selection", async () => {
    let finish: ((file: File) => void) | undefined;
    sanitize.mockImplementationOnce(
      () =>
        new Promise<File>((resolve) => {
          finish = resolve;
        }),
    );
    const view = render(<Harness />);
    const first = addFiles?.([source("first.jpg")], "photos");
    await act(async () => {
      await addFiles?.([source("second.jpg")], "photos");
    });
    finish?.(clean(1));
    await act(async () => {
      await first;
    });
    expect(within(view.container).getAllByText(/^Evidence \d$/)).toHaveLength(
      1,
    );
    expect(createUrl).toHaveBeenCalledTimes(1);
  });

  it("revokes previews accumulated before an overlapping selection cancels them", async () => {
    let finishSecond: ((file: File) => void) | undefined;
    sanitize
      .mockImplementationOnce(async () => clean(1))
      .mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishSecond = resolve;
          }),
      )
      .mockImplementationOnce(async () => clean(3));
    const view = render(<Harness />);
    const first = addFiles?.(
      [source("first.jpg"), source("second.jpg")],
      "photos",
    );
    await waitFor(() => expect(createUrl).toHaveBeenCalledTimes(1));
    await act(async () => {
      await addFiles?.([source("latest.jpg")], "photos");
    });
    finishSecond?.(clean(2));
    await act(async () => {
      await first;
    });
    expect(revokeUrl).toHaveBeenCalledWith("blob:clean-1");
    expect(revokeUrl).toHaveBeenCalledTimes(1);
    expect(within(view.container).getByText("Evidence 3")).toBeVisible();
  });

  it("remains mounted through the React Strict Mode effect replay", async () => {
    render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
    await act(async () => {
      await addFiles?.([source()], "photos");
    });
    expect(screen.getByText("Evidence 1")).toBeVisible();
  });
  it("clears timers and revokes each URL exactly once on unmount", async () => {
    vi.useFakeTimers();
    const view = render(<Harness />);
    await act(async () => {
      await addFiles?.([source()], "photos");
    });
    view.unmount();
    act(() => vi.advanceTimersByTime(15 * 60 * 1000));
    expect(revokeUrl).toHaveBeenCalledTimes(1);
  });
});
