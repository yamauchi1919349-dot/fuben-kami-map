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
      className="fixed right-4 top-4 z-[700] grid h-14 w-14 place-items-center rounded-full border border-[#0b1f3a]/30 bg-[#f8f3e7]/95 text-[#0b1f3a] shadow-sm backdrop-blur"
      aria-label={label}
      role="img"
    >
      <div className="relative h-12 w-12 rounded-full border border-[#0b1f3a]/55 bg-[#fffaf0] shadow-inner">
        <div className="absolute inset-1 rounded-full border border-[#0b1f3a]/15" />
        <div className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-[#0b1f3a]/45" />
        <div className="absolute bottom-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-[#0b1f3a]/35" />
        <div className="absolute left-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-[#0b1f3a]/35" />
        <div className="absolute right-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-[#0b1f3a]/35" />

        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[8px] font-bold leading-none text-[#0b1f3a]">
          N
        </span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-semibold leading-none text-[#0b1f3a]/55">
          E
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-semibold leading-none text-[#0b1f3a]/55">
          S
        </span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-semibold leading-none text-[#0b1f3a]/55">
          W
        </span>

        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: `rotate(${needleRotation}deg)`
          }}
        >
          <div className="absolute left-1/2 top-[8px] h-[15px] w-[7px] -translate-x-1/2 rounded-t-full bg-red-600 shadow-[0_1px_2px_rgba(15,23,42,0.24)] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
          <div className="absolute bottom-[8px] left-1/2 h-[15px] w-[7px] -translate-x-1/2 rounded-b-full bg-blue-600 shadow-[0_1px_2px_rgba(15,23,42,0.18)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0b1f3a]/25 bg-white shadow-sm" />
      </div>
    </div>
  );
}
