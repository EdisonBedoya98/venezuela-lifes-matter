import type { ReactNode } from "react";

export function FormSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <fieldset className="grid min-w-0 max-w-full gap-4 rounded-[8px] border border-[#17324d]/10 p-4 md:grid-cols-2">
      <legend className="max-w-full px-2 text-sm font-black uppercase text-[#ef6f61]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function Field({
  dataLocationSource,
  hint,
  label,
  name,
  required,
  type = "text",
}: {
  dataLocationSource?: string;
  hint?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-black">
      <FieldLabel label={label} required={required} />
      <input
        aria-required={required}
        className="min-h-12 min-w-0 max-w-full rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]"
        data-location-source={dataLocationSource}
        name={name}
        required={required}
        type={type}
      />
      {hint ? (
        <span className="text-xs font-bold leading-5 text-[#617781]">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextAreaField({
  dataLocationSource,
  hint,
  label,
  name,
  required,
}: {
  dataLocationSource?: string;
  hint?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-black md:col-span-2">
      <FieldLabel label={label} required={required} />
      <textarea
        aria-required={required}
        className="min-h-28 min-w-0 max-w-full rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 py-3 font-semibold outline-none focus:border-[#24a7a1]"
        data-location-source={dataLocationSource}
        name={name}
        required={required}
      />
      {hint ? (
        <span className="text-xs font-bold leading-5 text-[#617781]">{hint}</span>
      ) : null}
    </label>
  );
}

export function SelectField({
  children,
  hint,
  label,
  name,
  required,
}: {
  children: ReactNode;
  hint?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-black">
      <FieldLabel label={label} required={required} />
      <select
        aria-required={required}
        className="min-h-12 min-w-0 max-w-full rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]"
        name={name}
        required={required}
      >
        {children}
      </select>
      {hint ? (
        <span className="text-xs font-bold leading-5 text-[#617781]">{hint}</span>
      ) : null}
    </label>
  );
}

export function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <span>{label}</span>
      <RequirementBadge required={required} />
    </span>
  );
}

export function RequirementBadge({ required }: { required?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
        required
          ? "bg-[#ffe2dd] text-[#ef6f61]"
          : "bg-[#eef3f0] text-[#617781]"
      }`}
    >
      {required ? "Obligatorio" : "Opcional"}
    </span>
  );
}
