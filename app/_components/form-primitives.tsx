import type { ReactNode } from "react";

export function FormSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <fieldset className="grid gap-4 rounded-[8px] border border-[#17324d]/10 p-4 md:grid-cols-2">
      <legend className="px-2 text-sm font-black uppercase text-[#ef6f61]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function Field({
  dataLocationSource,
  label,
  name,
  required,
  type = "text",
}: {
  dataLocationSource?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      <input
        className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]"
        data-location-source={dataLocationSource}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

export function TextAreaField({
  dataLocationSource,
  label,
  name,
  required,
}: {
  dataLocationSource?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black md:col-span-2">
      {label}
      <textarea
        className="min-h-28 rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 py-3 font-semibold outline-none focus:border-[#24a7a1]"
        data-location-source={dataLocationSource}
        name={name}
        required={required}
      />
    </label>
  );
}

export function SelectField({
  children,
  label,
  name,
  required,
}: {
  children: ReactNode;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      <select
        className="min-h-12 rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]"
        name={name}
        required={required}
      >
        {children}
      </select>
    </label>
  );
}
