export type AidCategoryId =
  | "food"
  | "health"
  | "shelter"
  | "documents"
  | "supplies"
  | "transport"
  | "donations"
  | "volunteers";

export type AidCategory = {
  id: AidCategoryId;
  label: string;
  shortLabel: string;
  accent: string;
  surface: string;
};

export type AidCenter = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  categories: AidCategoryId[];
  description: string;
  hours: string;
  requirements: string;
  publicContact: string;
  verifiedAt: string;
  impact: {
    visits: number;
    suppliesKg: number;
    families: number;
  };
  position: {
    x: number;
    y: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
};

export const aidCategories: AidCategory[] = [
  {
    id: "food",
    label: "Alimentacion",
    shortLabel: "Comida",
    accent: "#F7C948",
    surface: "#FFF3BF",
  },
  {
    id: "health",
    label: "Salud",
    shortLabel: "Salud",
    accent: "#24A7A1",
    surface: "#D7F8F2",
  },
  {
    id: "shelter",
    label: "Refugio",
    shortLabel: "Refugio",
    accent: "#EF6F61",
    surface: "#FFE2DD",
  },
  {
    id: "documents",
    label: "Documentos",
    shortLabel: "Docs",
    accent: "#4E7BD9",
    surface: "#DFEAFF",
  },
  {
    id: "supplies",
    label: "Ropa e insumos",
    shortLabel: "Insumos",
    accent: "#9B6ADB",
    surface: "#EFE4FF",
  },
  {
    id: "transport",
    label: "Transporte",
    shortLabel: "Ruta",
    accent: "#F29E4C",
    surface: "#FFE8CC",
  },
  {
    id: "donations",
    label: "Donaciones",
    shortLabel: "Donar",
    accent: "#5CB85C",
    surface: "#DFF4DD",
  },
  {
    id: "volunteers",
    label: "Voluntariado",
    shortLabel: "Voluntarios",
    accent: "#DB4E7A",
    surface: "#FFE0EA",
  },
];

export const aidCenters: AidCenter[] = [
  {
    id: "belen-integral",
    name: "Centro Integral Belen",
    neighborhood: "Belen",
    address: "Cra. 76 #32-24, Medellin",
    categories: ["food", "documents", "supplies"],
    description:
      "Entrega de mercados, orientacion documental y kits basicos para familias recien llegadas.",
    hours: "Lun, mie y vie · 9:00 a.m. - 3:00 p.m.",
    requirements: "Documento disponible y registro breve en el punto.",
    publicContact: "+57 300 000 8142",
    verifiedAt: "Verificado hace 2 dias",
    impact: {
      visits: 146,
      suppliesKg: 520,
      families: 88,
    },
    position: {
      x: 38,
      y: 66,
    },
    coordinates: {
      lat: 6.2324,
      lng: -75.5964,
    },
  },
  {
    id: "san-javier-salud",
    name: "Punto Salud San Javier",
    neighborhood: "San Javier",
    address: "Cl. 44 #95-18, Medellin",
    categories: ["health", "transport"],
    description:
      "Jornadas de triage, rutas a atencion primaria y apoyo para desplazamientos medicos.",
    hours: "Mar y jue · 8:00 a.m. - 12:30 p.m.",
    requirements: "Llegar 20 minutos antes del cierre.",
    publicContact: "WhatsApp disponible",
    verifiedAt: "Verificado ayer",
    impact: {
      visits: 93,
      suppliesKg: 120,
      families: 57,
    },
    position: {
      x: 24,
      y: 49,
    },
    coordinates: {
      lat: 6.2552,
      lng: -75.6186,
    },
  },
  {
    id: "casa-puente-prado",
    name: "Casa Puente Prado",
    neighborhood: "Prado Centro",
    address: "Cra. 50 #64-32, Medellin",
    categories: ["shelter", "food", "volunteers"],
    description:
      "Punto de descanso diurno, comida caliente y coordinacion de voluntarios por turnos.",
    hours: "Todos los dias · 10:00 a.m. - 6:00 p.m.",
    requirements: "Cupos limitados por orden de llegada.",
    publicContact: "+57 301 000 2288",
    verifiedAt: "Verificado hace 4 dias",
    impact: {
      visits: 214,
      suppliesKg: 780,
      families: 132,
    },
    position: {
      x: 55,
      y: 37,
    },
    coordinates: {
      lat: 6.2589,
      lng: -75.5649,
    },
  },
  {
    id: "red-documental-poblado",
    name: "Red Documental Poblado",
    neighborhood: "El Poblado",
    address: "Cl. 10 #43A-22, Medellin",
    categories: ["documents", "volunteers"],
    description:
      "Acompanamiento para citas, orientacion legal y revision de papeles antes de radicar.",
    hours: "Sab · 9:00 a.m. - 1:00 p.m.",
    requirements: "Agendar cupo por WhatsApp.",
    publicContact: "agenda@redsolidaria.co",
    verifiedAt: "Verificado hace 1 semana",
    impact: {
      visits: 61,
      suppliesKg: 40,
      families: 39,
    },
    position: {
      x: 67,
      y: 70,
    },
    coordinates: {
      lat: 6.2092,
      lng: -75.5677,
    },
  },
  {
    id: "bodega-solidaria-caribe",
    name: "Bodega Solidaria Caribe",
    neighborhood: "Caribe",
    address: "Cra. 64C #75-10, Medellin",
    categories: ["donations", "supplies", "transport"],
    description:
      "Recepcion y distribucion de donaciones verificadas: ropa, cobijas, higiene y alimentos no perecederos.",
    hours: "Lun a sab · 8:30 a.m. - 5:00 p.m.",
    requirements: "Donaciones limpias y separadas por tipo.",
    publicContact: "+57 304 000 4410",
    verifiedAt: "Verificado hoy",
    impact: {
      visits: 78,
      suppliesKg: 940,
      families: 73,
    },
    position: {
      x: 48,
      y: 22,
    },
    coordinates: {
      lat: 6.2792,
      lng: -75.572,
    },
  },
];

export const cityImpact = {
  activeCenters: aidCenters.length,
  monthlyVisits: aidCenters.reduce((total, center) => total + center.impact.visits, 0),
  suppliesKg: aidCenters.reduce(
    (total, center) => total + center.impact.suppliesKg,
    0,
  ),
  families: aidCenters.reduce((total, center) => total + center.impact.families, 0),
};
