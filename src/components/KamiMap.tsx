"use client";

import { useEffect, useRef, useState } from "react";
import type { DivIcon, LatLngExpression, Map as LeafletMap, Marker } from "leaflet";
import { Compass } from "@/components/Compass";
import { DestinationModal } from "@/components/DestinationModal";
import { StartupModal } from "@/components/StartupModal";
import type { GeocodeResult } from "@/lib/geocode";

const DEFAULT_CENTER: LatLngExpression = [35.681236, 139.767125];

type CurrentLocation = {
  lat: number;
  lng: number;
};

export function KamiMap() {
  const mapRootRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const destinationMarkerRef = useRef<Marker | null>(null);
  const destinationIconRef = useRef<DivIcon | null>(null);
  const currentLocationMarkerRef = useRef<Marker | null>(null);
  const currentLocationIconRef = useRef<DivIcon | null>(null);
  const [isStartupOpen, setIsStartupOpen] = useState(true);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [compassPermissionRequestKey, setCompassPermissionRequestKey] =
    useState(0);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(
    null
  );
  const [locationError, setLocationError] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function setupMap() {
      if (!mapRootRef.current || mapRef.current) {
        return;
      }

      const leaflet = await import("leaflet");

      if (!isMounted || !mapRootRef.current) {
        return;
      }

      destinationIconRef.current = leaflet.divIcon({
        className: "",
        html: '<div class="kami-destination-dot" aria-hidden="true"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      currentLocationIconRef.current = leaflet.divIcon({
        className: "",
        html: '<div class="kami-current-location-dot" aria-hidden="true"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const map = leaflet.map(mapRootRef.current, {
        center: DEFAULT_CENTER,
        zoom: 15,
        zoomControl: false,
        attributionControl: true
      });

      leaflet
        .tileLayer(
          "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">国土地理院</a>'
          }
        )
        .addTo(map);

      mapRef.current = map;
    }

    setupMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      window.setTimeout(() => mapRef.current?.invalidateSize(), 80);
    }
  }, [isStartupOpen]);

  function zoomIn() {
    mapRef.current?.zoomIn();
  }

  function zoomOut() {
    mapRef.current?.zoomOut();
  }

  function checkCurrentLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("現在地を取得できません。");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setCurrentLocation({
          lat: nextLocation.lat,
          lng: nextLocation.lng
        });
        placeCurrentLocation(nextLocation);
      },
      () => {
        setLocationError("現在地の取得に失敗しました。");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  async function placeCurrentLocation(location: CurrentLocation) {
    const leaflet = await import("leaflet");
    const map = mapRef.current;

    if (!map || !currentLocationIconRef.current) {
      return;
    }

    currentLocationMarkerRef.current?.remove();
    currentLocationMarkerRef.current = leaflet
      .marker([location.lat, location.lng], {
        icon: currentLocationIconRef.current,
        keyboard: false
      })
      .addTo(map);
  }

  async function placeDestination(destination: GeocodeResult) {
    const leaflet = await import("leaflet");
    const map = mapRef.current;

    if (!map || !destinationIconRef.current) {
      return;
    }

    destinationMarkerRef.current?.remove();
    destinationMarkerRef.current = leaflet
      .marker([destination.lat, destination.lng], {
        icon: destinationIconRef.current,
        keyboard: false
      })
      .addTo(map);

    map.setView([destination.lat, destination.lng], Math.max(map.getZoom(), 15), {
      animate: true
    });
    setDestinationLabel(destination.label);
  }

  const locationText = currentLocation
    ? `${currentLocation.lat.toFixed(6)} , ${currentLocation.lng.toFixed(6)}`
    : null;

  function openMap() {
    setIsStartupOpen(false);
    setCompassPermissionRequestKey((value) => value + 1);
  }

  return (
    <main className="relative h-svh w-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="absolute inset-0">
        <div ref={mapRootRef} className="h-full w-full" aria-label="KAMI地図" />
      </div>

      <Compass permissionRequestKey={compassPermissionRequestKey} />

      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[650] px-4 pt-4">
        {(locationText || locationError) && (
          <div className="mr-20 px-1 py-1 text-xs font-medium leading-5 text-[#0b1f3a] drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
            {locationText ? (
              <p>
                現在地：
                <br />
                {locationText}
              </p>
            ) : (
              <p className="text-red-700">{locationError}</p>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-5 left-4 z-[700] flex flex-col gap-2">
        <button
          type="button"
          onClick={checkCurrentLocation}
          className="rounded-sm border border-slate-300 bg-white/94 px-3 py-2 text-xs font-medium text-[#0b1f3a] shadow-sm backdrop-blur"
        >
          現在地を確認
        </button>
        <button
          type="button"
          onClick={() => setIsDestinationOpen(true)}
          className="rounded-sm border border-slate-300 bg-white/94 px-3 py-2 text-xs font-medium text-[#0b1f3a] shadow-sm backdrop-blur"
        >
          目的地
        </button>
      </div>

      <div className="fixed bottom-5 right-4 z-[700] grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="拡大"
          className="h-10 w-10 rounded-sm border border-slate-300 bg-white/94 text-lg font-medium text-[#0b1f3a] shadow-sm backdrop-blur"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          aria-label="縮小"
          className="h-10 w-10 rounded-sm border border-slate-300 bg-white/94 text-lg font-medium text-[#0b1f3a] shadow-sm backdrop-blur"
        >
          -
        </button>
      </div>

      {destinationLabel ? (
        <div className="fixed bottom-[8.75rem] left-4 z-[650] max-w-[calc(100vw-2rem)] rounded-sm border border-slate-200 bg-white/92 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur">
          目的地：{destinationLabel}
        </div>
      ) : null}

      {isStartupOpen ? (
        <StartupModal onClose={openMap} />
      ) : null}

      {isDestinationOpen ? (
        <DestinationModal
          onClose={() => setIsDestinationOpen(false)}
          onDestination={placeDestination}
        />
      ) : null}
    </main>
  );
}
