import Link from "next/link";
import { ArrowLeft, ClipboardCheck, LockKeyhole, Send } from "lucide-react";
import { redirect } from "next/navigation";
import {
  Field,
  FormSection,
  SelectField,
  TextAreaField,
} from "@/app/_components/form-primitives";

async function submitReport() {
  "use server";

  redirect("/reportar?estado=recibido");
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const received = estado === "recibido";

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

          {received ? (
            <div className="mt-6 rounded-[8px] border border-[#5cb85c]/30 bg-[#dff4dd] p-4 text-sm font-bold text-[#17324d]">
              Recibimos el reporte. El equipo admin lo revisara antes de
              publicarlo en el mapa.
            </div>
          ) : null}

          <form action={submitReport} className="mt-6 grid gap-5">
            <FormSection title="Datos del centro">
              <Field label="Nombre del centro" name="centerName" required />
              <Field label="Direccion" name="address" required />
              <Field label="Ciudad" name="city" required />
              <Field label="Departamento" name="department" required />
              <Field label="Barrio o comuna" name="neighborhood" required />
              <TextAreaField
                label="Detalles de ubicacion"
                name="locationDetails"
              />
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
              <Field label="Dias de atencion" name="hours" required />
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

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#17324d] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 md:w-fit"
              type="submit"
            >
              <Send aria-hidden="true" size={18} />
              Enviar para verificacion
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
