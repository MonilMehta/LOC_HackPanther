import { Statistics } from "./Statistics";
import pilot from "../../assets/pilot.png";

export const About = () => {
  return (
    <section id="about" className="container py-24 sm:py-32">
      <div className="bg-muted/50 border rounded-lg py-12 hover:shadow-lg transition-shadow duration-300">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <img
            src={pilot}
            alt="Police Technology"
            className="w-[300px] object-contain rounded-lg shadow-md"
          />
          <div className="flex flex-col justify-between">
            <div className="pb-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  Transforming{" "}
                </span>
                Law Enforcement
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                We are dedicated to revolutionizing police operations through innovative digital solutions. 
                Our platform integrates cutting-edge technology with traditional policing methods to enhance 
                efficiency, improve response times, and strengthen community safety. With a focus on 
                user-friendly interfaces and robust security, we're helping law enforcement agencies 
                step into the digital age.
              </p>
            </div>

            <Statistics />
          </div>
        </div>
      </div>
    </section>
  );
};