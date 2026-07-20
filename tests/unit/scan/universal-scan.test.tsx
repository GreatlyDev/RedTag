import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UniversalScan } from "@/features/scan/universal-scan";

const { addFiles, clearImages, removeImage } = vi.hoisted(() => ({
  addFiles: vi.fn(),
  clearImages: vi.fn(),
  removeImage: vi.fn(),
}));
vi.mock("@/features/scan/use-evidence-images", () => ({
  useEvidenceImages: () => ({ addFiles, clearImages, removeImage }),
}));

describe("UniversalScan", () => {
  beforeEach(() => {
    addFiles.mockReset();
    clearImages.mockReset();
    removeImage.mockReset();
  });
  afterEach(cleanup);

  it("preserves the approved promise and keeps manual entry quiet and source-free", () => {
    render(<UniversalScan />);
    expect(
      screen.getByText(
        "Scan a supported item. Verify the evidence. Know what to do next.",
        { exact: true },
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Scan with camera" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Choose from photos" }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "No source has been queried yet.",
    );
    const reveal = screen.getByRole("button", {
      name: "Enter details manually",
    });
    expect(reveal).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByLabelText("Model or identifier"),
    ).not.toBeInTheDocument();
    fireEvent.click(reveal);
    fireEvent.change(screen.getByLabelText("Model or identifier"), {
      target: { value: "ABC-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Details ready for evidence review",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "No source has been queried yet",
    );
  });

  it("collects a category confirmation and explains the deterministic routing boundary", () => {
    render(<UniversalScan />);
    const food = screen.getByRole("radio", { name: /Food and infant formula/ });
    fireEvent.click(food);
    expect(food).toBeChecked();
    expect(
      screen.getByText(
        /Deterministic routing uses your confirmed category to determine the eligible official source before any query/,
      ),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "No source has been queried yet",
    );
  });

  it("routes desktop drops through the same bounded photo intake", () => {
    render(<UniversalScan />);
    const file = new File(["image"], "source-name.jpg", { type: "image/jpeg" });
    fireEvent.drop(
      screen.getByRole("group", { name: "Photo upload and drop area" }),
      { dataTransfer: { files: [file] } },
    );
    expect(addFiles).toHaveBeenCalledWith([file], "photos");
    expect(screen.queryByText("source-name.jpg")).not.toBeInTheDocument();
  });
});
