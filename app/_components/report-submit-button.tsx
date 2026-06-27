"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useFormStatus } from "react-dom";

export function ReportSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#17324d] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-75 md:w-fit"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
      ) : (
        <Send aria-hidden="true" size={18} />
      )}
      {pending ? "Enviando verificacion" : "Enviar para verificacion"}
    </button>
  );
}
