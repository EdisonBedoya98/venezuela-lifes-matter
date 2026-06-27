"use server";

import { aidCenters, aidCities } from "@/app/_data/aid-centers";

export type VolunteerApplicationResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequiredText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getTextList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

export async function submitVolunteerApplication(
  formData: FormData,
): Promise<VolunteerApplicationResult> {
  const centerId = getRequiredText(formData, "centerId");
  const center = aidCenters.find((currentCenter) => currentCenter.id === centerId);

  if (!center) {
    return {
      ok: false,
      message: "No encontramos el centro seleccionado. Intenta abrirlo de nuevo.",
    };
  }

  const fullName = getRequiredText(formData, "fullName");
  const email = getRequiredText(formData, "email").toLowerCase();
  const phone = getRequiredText(formData, "phone");
  const volunteerCity = getRequiredText(formData, "volunteerCity");
  const availability = getRequiredText(formData, "availability");
  const supportAreas = getTextList(formData, "supportAreas");
  const message = getOptionalText(formData, "message");
  const shareConsent = formData.get("shareConsent") === "on";

  if (!fullName || !email || !phone || !volunteerCity || !availability) {
    return {
      ok: false,
      message: "Completa los datos obligatorios para enviar la postulacion.",
    };
  }

  if (!emailPattern.test(email)) {
    return {
      ok: false,
      message: "Escribe un correo valido para poder contactarte.",
    };
  }

  if (supportAreas.length === 0) {
    return {
      ok: false,
      message: "Selecciona al menos una forma en la que quieres apoyar.",
    };
  }

  if (!shareConsent) {
    return {
      ok: false,
      message:
        "Necesitamos tu autorizacion para compartir tus datos con el centro seleccionado.",
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      message:
        "Supabase no esta configurado para guardar postulaciones de voluntarios.",
    };
  }

  const city = aidCities.find((currentCity) => currentCity.id === center.cityId);
  const response = await fetch(`${supabaseUrl}/rest/v1/volunteer_applications`, {
    body: JSON.stringify({
      availability,
      center_id: center.id,
      center_name: center.name,
      city_id: center.cityId,
      city_name: city?.name ?? center.cityId,
      email,
      full_name: fullName,
      message: message || null,
      phone,
      share_consent: shareConsent,
      status: "new",
      support_areas: supportAreas,
      volunteer_city: volunteerCity,
    }),
    cache: "no-store",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "POST",
  });

  if (!response.ok) {
    const details = await response.text();

    console.error("Supabase volunteer application insert failed", {
      details,
      status: response.status,
    });

    return {
      ok: false,
      message:
        "No pudimos guardar la postulacion ahora. Revisa la tabla de Supabase e intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message:
      "Listo. Recibimos tu postulacion y el equipo la revisara para coordinar con este centro.",
  };
}
