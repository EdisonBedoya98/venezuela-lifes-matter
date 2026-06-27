"use client";

import {
  Bus,
  Bell,
  ChevronDown,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  X,
  FileCheck2,
  Gift,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Shirt,
  Soup,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleAidMap } from "@/app/_components/google-aid-map";
import type {
  AidCategory,
  AidCategoryId,
  AidCenter,
  AidCity,
  AidCityId,
} from "@/app/_data/aid-centers";

type AidMapExperienceProps = {
  categories: AidCategory[];
  centers: AidCenter[];
  cities: AidCity[];
  impact: {
    activeCenters: number;
    monthlyVisits: number;
    suppliesKg: number;
    families: number;
  };
};

type CategoryFilter = AidCategoryId | "all";
type CityFilter = AidCityId | "all";
type CSSVariableProperties = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

const categoryIcons = {
  food: Soup,
  health: Stethoscope,
  shelter: Home,
  documents: FileCheck2,
  supplies: Shirt,
  transport: Bus,
  donations: Gift,
  volunteers: UsersRound,
} satisfies Record<AidCategoryId, typeof Soup>;

const formatNumber = new Intl.NumberFormat("es-CO");
const COLOMBIA_MAP = {
  center: {
    lat: 4.5709,
    lng: -74.2973,
  },
  zoom: 5,
};
const CENTER_QUERY_PARAM = "centro";

function getImpactFromCenters(centers: AidCenter[]) {
  return {
    activeCenters: centers.length,
    families: centers.reduce((total, center) => total + center.impact.families, 0),
    monthlyVisits: centers.reduce((total, center) => total + center.impact.visits, 0),
    suppliesKg: centers.reduce((total, center) => total + center.impact.suppliesKg, 0),
  };
}

function getCenterShareUrl(center: AidCenter) {
  if (typeof window === "undefined") {
    return `/?${CENTER_QUERY_PARAM}=${center.id}`;
  }

  const url = new URL(window.location.href);

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  url.searchParams.set(CENTER_QUERY_PARAM, center.id);

  return url.toString();
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.slice(0, maxLines).forEach((line, index) => {
    const finalLine =
      index === maxLines - 1 && lines.length > maxLines ? `${line}...` : line;

    context.fillText(finalLine, x, y + index * lineHeight);
  });

  return y + Math.min(lines.length, maxLines) * lineHeight;
}

function drawPill(
  context: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  fill: string,
) {
  context.font = "900 30px Arial";
  const width = context.measureText(label).width + 42;

  context.fillStyle = fill;
  drawRoundedRect(context, x, y, width, 52, 26);
  context.fill();
  context.fillStyle = "#17324d";
  context.fillText(label, x + 21, y + 36);

  return width;
}

function generateInstagramImage(
  center: AidCenter,
  categoryById: Map<AidCategoryId, AidCategory>,
  centerUrl: string,
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 1080;
  canvas.height = 1350;

  if (!context) {
    return "";
  }

  context.fillStyle = "#fff8e8";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#17324d";
  drawRoundedRect(context, 56, 56, 968, 1238, 34);
  context.fill();

  context.fillStyle = "#24a7a1";
  drawRoundedRect(context, 56, 56, 968, 252, 34);
  context.fill();

  context.fillStyle = "#f7c948";
  context.beginPath();
  context.arc(900, 104, 84, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#17324d";
  context.beginPath();
  context.arc(900, 126, 34, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ef6f61";
  context.beginPath();
  context.moveTo(900, 202);
  context.lineTo(866, 140);
  context.lineTo(934, 140);
  context.closePath();
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = "900 34px Arial";
  context.fillText("VENEZUELA LIVES MATTER", 96, 128);
  context.font = "900 64px Arial";
  drawWrappedText(
    context,
    "Centro de ayuda verificado",
    96,
    206,
    710,
    72,
    2,
  );

  context.fillStyle = "#fffbf2";
  drawRoundedRect(context, 96, 360, 888, 640, 28);
  context.fill();

  context.fillStyle = "#ef6f61";
  context.font = "900 34px Arial";
  context.fillText(center.neighborhood.toUpperCase(), 136, 430);

  context.fillStyle = "#17324d";
  context.font = "900 70px Arial";
  const afterTitleY = drawWrappedText(
    context,
    center.name,
    136,
    514,
    810,
    78,
    3,
  );

  context.fillStyle = "#49656f";
  context.font = "700 34px Arial";
  let nextY = drawWrappedText(
    context,
    center.address,
    136,
    afterTitleY + 24,
    810,
    44,
    2,
  );

  context.fillStyle = "#5cb85c";
  context.font = "900 31px Arial";
  nextY = drawWrappedText(context, center.hours, 136, nextY + 22, 810, 42, 2);

  context.fillStyle = "#49656f";
  context.font = "700 32px Arial";
  drawWrappedText(context, center.description, 136, nextY + 30, 810, 43, 4);

  let pillX = 136;
  let pillY = 888;

  center.categories.slice(0, 3).forEach((categoryId) => {
    const category = categoryById.get(categoryId);
    const width = drawPill(
      context,
      category?.shortLabel ?? categoryId,
      pillX,
      pillY,
      category?.surface ?? "#d7f8f2",
    );

    pillX += width + 12;
    if (pillX > 740) {
      pillX = 136;
      pillY += 64;
    }
  });

  context.fillStyle = "#f7c948";
  drawRoundedRect(context, 96, 1048, 888, 158, 28);
  context.fill();

  context.fillStyle = "#17324d";
  context.font = "900 38px Arial";
  context.fillText("Encuentra la ruta y comparte este centro", 136, 1110);
  context.font = "800 28px Arial";
  drawWrappedText(context, centerUrl, 136, 1160, 810, 36, 2);

  context.fillStyle = "#ffffff";
  context.font = "900 28px Arial";
  context.fillText("Comparte el link en tu historia o bio para abrir el mapa directo.", 96, 1260);

  return canvas.toDataURL("image/png");
}

export function AidMapExperience({
  categories,
  centers,
  cities,
  impact,
}: AidMapExperienceProps) {
  const [activeCityId, setActiveCityId] = useState<CityFilter>("all");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [isCenterPanelExpanded, setIsCenterPanelExpanded] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shareCenterId, setShareCenterId] = useState<string>();
  const [selectedCenterId, setSelectedCenterId] = useState<string>();
  const appliedUrlCenterRef = useRef(false);
  const mobileCenterDetailsRef = useRef<HTMLElement | null>(null);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const cityById = useMemo(
    () => new Map(cities.map((city) => [city.id, city])),
    [cities],
  );
  const activeCity =
    activeCityId === "all" ? undefined : cityById.get(activeCityId);
  const cityCenters = useMemo(
    () =>
      activeCityId === "all"
        ? centers
        : centers.filter((center) => center.cityId === activeCityId),
    [activeCityId, centers],
  );
  const cityCenterCounts = useMemo(() => {
    const counts = new Map<AidCityId, number>();

    centers.forEach((center) => {
      counts.set(center.cityId, (counts.get(center.cityId) ?? 0) + 1);
    });

    return counts;
  }, [centers]);
  const activeImpact = useMemo(
    () => (activeCityId === "all" ? impact : getImpactFromCenters(cityCenters)),
    [activeCityId, cityCenters, impact],
  );

  const filteredCenters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return cityCenters.filter((center) => {
      const matchesCategory =
        activeFilter === "all" || center.categories.includes(activeFilter);

      if (!normalizedQuery) {
        return matchesCategory;
      }

      const categoryText = center.categories
        .map((categoryId) => categoryById.get(categoryId)?.label ?? "")
        .join(" ");
      const haystack = [
        center.name,
        center.neighborhood,
        center.address,
        center.description,
        cityById.get(center.cityId)?.name ?? "",
        categoryText,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [activeFilter, categoryById, cityById, cityCenters, query]);

  const selectedCenter = selectedCenterId
    ? filteredCenters.find((center) => center.id === selectedCenterId)
    : undefined;
  const shareCenter = shareCenterId
    ? centers.find((center) => center.id === shareCenterId)
    : undefined;

  const updateCenterUrl = useCallback((centerId?: string) => {
    const url = new URL(window.location.href);

    if (centerId) {
      url.searchParams.set(CENTER_QUERY_PARAM, centerId);
    } else {
      url.searchParams.delete(CENTER_QUERY_PARAM);
    }

    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, []);

  const selectCenter = useCallback((centerId: string) => {
    setSelectedCenterId(centerId);
    setIsCenterPanelExpanded(true);
    updateCenterUrl(centerId);
  }, [updateCenterUrl]);

  const clearSelectedCenter = useCallback(() => {
    setSelectedCenterId(undefined);
    setIsCenterPanelExpanded(false);
    updateCenterUrl();
  }, [updateCenterUrl]);

  useEffect(() => {
    if (appliedUrlCenterRef.current) {
      return;
    }

    appliedUrlCenterRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const centerId =
      params.get(CENTER_QUERY_PARAM) ?? params.get("center") ?? params.get("id");
    const linkedCenter = centers.find((center) => center.id === centerId);

    if (!linkedCenter) {
      return;
    }

    window.requestAnimationFrame(() => {
      setActiveCityId(linkedCenter.cityId);
      setActiveFilter("all");
      setQuery("");
      setSelectedCenterId(linkedCenter.id);
      setIsCenterPanelExpanded(true);
    });
  }, [centers]);

  useEffect(() => {
    if (!isCenterPanelExpanded || !selectedCenterId) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    if (!isMobile) {
      return;
    }

    window.requestAnimationFrame(() => {
      mobileCenterDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [isCenterPanelExpanded, selectedCenterId]);

  const visibleCenterIds = useMemo(
    () => new Set(filteredCenters.map((center) => center.id)),
    [filteredCenters],
  );

  const selectCity = (cityId: CityFilter) => {
    setActiveCityId(cityId);
    setActiveFilter("all");
    setQuery("");
    setSelectedCenterId(undefined);
    setIsCenterPanelExpanded(false);
    updateCenterUrl();
  };

  const resetFilterIfHidden = (filter: CategoryFilter) => {
    setActiveFilter(filter);
    const firstMatch = cityCenters.find((center) =>
      filter === "all" ? true : center.categories.includes(filter),
    );

    setSelectedCenterId(firstMatch?.id);
    setIsCenterPanelExpanded(false);
    updateCenterUrl(firstMatch?.id);
  };

  const openShareModal = (centerId: string) => setShareCenterId(centerId);
  const closeShareModal = () => setShareCenterId(undefined);
  const openUpdatesModal = () => setIsUpdatesModalOpen(true);
  const closeUpdatesModal = () => setIsUpdatesModalOpen(false);

  return (
    <main className="min-h-dvh bg-[#fff8e8] text-[#17324d]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col lg:grid lg:grid-cols-[minmax(420px,0.78fr)_minmax(640px,1.22fr)]">
        <section className="order-2 flex flex-col gap-4 px-4 pb-6 pt-0 lg:order-1 lg:min-h-dvh lg:px-8 lg:py-8 xl:px-10">
          <header className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#17324d]/10 bg-white px-3 py-2 text-sm font-semibold text-[#35615f] shadow-sm">
              <ShieldCheck aria-hidden="true" size={16} />
              Centros por ciudad
            </div>
            <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.96] text-[#17324d]">
              Ayuda humanitaria venezolana, ubicada y verificable.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#49656f]">
              Un mapa operativo para encontrar apoyo, reportar nuevos puntos y
              mantener datos privados protegidos durante la verificacion.
            </p>
          </header>

          <ImpactStrip impact={activeImpact} />

          <div className="rounded-[8px] border border-[#17324d]/10 bg-white p-3 shadow-[0_20px_60px_rgba(23,50,77,0.08)]">
            <CitySelector
              activeCityId={activeCityId}
              cities={cities}
              counts={cityCenterCounts}
              totalCount={centers.length}
              onSelectCity={selectCity}
            />

            <div className="mb-3 rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2] p-3 text-xs font-bold leading-5 text-[#49656f]">
              Recibimos postulaciones de toda Colombia. Una ciudad aparece como
              activa cuando el equipo valida al menos un centro con direccion,
              contacto publico y ubicacion en mapa.
            </div>

            <div className="flex items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-[#f8fbf7] px-3 py-2">
              <Search aria-hidden="true" size={18} className="text-[#617781]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#17324d] outline-none placeholder:text-[#6c7d86]"
                placeholder="Buscar barrio o servicio"
                type="search"
              />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <FilterButton
                active={activeFilter === "all"}
                label="Todos"
                onClick={() => resetFilterIfHidden("all")}
              >
                <HeartHandshake aria-hidden="true" size={16} />
              </FilterButton>
              {categories.map((category) => {
                const Icon = categoryIcons[category.id];

                return (
                  <FilterButton
                    key={category.id}
                    active={activeFilter === category.id}
                    label={category.shortLabel}
                    onClick={() => resetFilterIfHidden(category.id)}
                    style={{
                      "--filter-accent": category.accent,
                      "--filter-surface": category.surface,
                    } as CSSVariableProperties}
                  >
                    <Icon aria-hidden="true" size={16} />
                  </FilterButton>
                );
              })}
            </div>
          </div>

          <section className="grid gap-3 lg:grid-cols-2">
            {filteredCenters.map((center) => (
              <CenterListItem
                key={center.id}
                center={center}
                categoryById={categoryById}
                selected={center.id === selectedCenter?.id}
                onSelect={() => selectCenter(center.id)}
              />
            ))}
            {filteredCenters.length === 0 ? (
              <div className="rounded-[8px] border border-dashed border-[#17324d]/25 bg-white p-4 text-sm font-semibold text-[#49656f]">
                No hay centros con esos filtros.
              </div>
            ) : null}
          </section>
        </section>

        <section className="order-1 lg:sticky lg:top-0 lg:order-2 lg:h-dvh lg:p-5">
          <div className="relative h-[68dvh] min-h-[430px] max-h-[640px] overflow-hidden rounded-b-[24px] border-b border-[#17324d]/10 bg-[#c9eee3] shadow-[0_24px_80px_rgba(23,50,77,0.16)] sm:min-h-[520px] lg:h-full lg:max-h-none lg:min-h-0 lg:rounded-[12px] lg:border">
            <GoogleAidMap
              categoryById={categoryById}
              centers={cityCenters}
              mapCenter={activeCity?.map.center ?? COLOMBIA_MAP.center}
              mapZoom={activeCity?.map.zoom ?? COLOMBIA_MAP.zoom}
              onSelectCenter={selectCenter}
              selectedCenterId={selectedCenter?.id}
              visibleCenterIds={visibleCenterIds}
            />

            <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-3">
              <div className="rounded-[8px] border border-white/70 bg-[#fffbf2]/95 px-3 py-2 shadow-sm backdrop-blur">
                <p className="text-xs font-black uppercase text-[#ef6f61]">
                  Venezuela Lives Matter
                </p>
                <p className="text-sm font-black text-[#17324d]">
                  {activeCity?.name ?? "Colombia"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row">
                <button
                  aria-label="Estar al tanto"
                  className="grid size-11 place-items-center rounded-[8px] border border-[#17324d]/10 bg-[#24a7a1] text-white shadow-sm transition hover:-translate-y-0.5"
                  onClick={openUpdatesModal}
                  type="button"
                >
                  <Bell aria-hidden="true" size={20} />
                </button>
                <Link
                  aria-label="Registrar centro de ayuda"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[8px] border border-[#17324d]/15 bg-[#f7c948] px-3 text-[11px] font-black uppercase leading-tight text-[#17324d] shadow-[0_12px_30px_rgba(23,50,77,0.18)] transition hover:-translate-y-0.5 sm:min-h-12 sm:px-4 sm:text-sm"
                  href="/reportar"
                >
                  <ClipboardCheck aria-hidden="true" className="shrink-0" size={20} />
                  <span className="max-w-24 text-left sm:hidden">
                    Registrar centro de ayuda
                  </span>
                  <span className="hidden sm:inline">
                    Registrar centro de ayuda
                  </span>
                </Link>
              </div>
            </div>

            {selectedCenter ? (
              <SelectedCenterPanel
                center={selectedCenter}
                categoryById={categoryById}
                expanded={isCenterPanelExpanded}
                onClear={clearSelectedCenter}
                onOpenShare={openShareModal}
                onOpenUpdates={openUpdatesModal}
                onToggleExpanded={() =>
                  setIsCenterPanelExpanded((expanded) => !expanded)
                }
              />
            ) : filteredCenters.length === 0 ? (
              <EmptyCenterPanel />
            ) : null}
          </div>

          {selectedCenter ? (
            <SelectedCenterPreview
              center={selectedCenter}
              categoryById={categoryById}
              expanded={isCenterPanelExpanded}
              onClear={clearSelectedCenter}
              onOpenShare={openShareModal}
              onOpenUpdates={openUpdatesModal}
              onToggleExpanded={() =>
                setIsCenterPanelExpanded((expanded) => !expanded)
              }
            />
          ) : null}

          {selectedCenter && isCenterPanelExpanded ? (
            <SelectedCenterDetails
              center={selectedCenter}
              categoryById={categoryById}
              onOpenShare={openShareModal}
              onOpenUpdates={openUpdatesModal}
              ref={mobileCenterDetailsRef}
            />
          ) : null}
        </section>
      </div>

      <UpdatesModal
        isOpen={isUpdatesModalOpen}
        onClose={closeUpdatesModal}
      />
      {shareCenter ? (
        <CenterShareModal
          center={shareCenter}
          categoryById={categoryById}
          cityName={cityById.get(shareCenter.cityId)?.name ?? "Colombia"}
          onClose={closeShareModal}
        />
      ) : null}
    </main>
  );
}

function ImpactStrip({
  impact,
}: {
  impact: AidMapExperienceProps["impact"];
}) {
  const items = [
    ["Centros", impact.activeCenters.toString()],
    ["Visitas", formatNumber.format(impact.monthlyVisits)],
    ["Kg ayuda", formatNumber.format(impact.suppliesKg)],
    ["Familias", formatNumber.format(impact.families)],
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:mt-2">
      {items.map(([label, value]) => (
        <div
          className="rounded-[8px] border border-[#17324d]/10 bg-white p-3 shadow-sm"
          key={label}
        >
          <p className="text-xl font-black leading-none text-[#17324d]">
            {value}
          </p>
          <p className="mt-1 text-xs font-bold uppercase text-[#617781]">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function CitySelector({
  activeCityId,
  cities,
  counts,
  totalCount,
  onSelectCity,
}: {
  activeCityId: CityFilter;
  cities: AidCity[];
  counts: Map<AidCityId, number>;
  totalCount: number;
  onSelectCity: (cityId: CityFilter) => void;
}) {
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-black uppercase text-[#ef6f61]">
        Cobertura
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          aria-pressed={activeCityId === "all"}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2] px-3 text-sm font-black text-[#17324d] shadow-sm transition hover:-translate-y-0.5 data-[active=true]:border-[#24a7a1]/45 data-[active=true]:bg-[#d7f8f2]"
          data-active={activeCityId === "all"}
          onClick={() => onSelectCity("all")}
          type="button"
        >
          <MapPin aria-hidden="true" size={16} />
          <span>Colombia</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-[#617781]">
            {totalCount}
          </span>
        </button>
        {cities.map((city) => {
          const active = city.id === activeCityId;
          const count = counts.get(city.id) ?? 0;

          return (
            <button
              aria-pressed={active}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2] px-3 text-sm font-black text-[#17324d] shadow-sm transition hover:-translate-y-0.5 data-[active=true]:border-[#24a7a1]/45 data-[active=true]:bg-[#d7f8f2]"
              data-active={active}
              key={city.id}
              onClick={() => onSelectCity(city.id)}
              type="button"
            >
              <MapPin aria-hidden="true" size={16} />
              <span>{city.name}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-[#617781]">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  children,
  label,
  onClick,
  style,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      className="filter-chip"
      data-active={active}
      onClick={onClick}
      style={style}
      type="button"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function CenterListItem({
  center,
  categoryById,
  selected,
  onSelect,
}: {
  center: AidCenter;
  categoryById: Map<AidCategoryId, AidCategory>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className="rounded-[8px] border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5"
      data-selected={selected}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#d7f8f2] text-[#17324d]">
          <MapPin aria-hidden="true" size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[#17324d]">
            {center.name}
          </p>
          <p className="mt-1 text-xs font-bold text-[#617781]">
            {center.neighborhood} · {center.verifiedAt}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {center.categories.slice(0, 3).map((categoryId) => {
              const category = categoryById.get(categoryId);

              return (
                <span
                  className="rounded-full px-2 py-1 text-[11px] font-black text-[#17324d]"
                  key={categoryId}
                  style={{ background: category?.surface }}
                >
                  {category?.shortLabel}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </button>
  );
}

function getCenterRouteHref(center: AidCenter) {
  const destination = `${center.coordinates.lat},${center.coordinates.lng}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination,
  )}&travelmode=driving`;
}

function getContactHref(publicContact: string) {
  if (publicContact.includes("@")) {
    return `mailto:${publicContact}`;
  }

  const phone = publicContact.replace(/[^\d+]/g, "");

  return phone ? `tel:${phone}` : undefined;
}

function CenterBadges({
  center,
  categoryById,
}: {
  center: AidCenter;
  categoryById: Map<AidCategoryId, AidCategory>;
}) {
  const primaryCategory = categoryById.get(center.categories[0]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="rounded-full bg-[#ef6f61]/12 px-2 py-1 text-[11px] font-black uppercase tracking-normal text-[#ef6f61]">
        {center.neighborhood}
      </span>
      {primaryCategory ? (
        <span
          className="rounded-full px-2 py-1 text-[11px] font-black text-[#17324d]"
          style={{ background: primaryCategory.surface }}
        >
          {primaryCategory.shortLabel}
        </span>
      ) : null}
    </div>
  );
}

function CenterInfoRows({ center }: { center: AidCenter }) {
  return (
    <div className="grid gap-1.5 text-xs font-bold text-[#49656f]">
      <p className="flex min-w-0 items-center gap-2">
        <MapPin aria-hidden="true" className="shrink-0 text-[#24a7a1]" size={15} />
        <span className="truncate">{center.address}</span>
      </p>
      <p className="flex min-w-0 items-center gap-2">
        <CheckCircle2
          aria-hidden="true"
          className="shrink-0 text-[#5cb85c]"
          size={15}
        />
        <span className="truncate">{center.hours}</span>
      </p>
    </div>
  );
}

function CenterImpactGrid({ center }: { center: AidCenter }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <ImpactMiniStat label="Visitas" value={center.impact.visits} />
      <ImpactMiniStat label="Kg ayuda" value={center.impact.suppliesKg} />
      <ImpactMiniStat label="Familias" value={center.impact.families} />
    </div>
  );
}

function CenterCategoryTags({
  center,
  categoryById,
}: {
  center: AidCenter;
  categoryById: Map<AidCategoryId, AidCategory>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {center.categories.map((categoryId) => {
        const category = categoryById.get(categoryId);

        return (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-black text-[#17324d]"
            key={categoryId}
            style={{ background: category?.surface }}
          >
            {category?.label}
          </span>
        );
      })}
    </div>
  );
}

function CenterActions({
  center,
  onOpenShare,
  onOpenUpdates,
}: {
  center: AidCenter;
  onOpenShare: (centerId: string) => void;
  onOpenUpdates: () => void;
}) {
  const contactHref = getContactHref(center.publicContact);
  const contactIcon = center.publicContact.includes("@") ? (
    <Mail aria-hidden="true" size={15} />
  ) : (
    <Phone aria-hidden="true" size={15} />
  );
  const actionClass =
    "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[8px] px-2 text-xs font-black transition hover:-translate-y-0.5";

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        className={`${actionClass} bg-[#24a7a1] text-white`}
        onClick={onOpenUpdates}
        type="button"
      >
        <Bell aria-hidden="true" size={15} />
        Al tanto
      </button>
      <a
        className={`${actionClass} bg-[#17324d] text-white`}
        href={getCenterRouteHref(center)}
        rel="noreferrer"
        target="_blank"
      >
        <Navigation aria-hidden="true" size={15} />
        Ruta
      </a>
      {contactHref ? (
        <a
          className={`${actionClass} border border-[#17324d]/15 bg-white text-[#17324d]`}
          href={contactHref}
        >
          {contactIcon}
          Contacto
        </a>
      ) : (
        <span
          aria-disabled="true"
          className={`${actionClass} border border-[#17324d]/15 bg-white text-[#17324d]/55`}
        >
          {contactIcon}
          Contacto
        </span>
      )}
      <button
        className={`${actionClass} border border-[#17324d]/15 bg-[#fff3bf] text-[#17324d]`}
        onClick={() => onOpenShare(center.id)}
        type="button"
      >
        <Share2 aria-hidden="true" size={15} />
        Compartir
      </button>
    </div>
  );
}

function CenterDefinitionList({ center }: { center: AidCenter }) {
  return (
    <dl className="grid gap-3 text-sm">
      <div>
        <dt className="font-black text-[#17324d]">Direccion</dt>
        <dd className="mt-1 text-[#49656f]">{center.address}</dd>
      </div>
      <div>
        <dt className="font-black text-[#17324d]">Horario</dt>
        <dd className="mt-1 text-[#49656f]">{center.hours}</dd>
      </div>
      <div>
        <dt className="font-black text-[#17324d]">Requisitos</dt>
        <dd className="mt-1 text-[#49656f]">{center.requirements}</dd>
      </div>
      <div>
        <dt className="font-black text-[#17324d]">Contacto publico</dt>
        <dd className="mt-1 text-[#49656f]">{center.publicContact}</dd>
      </div>
      <div>
        <dt className="font-black text-[#17324d]">Estado</dt>
        <dd className="mt-1 text-[#49656f]">{center.verifiedAt}</dd>
      </div>
    </dl>
  );
}

function SelectedCenterPreview({
  center,
  categoryById,
  expanded,
  onClear,
  onOpenShare,
  onToggleExpanded,
  onOpenUpdates,
}: {
  center: AidCenter;
  categoryById: Map<AidCategoryId, AidCategory>;
  expanded: boolean;
  onClear: () => void;
  onOpenShare: (centerId: string) => void;
  onToggleExpanded: () => void;
  onOpenUpdates: () => void;
}) {
  return (
    <aside className="mx-4 mt-3 rounded-[12px] border border-[#17324d]/10 bg-[#fffbf2] p-3 shadow-sm lg:hidden">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#d7f8f2] text-[#17324d]">
          <MapPin aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <CenterBadges center={center} categoryById={categoryById} />
          <h2 className="mt-1 truncate text-base font-black leading-tight text-[#17324d]">
            {center.name}
          </h2>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-bold text-[#49656f]">
            <CheckCircle2
              aria-hidden="true"
              className="shrink-0 text-[#5cb85c]"
              size={14}
            />
            <span className="truncate">{center.verifiedAt}</span>
          </p>
        </div>
        <button
          aria-label="Cerrar centro seleccionado"
          className="grid size-9 shrink-0 place-items-center rounded-[8px] border border-[#17324d]/10 bg-white text-[#17324d]"
          onClick={onClear}
          type="button"
        >
          <X aria-hidden="true" size={16} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[8px] bg-[#24a7a1] px-2 text-[11px] font-black text-white"
          onClick={onOpenUpdates}
          type="button"
        >
          <Bell aria-hidden="true" size={14} />
          Al tanto
        </button>
        <a
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[8px] bg-[#17324d] px-2 text-[11px] font-black text-white"
          href={getCenterRouteHref(center)}
          rel="noreferrer"
          target="_blank"
        >
          <Navigation aria-hidden="true" size={14} />
          Ruta
        </a>
        <button
          aria-controls="selected-center-mobile-details"
          aria-expanded={expanded}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[8px] border border-[#17324d]/15 bg-white px-2 text-[11px] font-black text-[#17324d]"
          onClick={onToggleExpanded}
          type="button"
        >
          <ChevronDown
            aria-hidden="true"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            size={15}
          />
          Detalle
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[8px] border border-[#17324d]/15 bg-[#fff3bf] px-2 text-[11px] font-black text-[#17324d]"
          onClick={() => onOpenShare(center.id)}
          type="button"
        >
          <Share2 aria-hidden="true" size={14} />
          Compartir
        </button>
      </div>
    </aside>
  );
}

function SelectedCenterPanel({
  center,
  categoryById,
  expanded,
  onClear,
  onOpenShare,
  onToggleExpanded,
  onOpenUpdates,
}: {
  center: AidCenter;
  categoryById: Map<AidCategoryId, AidCategory>;
  expanded: boolean;
  onClear: () => void;
  onOpenShare: (centerId: string) => void;
  onToggleExpanded: () => void;
  onOpenUpdates: () => void;
}) {
  return (
    <aside className="absolute right-5 top-24 z-20 hidden max-h-[calc(100dvh-8rem)] w-[360px] overflow-y-auto rounded-[12px] border border-white/75 bg-[#fffbf2]/96 p-4 shadow-[0_18px_58px_rgba(23,50,77,0.18)] backdrop-blur lg:block">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CenterBadges center={center} categoryById={categoryById} />
          <h2 className="mt-1 text-xl font-black leading-tight text-[#17324d]">
            {center.name}
          </h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            aria-expanded={expanded}
            aria-label={expanded ? "Ocultar detalles" : "Ver detalles"}
            className="grid size-9 place-items-center rounded-[8px] border border-[#17324d]/10 bg-white text-[#17324d]"
            onClick={onToggleExpanded}
            type="button"
          >
            <ChevronDown
              aria-hidden="true"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              size={17}
            />
          </button>
          <button
            aria-label="Cerrar centro seleccionado"
            className="grid size-9 place-items-center rounded-[8px] border border-[#17324d]/10 bg-white text-[#17324d]"
            onClick={onClear}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <CenterInfoRows center={center} />
      </div>

      <div className="mt-3">
        <CenterImpactGrid center={center} />
      </div>

      <div className="mt-3">
        <CenterActions
          center={center}
          onOpenShare={onOpenShare}
          onOpenUpdates={onOpenUpdates}
        />
      </div>

      <p className="mt-4 border-t border-[#17324d]/10 pt-4 text-sm leading-6 text-[#49656f]">
        {center.description}
      </p>

      <div
        className={`border-t border-[#17324d]/10 pt-4 ${
          expanded ? "mt-4 grid gap-4" : "hidden"
        }`}
      >
        <CenterCategoryTags center={center} categoryById={categoryById} />
        <CenterDefinitionList center={center} />
      </div>
    </aside>
  );
}

const SelectedCenterDetails = forwardRef<
  HTMLElement,
  {
    center: AidCenter;
    categoryById: Map<AidCategoryId, AidCategory>;
    onOpenShare: (centerId: string) => void;
    onOpenUpdates: () => void;
  }
>(function SelectedCenterDetails(
  { center, categoryById, onOpenShare, onOpenUpdates },
  ref,
) {
  return (
    <section
      className="mx-4 mt-3 rounded-[12px] border border-[#17324d]/10 bg-white p-4 shadow-sm lg:hidden"
      id="selected-center-mobile-details"
      ref={ref}
    >
      <CenterBadges center={center} categoryById={categoryById} />
      <h2 className="mt-2 text-2xl font-black leading-tight text-[#17324d]">
        {center.name}
      </h2>

      <div className="mt-3">
        <CenterInfoRows center={center} />
      </div>

      <p className="mt-4 text-sm leading-6 text-[#49656f]">
        {center.description}
      </p>

      <div className="mt-4">
        <CenterImpactGrid center={center} />
      </div>

      <div className="mt-4">
        <CenterActions
          center={center}
          onOpenShare={onOpenShare}
          onOpenUpdates={onOpenUpdates}
        />
      </div>

      <div className="mt-4 grid gap-4 border-t border-[#17324d]/10 pt-4">
        <CenterCategoryTags center={center} categoryById={categoryById} />
        <CenterDefinitionList center={center} />
      </div>
    </section>
  );
});

function ImpactMiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[#17324d]/10 bg-white px-2 py-2">
      <p className="text-base font-black leading-none text-[#17324d]">
        {formatNumber.format(value)}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase text-[#617781]">
        {label}
      </p>
    </div>
  );
}

function EmptyCenterPanel() {
  return (
    <aside className="absolute bottom-3 left-3 right-3 z-20 rounded-[16px] border border-white/75 bg-[#fffbf2]/96 p-3 shadow-[0_18px_58px_rgba(23,50,77,0.18)] backdrop-blur sm:p-4 lg:bottom-5 lg:left-auto lg:right-5 lg:w-[360px]">
      <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-[#17324d]/20 lg:hidden" />
      <p className="text-xs font-black uppercase tracking-normal text-[#ef6f61]">
        Sin resultados
      </p>
      <h2 className="mt-1 text-xl font-black leading-tight text-[#17324d]">
        No hay centros con esos filtros
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#49656f]">
        Puedes ampliar la busqueda o reportar un punto para que el equipo lo
        verifique.
      </p>
      <Link
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#17324d] px-3 text-sm font-black text-white transition hover:-translate-y-0.5"
        href="/reportar"
      >
        <ClipboardCheck aria-hidden="true" size={17} />
        Reportar centro
      </Link>
    </aside>
  );
}

function CenterShareModal({
  center,
  categoryById,
  cityName,
  onClose,
}: {
  center: AidCenter;
  categoryById: Map<AidCategoryId, AidCategory>;
  cityName: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const centerUrl = useMemo(() => getCenterShareUrl(center), [center]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCopied(false);
      setImageUrl(generateInstagramImage(center, categoryById, centerUrl));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [categoryById, center, centerUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(centerUrl);
    } catch {
      const input = document.createElement("textarea");

      input.value = centerUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    setCopied(true);
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: `${center.name} | Venezuela Lives Matter`,
        text: `Centro de ayuda en ${cityName}: ${center.name}`,
        url: centerUrl,
      });
    } catch {
      // User cancelled or the browser blocked native share.
    }
  };

  const downloadImage = () => {
    if (!imageUrl) {
      return;
    }

    const link = document.createElement("a");

    link.download = `${center.id}-instagram.png`;
    link.href = imageUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#17324d]/42 px-3 py-3 backdrop-blur-sm sm:place-items-center">
      <section
        aria-labelledby="share-modal-title"
        aria-modal="true"
        className="grid max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl gap-4 overflow-y-auto rounded-[12px] border border-white/70 bg-[#fffbf2] p-4 text-[#17324d] shadow-[0_24px_90px_rgba(23,50,77,0.28)] sm:grid-cols-[0.82fr_1fr] sm:p-5"
        role="dialog"
      >
        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#ef6f61]">
                Compartir centro
              </p>
              <h2
                className="mt-1 text-2xl font-black leading-tight"
                id="share-modal-title"
              >
                {center.name}
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#49656f]">
                {center.neighborhood}, {cityName}
              </p>
            </div>
            <button
              aria-label="Cerrar"
              className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-[#17324d]/10 bg-white text-[#17324d]"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <div className="mt-4 rounded-[8px] border border-[#17324d]/10 bg-white p-3">
            <p className="text-xs font-black uppercase text-[#617781]">
              Link directo
            </p>
            <p className="mt-2 break-all text-xs font-bold leading-5 text-[#17324d] sm:text-sm sm:leading-6">
              {centerUrl}
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#17324d] px-3 text-sm font-black text-white"
              onClick={copyLink}
              type="button"
            >
              <Copy aria-hidden="true" size={17} />
              {copied ? "Link copiado" : "Copiar link"}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#24a7a1] px-3 text-sm font-black text-white"
              onClick={nativeShare}
              type="button"
            >
              <Share2 aria-hidden="true" size={17} />
              Compartir
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#f7c948] px-3 text-sm font-black text-[#17324d] sm:col-span-2"
              onClick={downloadImage}
              type="button"
            >
              <Download aria-hidden="true" size={17} />
              Descargar imagen para Instagram
            </button>
          </div>
        </div>

        <div className="grid place-items-center rounded-[8px] bg-[#17324d] p-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`Imagen para compartir ${center.name}`}
              className="max-h-[58dvh] w-auto rounded-[8px] border border-white/15 shadow-2xl"
              src={imageUrl}
            />
          ) : (
            <div className="grid aspect-[4/5] w-full place-items-center rounded-[8px] bg-white/10 text-sm font-black text-white">
              Generando imagen
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function UpdatesModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#17324d]/38 px-3 py-3 backdrop-blur-sm sm:place-items-center">
      <section
        aria-labelledby="updates-modal-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-[12px] border border-white/70 bg-[#fffbf2] p-4 text-[#17324d] shadow-[0_24px_90px_rgba(23,50,77,0.28)] sm:p-5"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-[#ef6f61]">
              Estar al tanto
            </p>
            <h2
              className="mt-1 text-2xl font-black leading-tight"
              id="updates-modal-title"
            >
              Recibir informacion sobre Venezuela
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#49656f]">
              Guarda tu contacto para recibir actualizaciones, reportes y
              llamados de apoyo relacionados con la situacion de Venezuela.
            </p>
          </div>
          <button
            aria-label="Cerrar"
            className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-[#17324d]/10 bg-white text-[#17324d]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="mt-5 rounded-[8px] border border-[#5cb85c]/30 bg-[#dff4dd] p-4 text-sm font-bold text-[#17324d]">
            Listo. Cuando conectemos Supabase, este registro quedara guardado en
            la tabla de suscripciones.
          </div>
        ) : (
          <form
            className="mt-5 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <label className="grid gap-2 text-sm font-black">
              Nombre
              <input
                className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-white px-3 font-semibold outline-none focus:border-[#24a7a1]"
                name="fullName"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Correo
              <input
                className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-white px-3 font-semibold outline-none focus:border-[#24a7a1]"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              WhatsApp opcional
              <input
                className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-white px-3 font-semibold outline-none focus:border-[#24a7a1]"
                name="phone"
                type="tel"
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Ciudad
              <input
                className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-white px-3 font-semibold outline-none focus:border-[#24a7a1]"
                name="city"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Departamento opcional
              <input
                className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-white px-3 font-semibold outline-none focus:border-[#24a7a1]"
                name="department"
                type="text"
              />
            </label>
            <label className="flex gap-3 rounded-[8px] border border-[#17324d]/10 bg-white p-3 text-sm font-semibold leading-6 text-[#49656f]">
              <input
                className="mt-1 size-4 shrink-0"
                name="dataConsent"
                required
                type="checkbox"
              />
              Autorizo el tratamiento de mis datos para recibir informacion y
              comunicaciones sobre Venezuela.
            </label>
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[#17324d] px-5 text-sm font-black text-white"
              type="submit"
            >
              Guardar contacto
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
