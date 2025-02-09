import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedalIcon, MapIcon, PlaneIcon, GiftIcon } from "./Icons";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "Digital Case Management",
    description:
      "Streamline case filing with digital forms, automatic case numbering, and integrated evidence management.",
  },
  {
    icon: <MapIcon />,
    title: "Smart Tracking",
    description:
      "Monitor patrol units, track incident locations, and coordinate emergency response in real-time.",
  },
  {
    icon: <PlaneIcon />,
    title: "Evidence Processing",
    description:
      "Secure digital evidence chain of custody, automated documentation, and AI-powered analysis tools.",
  },
  {
    icon: <GiftIcon />,
    title: "Intelligence Sharing",
    description:
      "Connect departments, share critical information, and collaborate on investigations seamlessly.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="howItWorks" className="container text-center py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold">
        Modern
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}Policing{" "}
        </span>
        Solutions
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-12 text-xl text-muted-foreground">
        Empowering law enforcement with cutting-edge digital tools for enhanced efficiency and effectiveness.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};