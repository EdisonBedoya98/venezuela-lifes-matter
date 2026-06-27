export type ColombiaDepartment = {
  cities: string[];
  id: string;
  name: string;
};

export const colombiaDepartments: ColombiaDepartment[] = [
  { id: "amazonas", name: "Amazonas", cities: ["Leticia", "Puerto Narino"] },
  {
    id: "antioquia",
    name: "Antioquia",
    cities: ["Medellin", "Bello", "Itagui", "Envigado", "Rionegro", "Apartado", "Turbo"],
  },
  { id: "arauca", name: "Arauca", cities: ["Arauca", "Saravena", "Tame"] },
  {
    id: "atlantico",
    name: "Atlantico",
    cities: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia"],
  },
  { id: "bogota-dc", name: "Bogota D.C.", cities: ["Bogota"] },
  {
    id: "bolivar",
    name: "Bolivar",
    cities: ["Cartagena", "Magangue", "Turbaco", "Arjona"],
  },
  { id: "boyaca", name: "Boyaca", cities: ["Tunja", "Duitama", "Sogamoso", "Chiquinquira"] },
  { id: "caldas", name: "Caldas", cities: ["Manizales", "La Dorada", "Chinchina"] },
  { id: "caqueta", name: "Caqueta", cities: ["Florencia", "San Vicente del Caguan"] },
  { id: "casanare", name: "Casanare", cities: ["Yopal", "Aguazul", "Villanueva"] },
  { id: "cauca", name: "Cauca", cities: ["Popayan", "Santander de Quilichao"] },
  { id: "cesar", name: "Cesar", cities: ["Valledupar", "Aguachica", "Codazzi"] },
  { id: "choco", name: "Choco", cities: ["Quibdo", "Istmina", "Tado"] },
  { id: "cordoba", name: "Cordoba", cities: ["Monteria", "Lorica", "Sahagun"] },
  {
    id: "cundinamarca",
    name: "Cundinamarca",
    cities: ["Soacha", "Chia", "Zipaquira", "Facatativa", "Fusagasuga", "Girardot"],
  },
  { id: "guainia", name: "Guainia", cities: ["Inirida"] },
  { id: "guaviare", name: "Guaviare", cities: ["San Jose del Guaviare"] },
  { id: "huila", name: "Huila", cities: ["Neiva", "Pitalito", "Garzon"] },
  { id: "la-guajira", name: "La Guajira", cities: ["Riohacha", "Maicao", "Uribia"] },
  {
    id: "magdalena",
    name: "Magdalena",
    cities: ["Santa Marta", "Cienaga", "Fundacion"],
  },
  { id: "meta", name: "Meta", cities: ["Villavicencio", "Acacias", "Granada"] },
  { id: "narino", name: "Narino", cities: ["Pasto", "Tumaco", "Ipiales"] },
  {
    id: "norte-de-santander",
    name: "Norte de Santander",
    cities: ["Cucuta", "Ocana", "Villa del Rosario", "Pamplona"],
  },
  { id: "putumayo", name: "Putumayo", cities: ["Mocoa", "Puerto Asis", "Orito"] },
  { id: "quindio", name: "Quindio", cities: ["Armenia", "Calarca", "Montenegro"] },
  { id: "risaralda", name: "Risaralda", cities: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"] },
  {
    id: "san-andres",
    name: "San Andres y Providencia",
    cities: ["San Andres", "Providencia"],
  },
  { id: "santander", name: "Santander", cities: ["Bucaramanga", "Floridablanca", "Giron", "Barrancabermeja"] },
  { id: "sucre", name: "Sucre", cities: ["Sincelejo", "Corozal", "Sampues"] },
  { id: "tolima", name: "Tolima", cities: ["Ibague", "Espinal", "Honda"] },
  {
    id: "valle-del-cauca",
    name: "Valle del Cauca",
    cities: ["Cali", "Palmira", "Buenaventura", "Tulua", "Buga", "Cartago"],
  },
  { id: "vaupes", name: "Vaupes", cities: ["Mitu"] },
  { id: "vichada", name: "Vichada", cities: ["Puerto Carreno"] },
];

export const neighborhoodOptionsByCity: Record<string, string[]> = {
  Barranquilla: ["El Prado", "Centro", "Riomar", "Suroccidente", "Metropolitana"],
  Bogota: ["Teusaquillo", "Chapinero", "Kennedy", "Suba", "Engativa", "Bosa", "Santa Fe"],
  Cartagena: ["Manga", "Centro", "Getsemani", "Bocagrande", "Olaya Herrera", "El Pozon"],
  Medellin: ["Belen", "San Javier", "Prado Centro", "El Poblado", "Caribe", "Laureles", "Manrique"],
  "Santa Marta": ["Centro", "El Rodadero", "Mamatoco", "Bastidas", "Gaira"],
};
