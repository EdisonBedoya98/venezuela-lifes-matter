export type AidCategoryId = string;
export type AidCityId = string;

export type AidCity = {
  id: AidCityId;
  name: string;
  region: string;
  map: {
    center: {
      lat: number;
      lng: number;
    };
    zoom: number;
  };
};

export type AidCategory = {
  id: AidCategoryId;
  label: string;
  shortLabel: string;
  accent: string;
  surface: string;
};

export type AidImpact = {
  activeCenters: number;
  monthlyVisits: number;
  suppliesKg: number;
  families: number;
};

export type AidCenter = {
  id: string;
  databaseId: string;
  cityId: AidCityId;
  cityName: string;
  department: string;
  name: string;
  neighborhood: string;
  address: string;
  locationDetails: string;
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
