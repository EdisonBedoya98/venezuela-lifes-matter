import Link from "next/link";
import { ArrowLeft, ClipboardCheck, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { AttentionDaysField } from "@/app/_components/attention-days-field";
import {
  Field,
  FormSection,
  SelectField,
  TextAreaField,
} from "@/app/_components/form-primitives";
import { LocationFields } from "@/app/_components/location-fields";
import { LocationVerifier } from "@/app/_components/location-verifier";
import { ReportSubmitButton } from "@/app/_components/report-submit-button";
import { createCenterSubmission } from "@/app/_lib/data-service";

async function submitReport(formData: FormData) {
  "use server";

  const latitude = Number(formData.get("geoLatitude"));
  const longitude = Number(formData.get("geoLongitude"));
  const formattedAddress = String(formData.get("geoFormattedAddress") ?? "");
  const placeId = String(formData.get("geoPlaceId") ?? "");

  if (
    !formattedAddress ||
    !placeId ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    redirect("/reportar?estado=ubicacion");
  }

  if (!isInsideColombia(latitude, longitude)) {
    redirect("/reportar?estado=ubicacion-invalida");
  }

  const result = await createCenterSubmission(formData);

  redirect(`/reportar?estado=${result.status}`);
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const received = estado === "recibido";
  const statusMessage = getStatusMessage(estado);

  return (
    <main className="min-h-dvh bg-[#fff8e8] px-4 py-5 text-[#17324d] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#17324d]/10 bg-white px-3 text-sm font-black text-[#17324d] shadow-sm"
          href="/"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Mapa
        </Link>

        <section className="mt-5 rounded-[8px] border border-[#17324d]/10 bg-white p-4 shadow-[0_20px_70px_rgba(23,50,77,0.08)] sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-[#f7c948] text-[#17324d]">
              <ClipboardCheck aria-hidden="true" size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[#ef6f61]">
                Postulacion de centro
              </p>
              <h1 className="mt-1 text-3xl font-black leading-tight">
                Postular un centro de recoleccion o ayuda
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#49656f]">
                Este formulario es para organizaciones, voluntarios o aliados
                que quieren aparecer en el mapa. El equipo revisa la informacion
                antes de publicar el centro.
              </p>
            </div>
          </div>

          {statusMessage ? (
            <div
              className={`mt-6 rounded-[8px] border p-4 text-sm font-bold text-[#17324d] ${
                received
                  ? "border-[#5cb85c]/30 bg-[#dff4dd]"
                  : "border-[#ef6f61]/30 bg-[#ffe2dd]"
              }`}
            >
              {statusMessage}
            </div>
          ) : null}

          <form action={submitReport} className="mt-6 grid gap-5">
            <FormSection title="Datos del centro">
              <Field label="Nombre del centro" name="centerName" required />
              <LocationFields />
              <TextAreaField
                dataLocationSource="locationDetails"
                label="Detalles de ubicacion"
                name="locationDetails"
              />
              <Field
                dataLocationSource="address"
                label="Direccion"
                name="address"
                required
              />
              <LocationVerifier />
              <SelectField label="Tipo de ayuda principal" name="category" required>
                <option value="">Seleccionar</option>
                <option value="food">Recoleccion o entrega de comida</option>
                <option value="health">Salud</option>
                <option value="shelter">Refugio</option>
                <option value="documents">Documentos</option>
                <option value="supplies">Ropa e insumos</option>
                <option value="transport">Transporte</option>
                <option value="donations">Donaciones</option>
                <option value="volunteers">Voluntariado</option>
              </SelectField>
              <AttentionDaysField />
              <Field
                label="Hora de inicio"
                name="openingTime"
                required
                type="time"
              />
              <Field
                label="Hora de cierre"
                name="closingTime"
                required
                type="time"
              />
              <Field label="Contacto publico autorizado" name="publicContact" />
              <TextAreaField
                label="Descripcion del servicio"
                name="description"
                required
              />
              <TextAreaField
                label="Requisitos para recibir o entregar ayuda"
                name="requirements"
              />
            </FormSection>

            <FormSection title="Datos privados de verificacion">
              <Field label="Nombre de quien reporta" name="reporterName" required />
              <Field
                label="Correo"
                name="email"
                required
                type="email"
              />
              <Field label="WhatsApp o telefono" name="phone" required />
              <Field label="Organizacion, si aplica" name="organization" />
            </FormSection>

            <div className="rounded-[8px] border border-[#17324d]/10 bg-[#fffbf2] p-4">
              <div className="flex gap-3">
                <LockKeyhole
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#24a7a1]"
                  size={20}
                />
                <div className="grid gap-3 text-sm leading-6 text-[#49656f]">
                  <label className="flex gap-3 font-semibold">
                    <input
                      className="mt-1 size-4 shrink-0"
                      name="dataConsent"
                      required
                      type="checkbox"
                    />
                    Autorizo el tratamiento de mis datos personales para
                    verificar este reporte.
                  </label>
                  <label className="flex gap-3 font-semibold">
                    <input
                      className="mt-1 size-4 shrink-0"
                      name="emailConsent"
                      type="checkbox"
                    />
                    Acepto recibir comunicaciones sobre actualizaciones y
                    coordinacion de ayuda.
                  </label>
                </div>
              </div>
            </div>

            <ReportSubmitButton />
          </form>
        </section>
      </div>
    </main>
  );
}

function isInsideColombia(lat: number, lng: number) {
  return lat >= -4.5 && lat <= 13.8 && lng >= -82.2 && lng <= -66.8;
}

function getStatusMessage(status?: string) {
  if (status === "recibido") {
    return "Tu centro fue enviado satisfactoriamente. El equipo verificara la informacion y, si todo esta correcto, lo publicara en el mapa.";
  }

  if (status === "config") {
    return "Faltan variables del servidor para guardar el reporte. Revisa la configuracion privada del proyecto.";
  }

  if (status === "error") {
    return "No pudimos guardar el reporte. Revisa la configuracion interna y vuelve a intentar.";
  }

  if (status === "ubicacion") {
    return "Antes de enviar, valida y fija el pin con Google Maps para que el equipo pueda aprobar una ubicacion exacta.";
  }

  if (status === "ubicacion-invalida") {
    return "Las coordenadas no parecen estar dentro de Colombia. Revisa la direccion y vuelve a fijar el pin.";
  }

  return undefined;
}
