import { Building2, Shield, BadgeCheck, Landmark, GraduationCap, Scale } from "lucide-react";

interface SponsorProps {
  icon: JSX.Element;
  name: string;
}

const sponsors: SponsorProps[] = [
  {
    icon: <Shield size={34} />,
    name: "Ministry of Home Affairs",
  },
  {
    icon: <Building2 size={34} />,
    name: "National Police Academy",
  },
  {
    icon: <Landmark size={34} />,
    name: "State Police HQ",
  },
  {
    icon: <BadgeCheck size={34} />,
    name: "Central Intelligence",
  },
  {
    icon: <GraduationCap size={34} />,
    name: "Police Training Institute",
  },
  {
    icon: <Scale size={34} />,
    name: "Forensic Department",
  },
];

export const Sponsors = () => {
  return (
    <section id="sponsors" className="container pt-24 sm:py-32">
      <h2 className="text-center text-2xl lg:text-3xl font-bold mb-12 text-primary">
        Our Supporting Organizations
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
        {sponsors.map(({ icon, name }: SponsorProps) => (
          <div
            key={name}
            className="flex items-center gap-2 text-muted-foreground/60 hover:text-primary transition-colors duration-200"
          >
            <span>{icon}</span>
            <h3 className="text-lg md:text-xl font-bold">{name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};