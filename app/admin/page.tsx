import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Database,
  LockKeyhole,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminDashboardData,
  type AdminCenterSummary,
  type AdminDashboardData,
} from "@/app/_lib/supabase-data";

const adminSessionCookie = "vlm_admin_access_token";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const requiredAdminRole = process.env.SUPABASE_ADMIN_ROLE ?? "admin";

type AdminSearchParams = Promise<{
  status?: string | string[];
}>;

type SupabaseUser = {
  accessToken?: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
};

type SupabaseTokenResponse = {
  access_token?: string;
  expires_in?: number;
  user?: SupabaseUser;
};

async function loginAdmin(formData: FormData) {
  "use server";

  let nextPath = "/admin?status=error";

  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    redirect("/admin?status=config");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin?status=invalid");
  }

  try {
    const response = await fetch(
      `${supabaseConfig.url}/auth/v1/token?grant_type=password`,
      {
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      nextPath =
        response.status >= 500 || errorText.includes("Database error")
          ? "/admin?status=auth-db"
          : "/admin?status=invalid";
    } else {
      const session = (await response.json()) as SupabaseTokenResponse;

      if (!session.access_token || !session.user) {
        nextPath = "/admin?status=invalid";
      } else if (!hasAdminRole(session.user)) {
        nextPath = "/admin?status=role";
      } else {
        const cookieStore = await cookies();

        cookieStore.set(adminSessionCookie, session.access_token, {
          httpOnly: true,
          maxAge: Math.min(session.expires_in ?? 3600, 60 * 60 * 4),
          path: "/admin",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        nextPath = "/admin";
      }
    }
  } catch {
    nextPath = "/admin?status=error";
  }

  redirect(nextPath);
}

async function logoutAdmin() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookie, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin?status=logged-out");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: AdminSearchParams;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const adminUser = await getAdminUser();

  if (!adminUser) {
    return <AdminLogin status={status} />;
  }

  const data = await getAdminDashboardData(adminUser.accessToken ?? "");

  return <AdminDashboard data={data} userEmail={adminUser.email ?? "Admin"} />;
}

function AdminLogin({ status }: { status?: string }) {
  const configured = Boolean(getSupabaseConfig());
  const statusMessage = getStatusMessage(status);

  return (
    <main className="min-h-dvh bg-[#fff8e8] px-4 py-5 text-[#17324d] sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-5xl flex-col">
        <Link
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-white px-3 text-sm font-black text-[#17324d] shadow-sm"
          href="/"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Mapa publico
        </Link>

        <section className="grid flex-1 place-items-center py-8">
          <div className="w-full max-w-md rounded-[12px] border border-[#17324d]/10 bg-white p-5 shadow-[0_22px_80px_rgba(23,50,77,0.12)]">
            <div className="grid size-12 place-items-center rounded-[8px] bg-[#d7f8f2] text-[#17324d]">
              <LockKeyhole aria-hidden="true" size={23} />
            </div>
            <p className="mt-5 text-xs font-black uppercase text-[#ef6f61]">
              Panel administrativo
            </p>
            <h1 className="mt-1 text-3xl font-black leading-tight">
              Acceso para equipo autorizado
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#49656f]">
              Ingresa con una cuenta de Supabase Auth que tenga el rol{" "}
              <span className="font-black text-[#17324d]">
                {requiredAdminRole}
              </span>{" "}
              en sus metadatos seguros.
            </p>

            {statusMessage ? (
              <div className="mt-4 rounded-[8px] border border-[#ef6f61]/20 bg-[#ffe2dd] p-3 text-sm font-bold text-[#17324d]">
                {statusMessage}
              </div>
            ) : null}

            {!configured ? (
              <div className="mt-4 rounded-[8px] border border-[#f7c948]/35 bg-[#fff3bf] p-3 text-sm font-bold leading-6 text-[#17324d]">
                Faltan las variables de entorno de Supabase para activar el
                login.
              </div>
            ) : null}

            <form action={loginAdmin} className="mt-5 grid gap-3">
              <label className="grid gap-2 text-sm font-black">
                Correo
                <input
                  autoComplete="email"
                  className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]"
                  name="email"
                  required
                  type="email"
                />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Contrasena
                <input
                  autoComplete="current-password"
                  className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]"
                  name="password"
                  required
                  type="password"
                />
              </label>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#17324d] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!configured}
                type="submit"
              >
                <ShieldCheck aria-hidden="true" size={17} />
                Entrar al panel
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminDashboard({
  data,
  userEmail,
}: {
  data: AdminDashboardData;
  userEmail: string;
}) {
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
          <form action={logoutAdmin}>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-white px-3 text-sm font-black text-[#17324d] shadow-sm"
              type="submit"
            >
              <LogOut aria-hidden="true" size={17} />
              Salir
            </button>
          </form>
        </div>

        <header className="mt-6">
          <p className="text-xs font-black uppercase text-[#ef6f61]">
            Operacion Colombia
          </p>
          <h1 className="mt-1 text-4xl font-black leading-tight">
            Cola de verificacion y datos de impacto
          </h1>
          <p className="mt-2 text-sm font-bold text-[#617781]">
            Sesion autorizada: {userEmail}
          </p>
        </header>

        {data.notice ? (
          <div className="mt-5 rounded-[8px] border border-[#ef6f61]/25 bg-[#ffe2dd] p-4 text-sm font-bold leading-6 text-[#17324d]">
            {data.notice}
          </div>
        ) : null}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Centros activos" value={data.impact.activeCenters} />
          <Metric label="Visitas registradas" value={data.impact.monthlyVisits} />
          <Metric label="Kg de ayuda" value={data.impact.suppliesKg} />
          <Metric label="Familias" value={data.impact.families} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
          <div className="rounded-[8px] border border-[#17324d]/10 bg-white p-4 shadow-[0_20px_70px_rgba(23,50,77,0.08)]">
            <div className="flex items-center gap-2">
              <ClipboardList aria-hidden="true" size={20} />
              <h2 className="text-lg font-black">Reportes pendientes</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data.pendingCenters.length > 0 ? (
                data.pendingCenters.map((report) => (
                  <AdminCenterCard center={report} key={report.id} />
                ))
              ) : (
                <EmptyAdminState message="No hay reportes pendientes en Supabase." />
              )}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#17324d]/10 bg-white p-4 shadow-[0_20px_70px_rgba(23,50,77,0.08)]">
            <div className="flex items-center gap-2">
              <Database aria-hidden="true" size={20} />
              <h2 className="text-lg font-black">Centros publicados</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data.approvedCenters.length > 0 ? (
                data.approvedCenters.map((center) => (
                  <AdminCenterCard center={center} compact key={center.id} />
                ))
              ) : (
                <EmptyAdminState message="No hay centros publicados en Supabase." />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

async function getAdminUser() {
  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(adminSessionCookie)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
      cache: "no-store",
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as SupabaseUser;

    return hasAdminRole(user) ? { ...user, accessToken } : null;
  } catch {
    return null;
  }
}

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return {
    anonKey: supabaseAnonKey,
    url: supabaseUrl,
  };
}

function hasAdminRole(user: SupabaseUser) {
  const metadata = user.app_metadata ?? {};
  const roleValues = [
    metadata.role,
    metadata.user_role,
    ...(Array.isArray(metadata.roles) ? metadata.roles : []),
    ...(Array.isArray(metadata.user_roles) ? metadata.user_roles : []),
  ];

  return roleValues.some((role) => role === requiredAdminRole);
}

function getStatusMessage(status?: string) {
  if (status === "config") {
    return "Configura Supabase antes de iniciar sesion.";
  }

  if (status === "invalid") {
    return "Correo o contrasena invalidos.";
  }

  if (status === "role") {
    return `La cuenta existe, pero no tiene el rol ${requiredAdminRole}.`;
  }

  if (status === "logged-out") {
    return "Sesion cerrada.";
  }

  if (status === "error") {
    return "No pudimos validar el acceso. Intenta de nuevo.";
  }

  if (status === "auth-db") {
    return "Supabase Auth devolvio un error de base de datos. Si creaste este usuario por SQL directo, elimina ese registro y recrealo con el Admin API.";
  }

  return undefined;
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

function AdminCenterCard({
  center,
  compact = false,
}: {
  center: AdminCenterSummary;
  compact?: boolean;
}) {
  return (
    <article className="rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{center.name}</h3>
          <p className="mt-1 text-sm font-semibold text-[#617781]">
            {center.neighborhood} · {center.city}
          </p>
        </div>
        <span className="rounded-full bg-[#ffe8cc] px-2.5 py-1 text-xs font-black text-[#17324d]">
          {center.status}
        </span>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-[#49656f]">
        {center.address}
      </p>

      {!compact ? (
        <div className="mt-3 grid gap-2 rounded-[8px] border border-[#17324d]/10 bg-white p-3 text-xs font-bold leading-5 text-[#49656f]">
          <p>Reporta: {center.reporter}</p>
          <p>Contacto privado: {center.reporterContact || "Sin contacto"}</p>
          <p>Senal: {center.signal}</p>
          <p>Geocode: {center.geocodeLabel}</p>
        </div>
      ) : (
        <p className="mt-2 text-sm font-semibold text-[#617781]">
          Publicado: {center.verifiedAt}
        </p>
      )}
    </article>
  );
}

function EmptyAdminState({ message }: { message: string }) {
  return (
    <div className="rounded-[8px] border border-dashed border-[#17324d]/20 bg-[#fffbf2] p-4 text-sm font-black text-[#49656f]">
      {message}
    </div>
  );
}
