import type { AidCategory, AidCenter, AidCity, AidImpact } from "@/app/_types/aid";

type DataServiceConfig = {
  key: string;
  url: string;
};

type RestOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "PATCH";
  prefer?: string;
  serviceRole?: boolean;
  token?: string;
};

type CenterStatus = "pending" | "approved" | "rejected" | "archived";

type CategoryRow = {
  accent: string | null;
  id: string;
  label: string | null;
  short_label: string | null;
  surface: string | null;
};

type CityRow = {
  department: string | null;
  id: string;
  map_center_lat: number | string | null;
  map_center_lng: number | string | null;
  map_zoom: number | null;
  name: string | null;
};

type CenterRow = {
  address: string | null;
  approved_at?: string | null;
  attention_days?: string[] | null;
  categories: string[] | null;
  city: string | null;
  city_id: string | null;
  closing_time?: string | null;
  created_at?: string | null;
  department: string | null;
  description: string | null;
  formatted_address?: string | null;
  geocode_confidence?: string | null;
  geocode_needs_review?: boolean | null;
  geocode_query?: string | null;
  google_place_id?: string | null;
  hours_label: string | null;
  id: string;
  impact_families: number | null;
  impact_supplies_kg: number | null;
  impact_visits: number | null;
  latitude: number | string | null;
  location_details?: string | null;
  longitude: number | string | null;
  name: string | null;
  neighborhood: string | null;
  opening_time?: string | null;
  primary_category?: string | null;
  public_contact: string | null;
  requirements: string | null;
  reviewed_at?: string | null;
  slug: string;
  status?: CenterStatus;
};

type VerificationRow = {
  center_id: string;
  created_at?: string | null;
  reporter_email: string | null;
  reporter_name: string | null;
  reporter_organization: string | null;
  reporter_phone: string | null;
};

export type PublicMapData = {
  categories: AidCategory[];
  centers: AidCenter[];
  cities: AidCity[];
  impact: AidImpact;
  notice?: string;
};

export type AdminCenterSummary = {
  address: string;
  city: string;
  createdAt: string;
  databaseId: string;
  department: string;
  geocodeLabel: string;
  id: string;
  name: string;
  neighborhood: string;
  publicContact: string;
  reporter: string;
  reporterContact: string;
  signal: string;
  status: CenterStatus;
  verifiedAt: string;
};

export type AdminDashboardData = {
  approvedCenters: AdminCenterSummary[];
  impact: AidImpact;
  notice?: string;
  pendingCenters: AdminCenterSummary[];
};

export type UpdatesActionState = {
  message: string;
  status: "idle" | "success" | "config" | "error";
};

export type CenterSubmissionResult = {
  status: "recibido" | "config" | "error";
};

export type CenterReviewResult = {
  status: "approved" | "rejected" | "config" | "error";
};

const legacyProviderPrefix = "SUPA" + "BASE";
const dataServiceUrl = (
  process.env.DATA_API_URL ?? process.env[`NEXT_PUBLIC_${legacyProviderPrefix}_URL`]
)?.replace(/\/+$/, "");
const dataServiceAnonKey =
  process.env.DATA_API_ANON_KEY ??
  process.env[`NEXT_PUBLIC_${legacyProviderPrefix}_ANON_KEY`];
const dataServiceServiceRoleKey =
  process.env.DATA_API_SERVICE_KEY ??
  process.env[`${legacyProviderPrefix}_SERVICE_ROLE_KEY`];

const emptyImpact: AidImpact = {
  activeCenters: 0,
  families: 0,
  monthlyVisits: 0,
  suppliesKg: 0,
};

export async function getPublicMapData(): Promise<PublicMapData> {
  try {
    if (!getPublicDataServiceConfig()) {
      return {
        categories: [],
        centers: [],
        cities: [],
        impact: emptyImpact,
        notice:
          "Faltan variables del servidor. Cuando esten configuradas, el mapa cargara centros reales.",
      };
    }

    const [categoryRows, cityRows, centerRows] = await Promise.all([
      dataServiceRestFetch<CategoryRow[]>(
        "aid_categories?select=id,label,short_label,accent,surface&is_active=eq.true&order=sort_order.asc",
      ),
      dataServiceRestFetch<CityRow[]>(
        "aid_cities?select=id,name,department,map_center_lat,map_center_lng,map_zoom&is_active=eq.true&order=name.asc",
      ),
      dataServiceRestFetch<CenterRow[]>(
        [
          "aid_centers?select=",
          [
            "id",
            "slug",
            "name",
            "department",
            "city",
            "city_id",
            "neighborhood",
            "address",
            "location_details",
            "categories",
            "description",
            "hours_label",
            "requirements",
            "public_contact",
            "impact_visits",
            "impact_supplies_kg",
            "impact_families",
            "latitude",
            "longitude",
            "approved_at",
            "reviewed_at",
            "created_at",
          ].join(","),
          "&status=eq.approved&order=approved_at.desc",
        ].join(""),
      ),
    ]);

    const categories = categoryRows.map(mapCategoryRow);
    const centers = centerRows.map(mapCenterRow).filter(Boolean) as AidCenter[];
    const cities = addMissingCitiesForCenters(cityRows.map(mapCityRow), centers);
    const notice =
      centers.length === 0
        ? "Aun no hay centros aprobados en el mapa. Cuando el equipo apruebe postulaciones reales, apareceran aqui."
        : undefined;

    return {
      categories,
      centers,
      cities,
      impact: calculateImpact(centers),
      notice,
    };
  } catch (error) {
    console.error(error);

    return {
      categories: [],
      centers: [],
      cities: [],
      impact: emptyImpact,
      notice:
        "No pudimos cargar datos reales en este momento. Revisa la configuracion o las migraciones.",
    };
  }
}

export async function getAdminDashboardData(
  accessToken: string,
): Promise<AdminDashboardData> {
  try {
    const [pendingRows, approvedRows, verificationRows] = await Promise.all([
      fetchAdminCenters(accessToken, "pending"),
      fetchAdminCenters(accessToken, "approved"),
      dataServiceRestFetch<VerificationRow[]>(
        "center_verification_details?select=center_id,reporter_name,reporter_email,reporter_phone,reporter_organization,created_at&order=created_at.desc",
        { token: accessToken },
      ),
    ]);
    const verificationByCenterId = new Map(
      verificationRows.map((row) => [row.center_id, row]),
    );
    const approvedCenters = approvedRows.map((row) =>
      mapAdminCenterRow(row, verificationByCenterId.get(row.id)),
    );

    return {
      approvedCenters,
      impact: calculateImpact(approvedRows.map(mapCenterRow).filter(Boolean) as AidCenter[]),
      pendingCenters: pendingRows.map((row) =>
        mapAdminCenterRow(row, verificationByCenterId.get(row.id)),
      ),
    };
  } catch (error) {
    console.error(error);

    return {
      approvedCenters: [],
      impact: emptyImpact,
      notice:
        "No pudimos cargar la cola real. Verifica que tu usuario tenga rol admin y que las migraciones esten aplicadas.",
      pendingCenters: [],
    };
  }
}

export async function createCenterSubmission(
  formData: FormData,
): Promise<CenterSubmissionResult> {
  if (!getServiceDataServiceConfig()) {
    return { status: "config" };
  }

  try {
    const centerPayload = await buildCenterPayload(formData);
    const insertedRows = await dataServiceRestFetch<Array<{ id: string }>>(
      "aid_centers",
      {
        body: centerPayload,
        method: "POST",
        prefer: "return=representation",
        serviceRole: true,
      },
    );
    const centerId = insertedRows[0]?.id;

    if (!centerId) {
      return { status: "error" };
    }

    await dataServiceRestFetch("center_verification_details", {
      body: {
        center_id: centerId,
        data_consent: formData.get("dataConsent") === "on",
        email_consent: formData.get("emailConsent") === "on",
        raw_payload: {
          address: centerPayload.address,
          city: centerPayload.city,
          department: centerPayload.department,
          formatted_address: centerPayload.formatted_address,
          geocode_confidence: centerPayload.geocode_confidence,
          geocode_location_type: centerPayload.geocode_location_type,
          geocode_needs_review: centerPayload.geocode_needs_review,
          geocode_partial_match: centerPayload.geocode_partial_match,
          geocode_query: centerPayload.geocode_query,
          google_place_id: centerPayload.google_place_id,
          latitude: centerPayload.latitude,
          location_details: centerPayload.location_details,
          longitude: centerPayload.longitude,
          neighborhood: centerPayload.neighborhood,
        },
        reporter_email: cleanFormValue(formData, "email"),
        reporter_name: cleanFormValue(formData, "reporterName"),
        reporter_organization: optionalFormValue(formData, "organization"),
        reporter_phone: cleanFormValue(formData, "phone"),
      },
      method: "POST",
      serviceRole: true,
    });

    return { status: "recibido" };
  } catch (error) {
    console.error(error);

    return { status: "error" };
  }
}

export async function subscribeToUpdates(
  formData: FormData,
): Promise<UpdatesActionState> {
  if (!getServiceDataServiceConfig()) {
    return {
      message:
        "Faltan variables del servidor para guardar este contacto. Intentalo mas tarde.",
      status: "config",
    };
  }

  try {
    const email = cleanFormValue(formData, "email").toLowerCase();

    if (!email || formData.get("dataConsent") !== "on") {
      return {
        message: "Completa el correo y acepta el tratamiento de datos.",
        status: "error",
      };
    }

    await dataServiceRestFetch("newsletter_subscribers?on_conflict=email", {
      body: {
        city: cleanFormValue(formData, "city"),
        consent: true,
        department: optionalFormValue(formData, "department"),
        email,
        full_name: cleanFormValue(formData, "fullName"),
        phone: optionalFormValue(formData, "phone"),
        source: "public_updates_modal",
      },
      method: "POST",
      prefer: "resolution=merge-duplicates",
      serviceRole: true,
    });

    return {
      message: "Listo. Guardamos tu contacto para enviarte actualizaciones reales.",
      status: "success",
    };
  } catch (error) {
    console.error(error);

    return {
      message: "No pudimos guardar tu contacto. Intenta de nuevo.",
      status: "error",
    };
  }
}

export async function reviewPendingCenter({
  accessToken,
  centerId,
  decision,
  reviewerId,
}: {
  accessToken: string;
  centerId: string;
  decision: "approved" | "rejected";
  reviewerId?: string;
}): Promise<CenterReviewResult> {
  if (!getPublicDataServiceConfig()) {
    return { status: "config" };
  }

  try {
    const now = new Date().toISOString();
    const approved = decision === "approved";

    await dataServiceRestFetch(
      `aid_centers?id=eq.${encodeURIComponent(centerId)}`,
      {
        body: {
          approved_at: approved ? now : null,
          geocode_needs_review: approved ? false : true,
          rejection_reason: approved
            ? null
            : "Centro rechazado desde el panel administrativo.",
          reviewed_at: now,
          reviewed_by: reviewerId ?? null,
          status: decision,
        },
        method: "PATCH",
        prefer: "return=minimal",
        token: accessToken,
      },
    );

    return { status: decision };
  } catch (error) {
    console.error(error);

    return { status: "error" };
  }
}

async function fetchAdminCenters(accessToken: string, status: CenterStatus) {
  return dataServiceRestFetch<CenterRow[]>(
    [
      "aid_centers?select=",
      [
        "id",
        "slug",
        "status",
        "name",
        "department",
        "city",
        "city_id",
        "neighborhood",
        "address",
        "location_details",
        "categories",
        "description",
        "hours_label",
        "requirements",
        "public_contact",
        "impact_visits",
        "impact_supplies_kg",
        "impact_families",
        "latitude",
        "longitude",
        "geocode_confidence",
        "geocode_needs_review",
        "created_at",
        "approved_at",
        "reviewed_at",
      ].join(","),
      `&status=eq.${status}&order=created_at.desc`,
    ].join(""),
    { token: accessToken },
  );
}

async function buildCenterPayload(formData: FormData) {
  const department = cleanFormValue(formData, "department");
  const city = cleanFormValue(formData, "city");
  const neighborhood = cleanFormValue(formData, "neighborhood");
  const centerName = cleanFormValue(formData, "centerName");
  const category = cleanFormValue(formData, "category");
  const openingTime = cleanFormValue(formData, "openingTime");
  const closingTime = cleanFormValue(formData, "closingTime");
  const attentionDays = parseAttentionDays(cleanFormValue(formData, "hours"));
  const latitude = Number(formData.get("geoLatitude"));
  const longitude = Number(formData.get("geoLongitude"));
  const cityId = await resolveCityId(city, department);

  return {
    address: cleanFormValue(formData, "address"),
    attention_days: attentionDays,
    categories: category ? [category] : [],
    city,
    city_id: cityId,
    closing_time: closingTime || null,
    department,
    description: cleanFormValue(formData, "description"),
    formatted_address: cleanFormValue(formData, "geoFormattedAddress"),
    geocode_confidence: cleanFormValue(formData, "geoConfidence"),
    geocode_location_type: cleanFormValue(formData, "geoLocationType"),
    geocode_needs_review: formData.get("geoNeedsReview") === "true",
    geocode_partial_match: formData.get("geoPartialMatch") === "true",
    geocode_query: cleanFormValue(formData, "geoQueryUsed"),
    google_place_id: cleanFormValue(formData, "geoPlaceId"),
    hours_label: formatHoursLabel(attentionDays, openingTime, closingTime),
    latitude,
    location_details: optionalFormValue(formData, "locationDetails"),
    longitude,
    name: centerName,
    neighborhood: neighborhood || null,
    opening_time: openingTime || null,
    primary_category: category || null,
    public_contact: optionalFormValue(formData, "publicContact"),
    requirements: optionalFormValue(formData, "requirements"),
    slug: `${slugify(centerName)}-${Date.now().toString(36)}`,
    status: "pending",
  };
}

async function resolveCityId(city: string, department: string) {
  const rows = await dataServiceRestFetch<Array<{ id: string }>>(
    `aid_cities?select=id&name=eq.${encodeURIComponent(city)}&department=eq.${encodeURIComponent(
      department,
    )}&limit=1`,
    { serviceRole: true },
  );

  return rows[0]?.id ?? null;
}

async function dataServiceRestFetch<T>(
  path: string,
  options: RestOptions = {},
): Promise<T> {
  const config = options.serviceRole
    ? getServiceDataServiceConfig()
    : getPublicDataServiceConfig();

  if (!config) {
    throw new Error("El servicio de datos no esta configurado.");
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${options.token ?? config.key}`,
      "Content-Type": "application/json",
      apikey: config.key,
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || `El servicio de datos respondio ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

function getPublicDataServiceConfig(): DataServiceConfig | null {
  if (!dataServiceUrl || !dataServiceAnonKey) {
    return null;
  }

  return {
    key: dataServiceAnonKey,
    url: dataServiceUrl,
  };
}

function getServiceDataServiceConfig(): DataServiceConfig | null {
  if (!dataServiceUrl || !dataServiceServiceRoleKey) {
    return null;
  }

  return {
    key: dataServiceServiceRoleKey,
    url: dataServiceUrl,
  };
}

function mapCategoryRow(row: CategoryRow): AidCategory {
  return {
    accent: row.accent ?? "#24A7A1",
    id: row.id,
    label: row.label ?? row.id,
    shortLabel: row.short_label ?? row.label ?? row.id,
    surface: row.surface ?? "#D7F8F2",
  };
}

function mapCityRow(row: CityRow): AidCity {
  const lat = toFiniteNumber(row.map_center_lat) ?? 4.5709;
  const lng = toFiniteNumber(row.map_center_lng) ?? -74.2973;

  return {
    id: row.id,
    map: {
      center: { lat, lng },
      zoom: row.map_zoom ?? 12,
    },
    name: row.name ?? row.id,
    region: row.department ?? "Colombia",
  };
}

function mapCenterRow(row: CenterRow): AidCenter | null {
  const lat = toFiniteNumber(row.latitude);
  const lng = toFiniteNumber(row.longitude);

  if (lat === null || lng === null) {
    return null;
  }

  const cityName = row.city ?? "Colombia";
  const department = row.department ?? "Colombia";

  return {
    address: row.address ?? row.formatted_address ?? "Direccion por confirmar",
    categories: getCenterCategories(row),
    cityId: row.city_id ?? slugify(cityName),
    cityName,
    coordinates: { lat, lng },
    databaseId: row.id,
    department,
    description: row.description ?? "Centro aprobado por el equipo.",
    hours: row.hours_label ?? "Horario por confirmar",
    id: row.slug,
    impact: {
      families: row.impact_families ?? 0,
      suppliesKg: row.impact_supplies_kg ?? 0,
      visits: row.impact_visits ?? 0,
    },
    locationDetails: row.location_details ?? "",
    name: row.name ?? "Centro de ayuda",
    neighborhood: row.neighborhood ?? cityName,
    position: { x: 50, y: 50 },
    publicContact: row.public_contact ?? "",
    requirements:
      row.requirements ?? "Consulta los requisitos directamente con el centro.",
    verifiedAt: formatVerifiedAt(row.approved_at ?? row.reviewed_at ?? row.created_at),
  };
}

function mapAdminCenterRow(
  row: CenterRow,
  verification?: VerificationRow,
): AdminCenterSummary {
  return {
    address: row.address ?? row.formatted_address ?? "Direccion por confirmar",
    city: row.city ?? "Sin ciudad",
    createdAt: formatVerifiedAt(row.created_at),
    databaseId: row.id,
    department: row.department ?? "Sin departamento",
    geocodeLabel: row.geocode_confidence ?? "sin geocodificacion",
    id: row.slug,
    name: row.name ?? "Centro sin nombre",
    neighborhood: row.neighborhood ?? "Sin barrio",
    publicContact: row.public_contact ?? "Sin contacto publico",
    reporter: verification?.reporter_name ?? "Sin reportero",
    reporterContact: [verification?.reporter_email, verification?.reporter_phone]
      .filter(Boolean)
      .join(" · "),
    signal: row.geocode_needs_review
      ? "Ubicacion requiere revision"
      : "Pin geocodificado",
    status: row.status ?? "pending",
    verifiedAt: formatVerifiedAt(row.approved_at ?? row.reviewed_at ?? row.created_at),
  };
}

function addMissingCitiesForCenters(cities: AidCity[], centers: AidCenter[]) {
  const cityById = new Map(cities.map((city) => [city.id, city]));

  centers.forEach((center) => {
    if (cityById.has(center.cityId)) {
      return;
    }

    cityById.set(center.cityId, {
      id: center.cityId,
      map: {
        center: center.coordinates,
        zoom: 12,
      },
      name: center.cityName,
      region: center.department,
    });
  });

  return Array.from(cityById.values());
}

function calculateImpact(centers: AidCenter[]): AidImpact {
  return centers.reduce<AidImpact>(
    (impact, center) => ({
      activeCenters: impact.activeCenters + 1,
      families: impact.families + center.impact.families,
      monthlyVisits: impact.monthlyVisits + center.impact.visits,
      suppliesKg: impact.suppliesKg + center.impact.suppliesKg,
    }),
    emptyImpact,
  );
}

function getCenterCategories(row: CenterRow) {
  const categories = row.categories?.filter(Boolean) ?? [];

  if (categories.length > 0) {
    return categories;
  }

  return row.primary_category ? [row.primary_category] : [];
}

function parseAttentionDays(value: string) {
  return value
    .split(",")
    .map((day) => day.trim())
    .filter(Boolean);
}

function formatHoursLabel(days: string[], openingTime: string, closingTime: string) {
  const daysLabel = days.length > 0 ? days.join(", ") : "Dias por confirmar";
  const timeLabel =
    openingTime && closingTime
      ? `${formatTime(openingTime)} - ${formatTime(closingTime)}`
      : "Horario por confirmar";

  return `${daysLabel} · ${timeLabel}`;
}

function formatTime(value: string) {
  const [hour = "", minute = ""] = value.split(":");

  return hour && minute ? `${hour}:${minute}` : value;
}

function formatVerifiedAt(value?: string | null) {
  if (!value) {
    return "Fecha por confirmar";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha por confirmar";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function cleanFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function optionalFormValue(formData: FormData, name: string) {
  const value = cleanFormValue(formData, name);

  return value || null;
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return slug || "centro";
}

function toFiniteNumber(value: number | string | null | undefined) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}
