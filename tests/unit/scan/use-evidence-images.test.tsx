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
import {
  ClientImageError,
  sanitizeClientImage,
} from "@/features/scan/sanitize-client-image";
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
      <span data-testid="stage">{state.stage}</span>
      <span data-testid="input-mode">{state.inputMode ?? "none"}</span>
      <button
        onClick={() => {
          dispatch({ type: "manual_value_changed", value: "ABC-123" });
          dispatch({ type: "manual_submitted" });
        }}
      >
        Submit manual fixture
      </button>
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
const decodeNotice =
  "This HEIC photo could not be decoded. Try another photo or enter details manually.";
const decodeFailure = () => new ClientImageError(decodeNotice);

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

  it("does not restore evidence that expires while its batch is unfinished", async () => {
    vi.useFakeTimers();
    let finishSecond: ((file: File) => void) | undefined;
    sanitize
      .mockImplementationOnce(async () => clean(1))
      .mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishSecond = resolve;
          }),
      );
    render(<Harness />);

    let pending: Promise<void> | undefined;
    await act(async () => {
      pending = addFiles?.(
        [source("first.jpg"), source("second.jpg")],
        "photos",
      );
      await Promise.resolve();
    });
    expect(createUrl).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000);
    });
    expect(revokeUrl).toHaveBeenCalledWith("blob:clean-1");
    expect(revokeUrl).toHaveBeenCalledTimes(1);

    finishSecond?.(clean(2));
    await act(async () => {
      await pending;
    });

    expect(screen.queryByText("Evidence 1")).not.toBeInTheDocument();
    expect(screen.getByText("Evidence 2")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Evidence 1 expired. Add the photo again or enter details manually.",
    );
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

  it("retains a preparation failure notice when another image succeeds", async () => {
    sanitize
      .mockRejectedValueOnce(decodeFailure())
      .mockResolvedValueOnce(clean(2));
    render(<Harness />);

    await act(async () => {
      await addFiles?.(
        [source("failed.heic", "image/heic"), source("valid.jpg")],
        "photos",
      );
    });

    expect(screen.getByText("Evidence 2")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(decodeNotice);
  });

  it("keeps unsupported-format recovery ahead of decode failures", async () => {
    sanitize.mockRejectedValueOnce(decodeFailure());
    render(<Harness />);

    await act(async () => {
      await addFiles?.(
        [
          source("failed.heic", "image/heic"),
          source("notes.txt", "text/plain"),
        ],
        "photos",
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Some files were unsupported",
    );
  });

  it("keeps decode recovery ahead of the image-limit notice", async () => {
    sanitize
      .mockRejectedValueOnce(decodeFailure())
      .mockResolvedValueOnce(clean(2));
    render(<Harness />);

    await act(async () => {
      await addFiles?.(
        [
          source("failed.heic", "image/heic"),
          source("valid.jpg"),
          source("third.jpg"),
        ],
        "photos",
      );
    });

    expect(screen.getByText("Evidence 2")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(decodeNotice);
  });

  it("restores submitted manual evidence when the last image expires", async () => {
    vi.useFakeTimers();
    render(<Harness />);
    fireEvent.click(
      screen.getByRole("button", { name: "Submit manual fixture" }),
    );
    await act(async () => {
      await addFiles?.([source()], "photos");
    });
    expect(screen.getByTestId("stage")).toHaveTextContent("understand");

    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000);
    });

    expect(screen.getByTestId("stage")).toHaveTextContent("complete_proof");
    expect(screen.getByTestId("input-mode")).toHaveTextContent("manual");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Evidence 1 expired. Add the photo again or enter details manually.",
    );
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

  it("keeps completed state previews when a later addition starts", async () => {
    render(<Harness />);
    await act(async () => {
      await addFiles?.([source("first.jpg")], "photos");
    });
    await act(async () => {
      await addFiles?.([source("second.jpg")], "photos");
    });

    expect(screen.getByText("Evidence 1")).toBeVisible();
    expect(screen.getByText("Evidence 2")).toBeVisible();
    expect(revokeUrl).not.toHaveBeenCalled();
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

  it("immediately revokes an unfinished operation's previews and timers on overlap", async () => {
    let finishSecond: ((file: File) => void) | undefined;
    let finishLatest: ((file: File) => void) | undefined;
    const clearTimer = vi.spyOn(globalThis, "clearTimeout");
    sanitize
      .mockImplementationOnce(async () => clean(1))
      .mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishSecond = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishLatest = resolve;
          }),
      );
    const view = render(<Harness />);
    const first = addFiles?.(
      [source("first.jpg"), source("second.jpg")],
      "photos",
    );
    await waitFor(() => expect(createUrl).toHaveBeenCalledTimes(1));
    const clearedTimersBeforeOverlap = clearTimer.mock.calls.length;

    const latest = addFiles?.([source("latest.jpg")], "photos");

    expect(revokeUrl).toHaveBeenCalledWith("blob:clean-1");
    expect(revokeUrl).toHaveBeenCalledTimes(1);
    expect(clearTimer).toHaveBeenCalledTimes(clearedTimersBeforeOverlap + 1);
    expect(
      within(view.container).queryByText("Evidence 1"),
    ).not.toBeInTheDocument();

    finishSecond?.(clean(2));
    await act(async () => {
      await first;
    });
    expect(revokeUrl).toHaveBeenCalledTimes(1);

    finishLatest?.(clean(3));
    await act(async () => {
      await latest;
    });
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
