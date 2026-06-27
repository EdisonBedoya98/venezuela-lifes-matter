import { AidMapExperience } from "@/app/_components/aid-map-experience";
import {
  aidCategories,
  aidCenters,
  aidCities,
  cityImpact,
} from "@/app/_data/aid-centers";

export default function Home() {
  return (
    <AidMapExperience
      categories={aidCategories}
      centers={aidCenters}
      cities={aidCities}
      impact={cityImpact}
    />
  );
}
