import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

interface FeatureProps {
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    title: "Case Management System",
    description:
      "Enable police officers to digitally file, track, and manage cases with real-time access to evidence and updates.",
  },
  {
    title: "Real-Time Communication",
    description:
      "Provide secure, real-time communication tools for officers to share critical information, updates, and alerts.",
  },
  {
    title: "Digital Evidence Collection",
    description:
      "Integrate photo, video, and document uploading features for secure and organized digital evidence storage.",
  },
  {
    title: "Geolocation Services",
    description:
      "Use GPS functionality to help officers navigate to crime scenes or track incidents and resources in real time.",
  },
  {
    title: "Public Reporting System",
    description:
      "Allow citizens to report incidents or crimes through the app, facilitating faster response times.",
  },
  {
    title: "Personnel Management and Scheduling",
    description:
      "Help police stations manage shifts, allocate personnel, and track performance metrics.",
  },
];

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Key{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Features
        </span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description }: FeatureProps) => (
          <motion.div
            key={title}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent>{description}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};