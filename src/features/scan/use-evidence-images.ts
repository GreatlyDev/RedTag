"use client";

import { useCallback, useEffect, useRef } from "react";
import { MAX_EVIDENCE_IMAGES } from "./model/scan-reducer";
import type {
  EvidenceImage,
  ImageInputMode,
  ScanSessionAction,
} from "./model/types";
import { ClientImageError, sanitizeClientImage } from "./sanitize-client-image";

const REFERENCE_TTL_MS = 15 * 60 * 1000;
const TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const EXTENSIONS = /\.(?:jpe?g|png|webp|heic|heif)$/i;
const unsupportedNotice =
  "Some files were unsupported. Choose JPEG, PNG, WebP, HEIC, or HEIF. HEIC and HEIF support varies by browser; manual entry remains available.";

function isAccepted(file: File) {
  return (
    TYPES.has(file.type) || (file.type === "" && EXTENSIONS.test(file.name))
  );
}

type Dispatch = (action: ScanSessionAction) => void;
export function useEvidenceImages(
  images: readonly EvidenceImage[],
  dispatch: Dispatch,
) {
  const mounted = useRef(true);
  const generation = useRef(0);
  const sequence = useRef(0);
  const activeUrls = useRef(new Set<string>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const revoke = useCallback((url: string) => {
    const timer = timers.current.get(url);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(url);
    }
    if (activeUrls.current.delete(url)) URL.revokeObjectURL(url);
  }, []);

  const addFiles = useCallback(
    async (files: readonly File[], mode: ImageInputMode) => {
      const operation = ++generation.current;
      const valid = files.filter(isAccepted);
      const unsupported = valid.length !== files.length;
      const available = Math.max(0, MAX_EVIDENCE_IMAGES - images.length);
      const exceeded = valid.length > available;
      const accepted: EvidenceImage[] = [];
      const revokeAccepted = () =>
        accepted.forEach(({ objectUrl }) => revoke(objectUrl));
      for (const file of valid.slice(0, available)) {
        const nextSequence = ++sequence.current;
        try {
          const sanitizedFile = await sanitizeClientImage(file, nextSequence);
          if (!mounted.current || operation !== generation.current) {
            revokeAccepted();
            return;
          }
          const objectUrl = URL.createObjectURL(sanitizedFile);
          activeUrls.current.add(objectUrl);
          const evidence: EvidenceImage = {
            id: crypto.randomUUID(),
            label: `Evidence ${nextSequence}`,
            mimeType: "image/jpeg",
            size: sanitizedFile.size,
            objectUrl,
            sanitizedFile,
            createdAt: Date.now(),
          };
          accepted.push(evidence);
          timers.current.set(
            objectUrl,
            setTimeout(() => {
              if (!activeUrls.current.has(objectUrl)) return;
              revoke(objectUrl);
              dispatch({ type: "image_removed", id: evidence.id });
              dispatch({
                type: "notice_set",
                notice: `${evidence.label} expired. Add the photo again or enter details manually.`,
              });
            }, REFERENCE_TTL_MS),
          );
        } catch (error) {
          if (!mounted.current || operation !== generation.current) {
            revokeAccepted();
            return;
          }
          dispatch({
            type: "notice_set",
            notice:
              error instanceof ClientImageError
                ? error.message
                : "The browser could not prepare that image. Try another photo or enter details manually.",
          });
        }
      }
      if (!mounted.current || operation !== generation.current) {
        revokeAccepted();
        return;
      }
      if (accepted.length > 0)
        dispatch({
          type: "images_added",
          inputMode: mode,
          images: accepted,
          selectionExceeded: exceeded,
        });
      if (unsupported)
        dispatch({ type: "notice_set", notice: unsupportedNotice });
      else if (exceeded && accepted.length === 0)
        dispatch({
          type: "notice_set",
          notice: "Two images maximum. Remove one before adding another.",
        });
    },
    [dispatch, images.length, revoke],
  );

  const removeImage = useCallback(
    (image: EvidenceImage) => {
      revoke(image.objectUrl);
      dispatch({ type: "image_removed", id: image.id });
    },
    [dispatch, revoke],
  );
  const clearImages = useCallback(() => {
    generation.current += 1;
    for (const url of [...activeUrls.current]) revoke(url);
    dispatch({ type: "reset" });
  }, [dispatch, revoke]);

  useEffect(() => {
    mounted.current = true;
    const urls = activeUrls.current;
    return () => {
      mounted.current = false;
      generation.current += 1;
      for (const url of [...urls]) revoke(url);
    };
  }, [revoke]);

  return { addFiles, removeImage, clearImages };
}
