"use client";

import { useReducer, useRef, useState } from "react";
import { APP_PROMISE } from "@/app/product-copy";
import { CategorySelector } from "./components/category-selector";
import { initialScanSession, scanReducer } from "./model/scan-reducer";
import { useEvidenceImages } from "./use-evidence-images";
import styles from "./universal-scan.module.css";

export function UniversalScan() {
  const [state, dispatch] = useReducer(
    scanReducer,
    undefined,
    initialScanSession,
  );
  const [manualOpen, setManualOpen] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const photosInput = useRef<HTMLInputElement>(null);
  const { addFiles, removeImage, clearImages } = useEvidenceImages(
    state.images,
    dispatch,
  );
  const status =
    state.notice ??
    (state.stage === "complete_proof"
      ? "Details ready for evidence review. No source has been queried yet."
      : state.images.length > 0
        ? `${state.images.length} evidence image${state.images.length === 1 ? "" : "s"} selected. No source has been queried yet.`
        : "No source has been queried yet.");

  return (
    <section className={styles.workspace} aria-labelledby="scan-heading">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Universal Scan</p>
        <h1 id="scan-heading">Evidence first. Answers you can trace.</h1>
        <p>{APP_PROMISE}</p>
        <div className={styles.boundary} aria-label="Trust boundary">
          <span>GPT-5.6 extracts identity candidates</span>
          <span className={styles.flowArrow} aria-hidden="true" />
          <span>Deterministic code routes and verifies</span>
        </div>
      </div>
      <div className={styles.capture}>
        <div
          className={styles.dropZone}
          role="group"
          aria-label="Photo upload and drop area"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(event) => {
            event.preventDefault();
            void addFiles(Array.from(event.dataTransfer.files), "photos");
          }}
        >
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => cameraInput.current?.click()}
            >
              Scan with camera
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => photosInput.current?.click()}
            >
              Choose from photos
            </button>
            <input
              ref={cameraInput}
              className={styles.hiddenInput}
              type="file"
              tabIndex={-1}
              accept="image/*"
              capture="environment"
              aria-label="Take a product photo"
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                event.currentTarget.value = "";
                void addFiles(files, "camera");
              }}
            />
            <input
              ref={photosInput}
              className={styles.hiddenInput}
              type="file"
              tabIndex={-1}
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              aria-label="Choose one or two product photos"
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                event.currentTarget.value = "";
                void addFiles(files, "photos");
              }}
            />
          </div>
          <p className={styles.dropHint}>
            or drop one or two product photos here
          </p>
        </div>
        <p className={styles.privacy}>
          Up to two sanitized previews stay in memory for no more than 15
          minutes. RedTag does not write them to browser storage.
        </p>
        {state.images.length > 0 ? (
          <div
            className={styles.evidence}
            aria-label="Selected evidence images"
          >
            {state.images.map((image) => (
              <figure key={image.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral local blob preview */}
                <img
                  src={image.objectUrl}
                  alt={`Selected evidence: ${image.label}`}
                />
                <figcaption>
                  <span>{image.label}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    aria-label={`Remove ${image.label}`}
                  >
                    Remove
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className={styles.manualReveal}
          aria-expanded={manualOpen}
          aria-controls="manual-entry"
          onClick={() => setManualOpen((open) => !open)}
        >
          Enter details manually
        </button>
        {manualOpen ? (
          <form
            id="manual-entry"
            className={styles.manual}
            onSubmit={(event) => {
              event.preventDefault();
              dispatch({ type: "manual_submitted" });
            }}
          >
            <label htmlFor="manual-identifier">Model or identifier</label>
            <div>
              <input
                id="manual-identifier"
                value={state.manualValue}
                onChange={(event) =>
                  dispatch({
                    type: "manual_value_changed",
                    value: event.currentTarget.value,
                  })
                }
                placeholder="Model, UPC/GTIN, lot, date, or VIN"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit">Continue</button>
            </div>
          </form>
        ) : null}
        <CategorySelector
          selected={state.selectedCategory}
          onSelect={(category) =>
            dispatch({ type: "category_selected", category })
          }
        />
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
        {state.images.length > 0 || state.manualValue ? (
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              clearImages();
              setManualOpen(false);
            }}
          >
            Start over
          </button>
        ) : null}
      </div>
    </section>
  );
}
