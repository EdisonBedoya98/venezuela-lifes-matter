"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";
import type { AidCategory, AidCategoryId, AidCenter } from "@/app/_data/aid-centers";

type GoogleAidMapProps = {
  categoryById: Map<AidCategoryId, AidCategory>;
  centers: AidCenter[];
  selectedCenterId?: string;
  visibleCenterIds: Set<string>;
  onSelectCenter: (centerId: string) => void;
};

type CSSVariableProperties = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

type GoogleMapsWindow = typeof globalThis & {
  __vlmGoogleMapsOptionsSet?: boolean;
};

const GOOGLE_MAPS_CENTER = { lat: 6.2442, lng: -75.5812 };
const GOOGLE_MAPS_ZOOM = 12;
const PIN_IMAGE_URL = "/pin-velezuela.webp";
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const googleMapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
const cleanMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f3f1e8" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6e7f87" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a8dce8" }],
  },
];

export function GoogleAidMap({
  categoryById,
  centers,
  onSelectCenter,
  selectedCenterId,
  visibleCenterIds,
}: GoogleAidMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Array<google.maps.marker.AdvancedMarkerElement | google.maps.Marker>>([]);
  const [loadState, setLoadState] = useState<"idle" | "ready" | "missing-key" | "error">(
    googleMapsApiKey ? "idle" : "missing-key",
  );

  useEffect(() => {
    let cancelled = false;

    if (!googleMapsApiKey || !mapElementRef.current) {
      setLoadState("missing-key");
      return;
    }

    const loadMap = async () => {
      try {
        const globalWithMaps = globalThis as GoogleMapsWindow;

        if (!globalWithMaps.__vlmGoogleMapsOptionsSet) {
          setOptions({
            key: googleMapsApiKey,
            language: "es",
            mapIds: googleMapsMapId ? [googleMapsMapId] : undefined,
            region: "CO",
            v: "weekly",
          });
          globalWithMaps.__vlmGoogleMapsOptionsSet = true;
        }

        const { Map } = await importLibrary("maps");

        if (cancelled || !mapElementRef.current) {
          return;
        }

        mapRef.current = new Map(mapElementRef.current, {
          center: GOOGLE_MAPS_CENTER,
          clickableIcons: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          gestureHandling: "greedy",
          mapId: googleMapsMapId,
          mapTypeControl: false,
          streetViewControl: false,
          styles: googleMapsMapId ? undefined : cleanMapStyles,
          zoom: GOOGLE_MAPS_ZOOM,
          zoomControl: true,
        });

        setLoadState("ready");
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setLoadState("error");
        }
      }
    };

    loadMap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderMarkers = async () => {
      const map = mapRef.current;

      if (!map || !googleMapsApiKey || loadState !== "ready") {
        return;
      }

      markersRef.current.forEach((marker) => {
        if ("setMap" in marker) {
          marker.setMap(null);
        } else {
          marker.map = null;
        }
      });
      markersRef.current = [];

      const selectedCenter = centers.find((center) => center.id === selectedCenterId);

      if (selectedCenter) {
        map.panTo(selectedCenter.coordinates);
      }

      if (googleMapsMapId) {
        const { AdvancedMarkerElement } = await importLibrary("marker");

        if (cancelled) {
          return;
        }

        centers.forEach((center) => {
          const visible = visibleCenterIds.has(center.id);
          const selected = center.id === selectedCenterId;
          const markerElement = document.createElement("button");
          const markerImage = document.createElement("img");

          markerElement.className = "google-aid-image-marker";
          markerElement.dataset.selected = String(selected);
          markerElement.dataset.muted = String(!visible);
          markerElement.type = "button";
          markerImage.alt = "";
          markerImage.src = PIN_IMAGE_URL;
          markerElement.append(markerImage);
          markerElement.addEventListener("click", () => onSelectCenter(center.id));

          const marker = new AdvancedMarkerElement({
            content: markerElement,
            map,
            position: center.coordinates,
            title: center.name,
          });

          markersRef.current.push(marker);
        });

        return;
      }

      centers.forEach((center) => {
        const visible = visibleCenterIds.has(center.id);
        const selected = center.id === selectedCenterId;
        const markerSize = selected ? 58 : 48;
        const pinImageUrl = new URL(PIN_IMAGE_URL, window.location.origin).toString();
        const marker = new google.maps.Marker({
          icon: {
            anchor: new google.maps.Point(markerSize / 2, markerSize),
            scaledSize: new google.maps.Size(markerSize, markerSize),
            url: pinImageUrl,
          },
          map,
          opacity: visible ? 1 : 0.35,
          position: center.coordinates,
          title: center.name,
          zIndex: selected ? 20 : 10,
        });

        marker.addListener("click", () => onSelectCenter(center.id));
        markersRef.current.push(marker);
      });
    };

    renderMarkers();

    return () => {
      cancelled = true;
    };
  }, [centers, loadState, onSelectCenter, selectedCenterId, visibleCenterIds]);

  if (loadState === "missing-key") {
    return (
      <FallbackMap
        centers={centers}
        categoryById={categoryById}
        onSelectCenter={onSelectCenter}
        selectedCenterId={selectedCenterId}
        visibleCenterIds={visibleCenterIds}
      />
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-[#d7f8f2]" ref={mapElementRef} />
      {loadState === "error" ? (
        <div className="absolute inset-x-4 top-20 z-10 rounded-[8px] border border-[#ef6f61]/30 bg-[#fffbf2] p-3 text-sm font-bold text-[#17324d] shadow-sm">
          No pudimos cargar Google Maps. Revisa la API key, restricciones de
          dominio y que Maps JavaScript API este habilitada.
        </div>
      ) : null}
      {!googleMapsMapId && googleMapsApiKey ? (
        <div className="absolute bottom-[250px] left-4 right-4 z-10 rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2]/95 p-3 text-xs font-bold text-[#49656f] shadow-sm lg:bottom-5 lg:left-5 lg:right-auto lg:max-w-xs">
          Para pines personalizados modernos agrega{" "}
          <span className="text-[#17324d]">NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID</span>.
        </div>
      ) : null}
    </>
  );
}

function FallbackMap({
  categoryById,
  centers,
  onSelectCenter,
  selectedCenterId,
  visibleCenterIds,
}: GoogleAidMapProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#d7f8f2]">
      <div className="google-map-placeholder" />
      <div className="absolute inset-x-4 top-20 z-10 rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2]/95 p-3 text-sm font-bold text-[#17324d] shadow-sm lg:max-w-sm">
        Agrega <span className="text-[#ef6f61]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>{" "}
        para cargar Google Maps real.
      </div>
      {centers.map((center) => {
        const primaryCategory = categoryById.get(center.categories[0]);
        const isSelected = center.id === selectedCenterId;
        const isVisible = visibleCenterIds.has(center.id);

        return (
          <button
            aria-label={`Ver ${center.name}`}
            className="aid-map-pin"
            data-muted={!isVisible}
            data-selected={isSelected}
            key={center.id}
            onClick={() => onSelectCenter(center.id)}
            style={
              {
                left: `${center.position.x}%`,
                top: `${center.position.y}%`,
                "--pin-color": primaryCategory?.accent ?? "#24A7A1",
                "--pin-surface": primaryCategory?.surface ?? "#D7F8F2",
              } as CSSVariableProperties
            }
            type="button"
          >
            <span className="aid-map-pin__image-wrap" />
          </button>
        );
      })}
    </div>
  );
}
