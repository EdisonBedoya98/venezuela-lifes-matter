import { AidMapExperience } from "@/app/_components/aid-map-experience";
import { getPublicMapData } from "@/app/_lib/data-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { categories, centers, cities, impact, notice } =
    await getPublicMapData();

  return (
    <AidMapExperience
      categories={categories}
      centers={centers}
      cities={cities}
      impact={impact}
      notice={notice}
    />
  );
}
