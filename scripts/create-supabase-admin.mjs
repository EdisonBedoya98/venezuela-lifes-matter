import { readFileSync } from "node:fs";

const localEnv = loadLocalEnv();
const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const adminEmail = getRequiredEnv("ADMIN_EMAIL").toLowerCase();
const adminPassword = getRequiredEnv("ADMIN_PASSWORD");
const adminFullName =
  process.env.ADMIN_FULL_NAME ??
  localEnv.ADMIN_FULL_NAME ??
  "Venezuela Lives Matter Admin";

if (adminPassword.length < 8) {
  throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
}

const authBaseUrl = `${supabaseUrl.replace(/\/+$/, "")}/auth/v1`;

const adminPayload = {
  app_metadata: {
    role: "admin",
    roles: ["admin"],
    user_role: "admin",
    user_roles: ["admin"],
  },
  email: adminEmail,
  email_confirm: true,
  password: adminPassword,
  user_metadata: {
    full_name: adminFullName,
  },
};

const createResponse = await authFetch("/admin/users", {
  body: JSON.stringify(adminPayload),
  method: "POST",
});

let user;

if (createResponse.ok) {
  user = await createResponse.json();
} else {
  const createError = await readJsonOrText(createResponse);

  if (!isAlreadyRegisteredError(createError)) {
    throw new Error(
      `No se pudo crear el admin (${createResponse.status}): ${formatError(createError)}`,
    );
  }

  user = await findUserByEmail(adminEmail);

  if (!user?.id) {
    throw new Error(
      "El usuario ya existe, pero no se pudo encontrar por Admin API. Si corriste SQL directo antes, ejecuta supabase/admin/delete_broken_admin_user.sql y vuelve a intentar.",
    );
  }

  const updateResponse = await authFetch(`/admin/users/${user.id}`, {
    body: JSON.stringify(adminPayload),
    method: "PUT",
  });

  if (!updateResponse.ok) {
    const updateError = await readJsonOrText(updateResponse);

    throw new Error(
      `No se pudo actualizar el admin (${updateResponse.status}): ${formatError(updateError)}`,
    );
  }

  user = await updateResponse.json();
}

await upsertProfile(user.id);

console.log(`Admin listo: ${adminEmail} (${user.id})`);

function loadLocalEnv() {
  try {
    return Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const separatorIndex = line.indexOf("=");

          if (separatorIndex === -1) {
            return [line, ""];
          }

          const key = line.slice(0, separatorIndex);
          const value = line
            .slice(separatorIndex + 1)
            .replace(/^['"]|['"]$/g, "");

          return [key, value];
        }),
    );
  } catch {
    return {};
  }
}

function getRequiredEnv(name) {
  const value = process.env[name] ?? localEnv[name];

  if (!value) {
    throw new Error(`Falta ${name}. Puedes ponerlo en .env.local o exportarlo.`);
  }

  return value;
}

async function authFetch(path, init = {}) {
  return fetch(`${authBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function findUserByEmail(email) {
  const response = await authFetch("/admin/users?page=1&per_page=1000");

  if (!response.ok) {
    const error = await readJsonOrText(response);

    throw new Error(
      `No se pudieron listar usuarios (${response.status}): ${formatError(error)}`,
    );
  }

  const data = await response.json();
  const users = Array.isArray(data.users) ? data.users : [];

  return users.find((candidate) => candidate.email?.toLowerCase() === email);
}

async function upsertProfile(userId) {
  const response = await fetch(
    `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/profiles?on_conflict=id`,
    {
      body: JSON.stringify({
        email: adminEmail,
        full_name: adminFullName,
        id: userId,
        role: "admin",
      }),
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const error = await readJsonOrText(response);

    throw new Error(
      `Admin creado, pero no se pudo sincronizar profiles (${response.status}): ${formatError(error)}`,
    );
  }
}

async function readJsonOrText(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isAlreadyRegisteredError(error) {
  const message = formatError(error).toLowerCase();

  return (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists") ||
    message.includes("duplicate")
  );
}

function formatError(error) {
  if (typeof error === "string") {
    return error;
  }

  return JSON.stringify(error);
}
