type GeocodeRequest = {
  address?: unknown;
  city?: unknown;
  department?: unknown;
  locationDetails?: unknown;
  neighborhood?: unknown;
};

type GoogleGeocodeResponse = {
  error_message?: string;
  results?: GoogleGeocodeResult[];
  status: string;
};

type GoogleGeocodeResult = {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
  };
  partial_match?: boolean;
  place_id: string;
  types: string[];
};

const googleMapsApiKey =
  process.env.GOOGLE_MAPS_SERVER_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const colombiaBounds = {
  maxLat: 13.8,
  maxLng: -66.8,
  minLat: -4.5,
  minLng: -82.2,
};

export async function POST(request: Request) {
  if (!googleMapsApiKey) {
    return Response.json(
      {
        message:
          "Falta configurar GOOGLE_MAPS_SERVER_API_KEY o NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
      },
      { status: 503 },
    );
  }

  let payload: GeocodeRequest;

  try {
    payload = (await request.json()) as GeocodeRequest;
  } catch {
    return Response.json({ message: "Solicitud invalida." }, { status: 400 });
  }

  const address = cleanText(payload.address);
  const city = cleanText(payload.city);
  const department = cleanText(payload.department);
  const neighborhood = cleanText(payload.neighborhood);

  if (!address || !city || !department) {
    return Response.json(
      {
        message:
          "Necesitamos direccion, ciudad y departamento para fijar el pin.",
      },
      { status: 400 },
    );
  }

  const queries = buildAddressQueries({
    address,
    city,
    department,
    neighborhood,
  });

  try {
    for (const query of queries) {
      const geocodeResult = await geocodeAddress(query);

      if (!geocodeResult) {
        continue;
      }

      const { lat, lng } = geocodeResult.geometry.location;

      if (!isInsideColombia(lat, lng)) {
        return Response.json(
          {
            message:
              "Google encontro una ubicacion fuera de Colombia. Revisa ciudad, departamento y direccion.",
          },
          { status: 422 },
        );
      }

      const confidence = getConfidence(geocodeResult);

      return Response.json({
        confidence,
        coordinates: { lat, lng },
        formattedAddress: geocodeResult.formatted_address,
        locationType: geocodeResult.geometry.location_type,
        needsReview: confidence !== "exact",
        partialMatch: Boolean(geocodeResult.partial_match),
        placeId: geocodeResult.place_id,
        queryUsed: query,
        types: geocodeResult.types,
      });
    }
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No pudimos consultar Google Maps.",
      },
      { status: 502 },
    );
  }

  return Response.json(
    {
      message:
        "No encontramos esa direccion. Intenta con nomenclatura completa, barrio y ciudad.",
    },
    { status: 404 },
  );
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function buildAddressQueries({
  address,
  city,
  department,
  neighborhood,
}: {
  address: string;
  city: string;
  department: string;
  neighborhood: string;
}) {
  const preciseParts = [address, neighborhood, city, department, "Colombia"];
  const cityParts = [address, city, department, "Colombia"];
  const uniqueQueries = new Set(
    [preciseParts, cityParts]
      .map((parts) => parts.filter(Boolean).join(", "))
      .filter(Boolean),
  );

  return Array.from(uniqueQueries);
}

async function geocodeAddress(query: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");

  url.searchParams.set("address", query);
  url.searchParams.set("components", "country:CO");
  url.searchParams.set("key", googleMapsApiKey ?? "");
  url.searchParams.set("language", "es");
  url.searchParams.set("region", "co");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Google Maps Geocoding no respondio correctamente.");
  }

  const data = (await response.json()) as GoogleGeocodeResponse;

  if (data.status === "REQUEST_DENIED") {
    throw new Error(
      data.error_message ?? "Google rechazo la solicitud de geocodificacion.",
    );
  }

  return data.results?.[0] ?? null;
}

function isInsideColombia(lat: number, lng: number) {
  return (
    lat >= colombiaBounds.minLat &&
    lat <= colombiaBounds.maxLat &&
    lng >= colombiaBounds.minLng &&
    lng <= colombiaBounds.maxLng
  );
}

function getConfidence(result: GoogleGeocodeResult) {
  const preciseTypes = new Set([
    "establishment",
    "point_of_interest",
    "premise",
    "street_address",
    "subpremise",
  ]);
  const hasPreciseType = result.types.some((type) => preciseTypes.has(type));

  if (result.partial_match) {
    return "review";
  }

  if (result.geometry.location_type === "ROOFTOP" && hasPreciseType) {
    return "exact";
  }

  if (result.geometry.location_type === "ROOFTOP") {
    return "good";
  }

  return "review";
}
