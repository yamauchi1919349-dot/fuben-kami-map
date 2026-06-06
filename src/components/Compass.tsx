"use client";

import { useEffect, useState } from "react";

type WebkitDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

type CompassProps = {
  permissionRequestKey: number;
};

export function Compass({ permissionRequestKey }: CompassProps) {
  const [heading, setHeading] = useState<number | null>(null);
  const [isUnsupported, setIsUnsupported] = useState(false);

  useEffect(() => {
    function handleOrientation(event: DeviceOrientationEvent) {
      const orientationEvent = event as WebkitDeviceOrientationEvent;
      const nextHeading =
        typeof orientationEvent.webkitCompassHeading === "number"
          ? orientationEvent.webkitCompassHeading
          : typeof event.alpha === "number"
            ? 360 - event.alpha
            : null;

      if (nextHeading !== null) {
        setHeading(Math.round((nextHeading + 360) % 360));
        setIsUnsupported(false);
      }
    }

    if (!("DeviceOrientationEvent" in window)) {
      setIsUnsupported(true);
      return;
    }

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  useEffect(() => {
    if (permissionRequestKey === 0) {
      return;
    }

    async function requestCompassPermission() {
      await enableCompass();
    }

    requestCompassPermission();
  }, [permissionRequestKey]);

  async function enableCompass() {
    if (!("DeviceOrientationEvent" in window)) {
      setIsUnsupported(true);
      return;
    }

    try {
      const orientationEvent =
        DeviceOrientationEvent as DeviceOrientationEventWithPermission;

      if (typeof orientationEvent.requestPermission === "function") {
        const wantsSensor = window.confirm("方位センサーを使用します");

        if (!wantsSensor) {
          return;
        }

        const permission = await orientationEvent.requestPermission();

        if (permission !== "granted") {
          setIsUnsupported(true);
          return;
        }
      }
    } catch {
      setIsUnsupported(true);
    }
  }

  const needleRotation = heading === null ? 0 : -heading;
  const label = isUnsupported ? "方位未対応" : "方位磁石";

  return (
    <div
      className="fixed right-4 top-4 z-[700] grid h-14 w-14 place-items-center rounded-full border border-slate-300 bg-white/92 text-[#0b1f3a] shadow-sm backdrop-blur"
      aria-label={label}
      role="img"
    >
      <div className="relative h-11 w-11 rounded-full border border-slate-200 bg-slate-50 shadow-inner">
        <span className="absolute left-1/2 top-0.5 -translate-x-1/2 text-[9px] font-semibold leading-none text-slate-700">
          N
        </span>
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold leading-none text-slate-400">
          S
        </span>
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: `rotate(${needleRotation}deg)`
          }}
        >
          <div className="absolute left-1/2 top-[5px] h-[18px] w-1.5 -translate-x-1/2 rounded-full bg-red-600" />
          <div className="absolute bottom-[5px] left-1/2 h-[18px] w-1.5 -translate-x-1/2 rounded-full bg-blue-600" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300 bg-white" />
      </div>
    </div>
  );
}
