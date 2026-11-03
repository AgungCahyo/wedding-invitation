"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Facing = "user" | "environment";
export type CameraStatus = "starting" | "ready" | "denied" | "unsupported" | "error";

/**
 * Owns a getUserMedia stream for one <video> element.
 * Tracks are always stopped on unmount / switch, so the camera light
 * turns off the moment the guest closes the photo booth.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const aliveRef = useRef(true);
  const requestRef = useRef(0);

  const [status, setStatus] = useState<CameraStatus>("starting");
  const [facing, setFacing] = useState<Facing>("user");
  const [canSwitch, setCanSwitch] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(
    async (face: Facing) => {
      const request = ++requestRef.current;
      const stale = () => !aliveRef.current || request !== requestRef.current;
      stop();

      // getUserMedia only exists on HTTPS (or localhost).
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      setStatus("starting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: face },
            // Ask for Full HD on the long side: a 3:4 crop of 1080×1920 is
            // 1080×1440 of real pixels instead of an upscaled 720p frame.
            width: { ideal: 1920 },
            height: { ideal: 1920 },
          },
        });
        if (stale()) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        setFacing(face);
        setStatus("ready");

        // Device labels/count are only reliable after permission is granted.
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!stale()) {
          setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
        }
      } catch (err) {
        if (stale()) return;
        const name = err instanceof DOMException ? err.name : "";
        setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      }
    },
    [stop]
  );

  useEffect(() => {
    aliveRef.current = true;
    // Deferred so the initial permission request isn't a synchronous
    // setState inside the effect body.
    queueMicrotask(() => void start("user"));
    return () => {
      aliveRef.current = false; // makes any in-flight start() stale
      stop();
    };
  }, [start, stop]);

  const switchCamera = useCallback(
    () => start(facing === "user" ? "environment" : "user"),
    [facing, start]
  );
  const retry = useCallback(() => start(facing), [facing, start]);

  return { videoRef, status, facing, canSwitch, switchCamera, retry };
}