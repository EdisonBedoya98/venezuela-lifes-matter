"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  LoaderCircle,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GeocodeResult = {
  confidence: "exact" | "good" | "review";
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  locationType: string;
  needsReview: boolean;
  partialMatch: boolean;
  placeId: string;
  queryUsed: string;
  types: string[];
};

type GeocodeStatus = "idle" | "loading" | "ready" | "warning" | "error";

type GeocodeError = {
  message?: string;
};

type GoogleMapsWindow = typeof globalThis & {
  __vlmGoogleMapsOptionsSet?: boolean;
};

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const googleMapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
const watchedLocationFieldNames = new Set([
  "address",
  "city",
  "department",
  "locationDetails",
  "neighborhood",
]);
const cleanPreviewMapStyles: google.maps.MapTypeStyle[] = [
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
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a8dce8" }],
  },
];

export function LocationVerifier() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [status, setStatus] = useState<GeocodeStatus>("idle");
  const [message, setMessage] = useState(
    "Valida la direccion con Google para fijar el pin que revisara el equipo admin.",
  );

  useEffect(() => {
    const form = rootRef.current?.closest("form");

    if (!form) {
      return;
    }

    const resetLocation = (event: Event) => {
      const target = event.target;

      if (!isFormField(target)) {
        return;
      }

      const isLocationField =
        watchedLocationFieldNames.has(target.name) ||
        Boolean(target.dataset.locationSource);

      if (!isLocationField) {
        return;
      }

      setResult(null);
      setStatus("idle");
      setMessage(
        "Cambiaste datos de ubicacion. Vuelve a validar para fijar el pin correcto.",
      );
    };

    form.addEventListener("change", resetLocation);
    form.addEventListener("input", resetLocation);

    return () => {
      form.removeEventListener("change", resetLocation);
      form.removeEventListener("input", resetLocation);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderMapPreview = async () => {
      if (!googleMapsApiKey || !mapElementRef.current || !result) {
        return;
      }

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

      const position = result.coordinates;

      if (!mapRef.current) {
        mapRef.current = new Map(mapElementRef.current, {
          center: position,
          clickableIcons: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          gestureHandling: "none",
          keyboardShortcuts: false,
          mapId: googleMapsMapId,
          mapTypeControl: false,
          streetViewControl: false,
          styles: googleMapsMapId ? undefined : cleanPreviewMapStyles,
          zoom: 17,
          zoomControl: true,
        });
      } else {
        mapRef.current.setCenter(position);
        mapRef.current.setZoom(17);
      }

      markerRef.current?.setMap(null);
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position,
        title: "Pin propuesto",
      });
    };

    renderMapPreview().catch((error: unknown) => {
      console.error(error);
    });

    return () => {
      cancelled = true;
    };
  }, [result]);

  const verifyLocation = async () => {
    const form = rootRef.current?.closest("form");

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const payload = {
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      department: String(formData.get("department") ?? ""),
      locationDetails: String(formData.get("locationDetails") ?? ""),
      neighborhood: String(formData.get("neighborhood") ?? ""),
    };

    if (!payload.address || !payload.city || !payload.department) {
      setResult(null);
      setStatus("error");
      setMessage(
        "Completa departamento, ciudad y direccion antes de fijar el pin.",
      );
      return;
    }

    setResult(null);
    setStatus("loading");
    setMessage("Consultando Google Maps con la direccion completa...");

    try {
      const response = await fetch("/api/geocode", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as GeocodeResult | GeocodeError;

      if (!response.ok || !("coordinates" in data)) {
        const errorMessage =
          "message" in data
            ? data.message
            : "No pudimos validar la ubicacion con Google Maps.";

        throw new Error(
          errorMessage ?? "No pudimos validar la ubicacion con Google Maps.",
        );
      }

      setResult(data);
      setStatus(data.needsReview ? "warning" : "ready");
      setMessage(
        data.needsReview
          ? "Google encontro una ubicacion, pero el admin debe revisarla antes de publicar el pin."
          : "Pin exacto listo para que el admin lo apruebe.",
      );
    } catch (error) {
      setResult(null);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "No pudimos validar la ubicacion con Google Maps.",
      );
    }
  };

  const isLoading = status === "loading";
  const statusTone =
    status === "ready"
      ? "border-[#5cb85c]/35 bg-[#edf9ec]"
      : status === "warning"
        ? "border-[#f7c948]/45 bg-[#fff8d9]"
        : status === "error"
          ? "border-[#ef6f61]/35 bg-[#ffe2dd]"
          : "border-[#17324d]/10 bg-[#fffbf2]";
  const StatusIcon =
    status === "ready"
      ? CheckCircle2
      : status === "warning" || status === "error"
        ? AlertTriangle
        : Crosshair;

  return (
    <div
      className={`grid gap-4 rounded-[8px] border p-4 md:col-span-2 ${statusTone}`}
      ref={rootRef}
    >
      <input
        name="geoConfidence"
        type="hidden"
        value={result?.confidence ?? ""}
      />
      <input
        name="geoFormattedAddress"
        type="hidden"
        value={result?.formattedAddress ?? ""}
      />
      <input
        name="geoLatitude"
        type="hidden"
        value={result ? String(result.coordinates.lat) : ""}
      />
      <input
        name="geoLocationType"
        type="hidden"
        value={result?.locationType ?? ""}
      />
      <input
        name="geoLongitude"
        type="hidden"
        value={result ? String(result.coordinates.lng) : ""}
      />
      <input
        name="geoNeedsReview"
        type="hidden"
        value={result ? String(result.needsReview) : ""}
      />
      <input
        name="geoPartialMatch"
        type="hidden"
        value={result ? String(result.partialMatch) : ""}
      />
      <input name="geoPlaceId" type="hidden" value={result?.placeId ?? ""} />
      <input name="geoQueryUsed" type="hidden" value={result?.queryUsed ?? ""} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-white text-[#17324d] shadow-sm">
            <StatusIcon aria-hidden="true" size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-[#ef6f61]">
              Ubicacion del pin
            </p>
            <h3 className="mt-1 text-xl font-black text-[#17324d]">
              Validar coordenadas exactas
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#49656f]">
              {message}
            </p>
          </div>
        </div>

        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#17324d] px-4 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          disabled={isLoading}
          onClick={verifyLocation}
          type="button"
        >
          {isLoading ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <Crosshair aria-hidden="true" size={18} />
          )}
          {isLoading ? "Validando" : "Validar y fijar pin"}
        </button>
      </div>

      {result ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-3 rounded-[8px] border border-[#17324d]/10 bg-white p-3">
            <div>
              <p className="text-xs font-black uppercase text-[#617781]">
                Direccion Google
              </p>
              <p className="mt-1 text-sm font-black leading-6 text-[#17324d]">
                {result.formattedAddress}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <PinDetail label="Latitud" value={formatCoordinate(result.coordinates.lat)} />
              <PinDetail label="Longitud" value={formatCoordinate(result.coordinates.lng)} />
              <PinDetail label="Precision" value={result.locationType} />
              <PinDetail
                label="Revision"
                value={result.needsReview ? "Admin revisa" : "Lista"}
              />
            </div>
            <p className="text-xs font-semibold leading-5 text-[#617781]">
              Place ID: {result.placeId}
            </p>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[#17324d]/10 bg-[#d7f8f2]">
            {googleMapsApiKey ? (
              <div
                aria-label="Vista previa del pin propuesto"
                className="h-64 w-full"
                ref={mapElementRef}
              />
            ) : (
              <div className="grid h-64 place-items-center p-4 text-center text-sm font-black text-[#17324d]">
                Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para mostrar el mapa de
                confirmacion.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PinDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#fffbf2] p-2">
      <p className="text-[11px] font-black uppercase text-[#617781]">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-black text-[#17324d]">
        <MapPin aria-hidden="true" size={14} />
        {value}
      </p>
    </div>
  );
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function isFormField(
  target: EventTarget | null,
): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}
