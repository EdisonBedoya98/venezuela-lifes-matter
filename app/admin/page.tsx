import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Database,
  ShieldCheck,
} from "lucide-react";
import { aidCenters, cityImpact } from "@/app/_data/aid-centers";

const pendingReports = [
  {
    name: "Comedor Popular La 80",
    area: "Laureles",
    reporter: "Maria Fernanda R.",
    signal: "WhatsApp verificado",
  },
  {
    name: "Jornada Salud Manrique",
    area: "Manrique",
    reporter: "Aliado comunitario",
    signal: "Evidencia pendiente",
  },
  {
    name: "Ruta Donaciones Envigado",
    area: "Sur del valle",
    reporter: "Fundacion aliada",
    signal: "Revisar alcance",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-dvh bg-[#fff8e8] px-4 py-5 text-[#17324d] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-white px-3 text-sm font-black text-[#17324d] shadow-sm"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Mapa
          </Link>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-white px-3 text-sm font-black text-[#17324d] shadow-sm">
            <ShieldCheck aria-hidden="true" size={17} />
            Admin
          </div>
        </div>

        <header className="mt-6">
          <p className="text-xs font-black uppercase text-[#ef6f61]">
            Operacion Medellin
          </p>
          <h1 className="mt-1 text-4xl font-black leading-tight">
            Cola de verificacion y datos de impacto
          </h1>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Centros activos" value={cityImpact.activeCenters} />
          <Metric label="Visitas registradas" value={cityImpact.monthlyVisits} />
          <Metric label="Kg de ayuda" value={cityImpact.suppliesKg} />
          <Metric label="Familias" value={cityImpact.families} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
          <div className="rounded-[8px] border border-[#17324d]/10 bg-white p-4 shadow-[0_20px_70px_rgba(23,50,77,0.08)]">
            <div className="flex items-center gap-2">
              <ClipboardList aria-hidden="true" size={20} />
              <h2 className="text-lg font-black">Reportes pendientes</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {pendingReports.map((report) => (
                <article
                  className="rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2] p-3"
                  key={report.name}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{report.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#617781]">
                        {report.area} · {report.reporter}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#ffe8cc] px-2.5 py-1 text-xs font-black text-[#17324d]">
                      {report.signal}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-[#17324d] px-3 text-sm font-black text-white"
                      type="button"
                    >
                      <CheckCircle2 aria-hidden="true" size={16} />
                      Aprobar
                    </button>
                    <button
                      className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-[#17324d]/15 bg-white px-3 text-sm font-black text-[#17324d]"
                      type="button"
                    >
                      Revisar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#17324d]/10 bg-white p-4 shadow-[0_20px_70px_rgba(23,50,77,0.08)]">
            <div className="flex items-center gap-2">
              <Database aria-hidden="true" size={20} />
              <h2 className="text-lg font-black">Centros publicados</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {aidCenters.map((center) => (
                <article
                  className="rounded-[8px] border border-[#17324d]/10 p-3"
                  key={center.id}
                >
                  <p className="font-black">{center.name}</p>
                  <p className="mt-1 text-sm font-semibold text-[#617781]">
                    {center.neighborhood} · {center.verifiedAt}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[#17324d]/10 bg-white p-4 shadow-sm">
      <p className="text-3xl font-black text-[#17324d]">
        {new Intl.NumberFormat("es-CO").format(value)}
      </p>
      <p className="mt-1 text-xs font-black uppercase text-[#617781]">
        {label}
      </p>
    </div>
  );
}
