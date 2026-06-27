"use client";

import { useMemo, useState } from "react";
import {
  colombiaDepartments,
  neighborhoodOptionsByCity,
} from "@/app/_data/colombia-locations";
import { FieldLabel } from "@/app/_components/form-primitives";

const OTHER_VALUE = "__other";

function fieldClassName() {
  return "min-h-12 min-w-0 max-w-full rounded-[8px] border border-[#17324d]/15 bg-[#fffbf2] px-3 font-semibold outline-none focus:border-[#24a7a1]";
}

export function LocationFields() {
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [customNeighborhood, setCustomNeighborhood] = useState("");

  const selectedDepartment = useMemo(
    () => colombiaDepartments.find((item) => item.name === department),
    [department],
  );
  const cities = selectedDepartment?.cities ?? [];
  const selectedCity = city === OTHER_VALUE ? customCity.trim() : city;
  const neighborhoodOptions = selectedCity
    ? neighborhoodOptionsByCity[selectedCity] ?? []
    : [];
  const selectedNeighborhood =
    neighborhood === OTHER_VALUE ? customNeighborhood.trim() : neighborhood;

  return (
    <>
      <label className="grid min-w-0 gap-2 text-sm font-black">
        <FieldLabel label="Departamento" required />
        <select
          aria-required={true}
          className={fieldClassName()}
          data-location-source="department"
          onChange={(event) => {
            setDepartment(event.target.value);
            setCity("");
            setCustomCity("");
            setNeighborhood("");
            setCustomNeighborhood("");
          }}
          required
          value={department}
        >
          <option value="">Seleccionar departamento</option>
          {colombiaDepartments.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <input name="department" type="hidden" value={department} />

      <label className="grid min-w-0 gap-2 text-sm font-black">
        <FieldLabel label="Ciudad o municipio" required />
        <select
          aria-required={true}
          className={fieldClassName()}
          data-location-source="city"
          disabled={!department}
          onChange={(event) => {
            setCity(event.target.value);
            setCustomCity("");
            setNeighborhood("");
            setCustomNeighborhood("");
          }}
          required
          value={city}
        >
          <option value="">
            {department ? "Seleccionar ciudad" : "Primero selecciona departamento"}
          </option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value={OTHER_VALUE}>Otra ciudad o municipio</option>
        </select>
      </label>

      {city === OTHER_VALUE ? (
        <label className="grid min-w-0 gap-2 text-sm font-black">
          <FieldLabel label="Especifica ciudad o municipio" required />
          <input
            aria-required={true}
            className={fieldClassName()}
            data-location-source="city"
            onChange={(event) => setCustomCity(event.target.value)}
            required
            type="text"
            value={customCity}
          />
        </label>
      ) : null}
      <input name="city" type="hidden" value={selectedCity} />

      {selectedCity && neighborhoodOptions.length === 0 ? null : (
        <label className="grid min-w-0 gap-2 text-sm font-black">
          <FieldLabel label="Barrio o comuna" />
          <select
            className={fieldClassName()}
            data-location-source="neighborhood"
            disabled={!selectedCity}
            onChange={(event) => {
              setNeighborhood(event.target.value);
              setCustomNeighborhood("");
            }}
            value={neighborhood}
          >
            <option value="">
              {selectedCity ? "Seleccionar barrio o comuna" : "Primero selecciona ciudad"}
            </option>
            {neighborhoodOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value={OTHER_VALUE}>Otro barrio o comuna</option>
          </select>
        </label>
      )}

      {neighborhood === OTHER_VALUE ||
      (Boolean(selectedCity) && neighborhoodOptions.length === 0) ? (
        <label className="grid min-w-0 gap-2 text-sm font-black">
          <FieldLabel label="Especifica barrio o comuna" />
          <input
            className={fieldClassName()}
            data-location-source="neighborhood"
            disabled={!selectedCity}
            onChange={(event) => setCustomNeighborhood(event.target.value)}
            type="text"
            value={customNeighborhood}
          />
        </label>
      ) : null}
      <input name="neighborhood" type="hidden" value={selectedNeighborhood} />
    </>
  );
}
