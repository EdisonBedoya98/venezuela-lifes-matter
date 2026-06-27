"use client";

import {
  Bus,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Gift,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Shirt,
  Soup,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AidCategory, AidCategoryId, AidCenter } from "@/app/_data/aid-centers";

type AidMapExperienceProps = {
  categories: AidCategory[];
  centers: AidCenter[];
  impact: {
    activeCenters: number;
    monthlyVisits: number;
    suppliesKg: number;
    families: number;
  };
};

type CategoryFilter = AidCategoryId | "all";
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

export function AidMapExperience({
  categories,
  centers,
  impact,
}: AidMapExperienceProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState(centers[0]?.id ?? "");

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const filteredCenters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return centers.filter((center) => {
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
        categoryText,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [activeFilter, categoryById, centers, query]);

  const selectedCenter =
    filteredCenters.find((center) => center.id === selectedCenterId) ??
    filteredCenters[0];

  const selectCenter = (centerId: string) => {
    setSelectedCenterId(centerId);
  };

  const resetFilterIfHidden = (filter: CategoryFilter) => {
    setActiveFilter(filter);
    const firstMatch = centers.find((center) =>
      filter === "all" ? true : center.categories.includes(filter),
    );

    if (firstMatch) {
      setSelectedCenterId(firstMatch.id);
    }
  };

  return (
    <main className="min-h-dvh bg-[#fff8e8] text-[#17324d]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col lg:grid lg:grid-cols-[minmax(420px,0.78fr)_minmax(640px,1.22fr)]">
        <section className="order-2 flex flex-col gap-4 px-4 pb-6 pt-0 lg:order-1 lg:min-h-dvh lg:px-8 lg:py-8 xl:px-10">
          <header className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#17324d]/10 bg-white px-3 py-2 text-sm font-semibold text-[#35615f] shadow-sm">
              <ShieldCheck aria-hidden="true" size={16} />
              Centros verificados en Medellin
            </div>
            <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.96] text-[#17324d]">
              Ayuda humanitaria venezolana, ubicada y verificable.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#49656f]">
              Un mapa operativo para encontrar apoyo, reportar nuevos puntos y
              mantener datos privados protegidos durante la verificacion.
            </p>
          </header>

          <ImpactStrip impact={impact} />

          <div className="rounded-[8px] border border-[#17324d]/10 bg-white p-3 shadow-[0_20px_60px_rgba(23,50,77,0.08)]">
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
          <div className="relative h-[64dvh] min-h-[520px] overflow-hidden rounded-b-[28px] border-b border-[#17324d]/10 bg-[#c9eee3] shadow-[0_24px_80px_rgba(23,50,77,0.16)] lg:h-full lg:rounded-[12px] lg:border">
            <MapArtwork />

            <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-3">
              <div className="rounded-[8px] border border-white/70 bg-[#fffbf2]/95 px-3 py-2 shadow-sm backdrop-blur">
                <p className="text-xs font-black uppercase text-[#ef6f61]">
                  Venezuela Lives Matter
                </p>
                <p className="text-sm font-black text-[#17324d]">Medellin</p>
              </div>
              <div className="flex gap-2">
                <Link
                  aria-label="Reportar un centro"
                  className="grid size-11 place-items-center rounded-[8px] border border-[#17324d]/10 bg-[#f7c948] text-[#17324d] shadow-sm transition hover:-translate-y-0.5"
                  href="/reportar"
                >
                  <ClipboardCheck aria-hidden="true" size={20} />
                </Link>
                <Link
                  aria-label="Ir al panel admin"
                  className="grid size-11 place-items-center rounded-[8px] border border-[#17324d]/10 bg-white text-[#17324d] shadow-sm transition hover:-translate-y-0.5"
                  href="/admin"
                >
                  <ShieldCheck aria-hidden="true" size={20} />
                </Link>
              </div>
            </div>

            {centers.map((center) => {
              const primaryCategory = categoryById.get(center.categories[0]);
              const Icon = categoryIcons[center.categories[0]];
              const isSelected = center.id === selectedCenter?.id;
              const isVisible = filteredCenters.some(
                (filteredCenter) => filteredCenter.id === center.id,
              );

              return (
                <button
                  key={center.id}
                  aria-label={`Ver ${center.name}`}
                  className="aid-map-pin"
                data-selected={isSelected}
                  data-muted={!isVisible}
                  onClick={() => selectCenter(center.id)}
                  style={{
                    left: `${center.position.x}%`,
                    top: `${center.position.y}%`,
                    "--pin-color": primaryCategory?.accent ?? "#24A7A1",
                    "--pin-surface": primaryCategory?.surface ?? "#D7F8F2",
                  } as CSSVariableProperties}
                  type="button"
                >
                  <span className="aid-map-pin__bubble">
                    <Icon aria-hidden="true" size={18} strokeWidth={2.7} />
                  </span>
                </button>
              );
            })}

            {selectedCenter ? (
              <SelectedCenterPanel
                center={selectedCenter}
                categoryById={categoryById}
              />
            ) : (
              <EmptyCenterPanel />
            )}
          </div>
        </section>
      </div>
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

function SelectedCenterPanel({
  center,
  categoryById,
}: {
  center: AidCenter;
  categoryById: Map<AidCategoryId, AidCategory>;
}) {
  return (
    <aside className="absolute bottom-0 left-0 right-0 z-20 rounded-t-[24px] border-t border-white/70 bg-[#fffbf2]/95 p-4 shadow-[0_-18px_70px_rgba(23,50,77,0.18)] backdrop-blur lg:left-auto lg:right-5 lg:top-auto lg:w-[390px] lg:rounded-[12px] lg:border">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#17324d]/20 lg:hidden" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-[#ef6f61]">
            {center.neighborhood}
          </p>
          <h2 className="mt-1 text-xl font-black leading-tight text-[#17324d]">
            {center.name}
          </h2>
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#dff4dd] text-[#17324d]">
          <CheckCircle2 aria-hidden="true" size={22} />
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#49656f]">{center.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
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

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-black text-[#17324d]">Horario</dt>
          <dd className="mt-1 text-[#49656f]">{center.hours}</dd>
        </div>
        <div>
          <dt className="font-black text-[#17324d]">Requisitos</dt>
          <dd className="mt-1 text-[#49656f]">{center.requirements}</dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#17324d] px-3 text-sm font-black text-white transition hover:-translate-y-0.5"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            center.address,
          )}`}
          rel="noreferrer"
          target="_blank"
        >
          <Navigation aria-hidden="true" size={17} />
          Ruta
        </a>
        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[#17324d]/15 bg-white px-3 text-sm font-black text-[#17324d] transition hover:-translate-y-0.5"
          href={
            center.publicContact.includes("@")
              ? `mailto:${center.publicContact}`
              : `tel:${center.publicContact.replace(/\s/g, "")}`
          }
        >
          {center.publicContact.includes("@") ? (
            <Mail aria-hidden="true" size={17} />
          ) : (
            <Phone aria-hidden="true" size={17} />
          )}
          Contacto
        </a>
      </div>
    </aside>
  );
}

function EmptyCenterPanel() {
  return (
    <aside className="absolute bottom-0 left-0 right-0 z-20 rounded-t-[24px] border-t border-white/70 bg-[#fffbf2]/95 p-4 shadow-[0_-18px_70px_rgba(23,50,77,0.18)] backdrop-blur lg:left-auto lg:right-5 lg:top-auto lg:w-[390px] lg:rounded-[12px] lg:border">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#17324d]/20 lg:hidden" />
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

function MapArtwork() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="map-sun" />
      <div className="map-neighborhood map-neighborhood--north">Caribe</div>
      <div className="map-neighborhood map-neighborhood--west">San Javier</div>
      <div className="map-neighborhood map-neighborhood--center">Centro</div>
      <div className="map-neighborhood map-neighborhood--south">Belen</div>
      <div className="map-neighborhood map-neighborhood--east">Poblado</div>
      <div className="map-river" />
      <div className="map-road map-road--one" />
      <div className="map-road map-road--two" />
      <div className="map-road map-road--three" />
      <div className="map-road map-road--four" />
      <div className="map-grid map-grid--one" />
      <div className="map-grid map-grid--two" />
    </div>
  );
}
