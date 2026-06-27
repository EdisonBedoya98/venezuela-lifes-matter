import type { Metadata } from "next";
import { AidMapExperience } from "@/app/_components/aid-map-experience";
import { getPublicMapData } from "@/app/_lib/data-service";

export const dynamic = "force-dynamic";

const centerQueryParam = "centro";
const defaultTitle = "Ayuda a Venezuela | Venezuela Lives Matter";
const defaultDescription =
  "Encuentra y comparte centros verificados para apoyar ayuda a Venezuela con ubicaciones, horarios y contactos publicos.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayudavenezuela.co";

type HomeSearchParams = Promise<{
  centro?: string | string[];
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const selectedCenterId = Array.isArray(params.centro)
    ? params.centro[0]
    : params.centro;
  const pageUrl = new URL("/", siteUrl);
  let title = defaultTitle;
  let description = defaultDescription;

  if (selectedCenterId) {
    pageUrl.searchParams.set(centerQueryParam, selectedCenterId);

    const { centers } = await getPublicMapData();
    const selectedCenter = centers.find((center) => center.id === selectedCenterId);

    if (selectedCenter) {
      title = `Ayuda a Venezuela | ${selectedCenter.name}`;
      description = `Comparte ${selectedCenter.name}, un centro verificado para apoyar ayuda a Venezuela. Revisa ubicacion, horarios y contacto publico.`;
    }
  }

  return {
    alternates: {
      canonical: pageUrl,
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: "Ayuda a Venezuela",
          height: 512,
          url: "/pin-velezuela.webp",
          width: 512,
        },
      ],
      locale: "es_CO",
      siteName: "Venezuela Lives Matter",
      title,
      type: "website",
      url: pageUrl,
    },
    title,
    twitter: {
      card: "summary",
      description,
      images: ["/pin-velezuela.webp"],
      title,
    },
  };
}

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
