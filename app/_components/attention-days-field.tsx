"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

const dayOptions = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

export function AttentionDaysField() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const availableDays = useMemo(
    () => dayOptions.filter((day) => !selectedDays.includes(day)),
    [selectedDays],
  );

  const addDay = (day: string) => {
    if (!day || selectedDays.includes(day)) {
      return;
    }

    setSelectedDays((currentDays) => [...currentDays, day]);
  };

  const removeDay = (day: string) => {
    setSelectedDays((currentDays) =>
      currentDays.filter((currentDay) => currentDay !== day),
    );
  };

  return (
    <div className="grid min-w-0 gap-2 text-sm font-black md:col-span-2">
      <label className="grid min-w-0 gap-2">
        Dias de atencion
        <select
          className="min-h-12 min-w-0 max-w-full rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]"
          disabled={availableDays.length === 0}
          onChange={(event) => addDay(event.target.value)}
          required={selectedDays.length === 0}
          value=""
        >
          <option value="">
            {availableDays.length > 0
              ? "Seleccionar dia"
              : "Todos los dias seleccionados"}
          </option>
          {availableDays.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </label>

      {selectedDays.length > 0 ? (
        <div className="flex min-w-0 flex-wrap gap-2">
          {selectedDays.map((day) => (
            <span
              className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full bg-[#d7f8f2] px-3 text-xs font-black text-[#17324d]"
              key={day}
            >
              {day}
              <button
                aria-label={`Quitar ${day}`}
                className="grid size-6 place-items-center rounded-full bg-white text-[#17324d]"
                onClick={() => removeDay(day)}
                type="button"
              >
                <X aria-hidden="true" size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs font-bold leading-5 text-[#617781]">
          Selecciona uno o varios dias. Cada dia agregado aparecera como una
          etiqueta.
        </p>
      )}

      <input name="hours" type="hidden" value={selectedDays.join(", ")} />
    </div>
  );
}
