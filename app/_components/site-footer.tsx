import { AtSign, ExternalLink, MapPin } from "lucide-react";

const creditLinks = [
  {
    href: "https://www.linkedin.com/search/results/people/?keywords=Edison%20Garcia",
    label: "LinkedIn de Edison Garcia",
    name: "Edison Garcia",
    network: "LinkedIn",
  },
  {
    href: "https://github.com/EdisonBedoya98",
    label: "GitHub de Edison Bedoya Garcia",
    name: "Edison Bedoya Garcia",
    network: "GitHub",
  },
  {
    href: "https://www.linkedin.com/search/results/people/?keywords=David%20Elias%20Palacios",
    label: "LinkedIn de David Elias Palacios",
    name: "David Elias Palacios",
    network: "LinkedIn",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#17324d]/10 bg-[#17324d] text-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-black text-[#f7c948]">
            <MapPin aria-hidden="true" size={17} />
            Venezuela Lives Matter
          </div>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/78">
            Creditos del proyecto para Edison Garcia, Edison Bedoya Garcia y
            David Elias Palacios.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          {creditLinks.map(({ href, label, name, network }) => (
            <a
              aria-label={label}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-white/12 bg-white/8 px-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/14 sm:justify-center"
              href={href}
              key={name}
              rel="noreferrer"
              target="_blank"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <AtSign aria-hidden="true" className="shrink-0" size={17} />
                <span className="truncate">{name}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#17324d]">
                {network}
                <ExternalLink aria-hidden="true" size={12} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
