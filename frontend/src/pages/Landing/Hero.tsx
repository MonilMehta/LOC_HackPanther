import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { HeroCards } from "./HeroCards";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-4xl md:text-5xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#FF9933] to-[#138808] text-transparent bg-clip-text">
              Digital Transformation
            </span>{" "}
            of Police Work Culture
          </h1>{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#000080] to-[#138808] text-transparent bg-clip-text">
              Empowering Law Enforcement
            </span>
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Streamlining police operations with advanced digital solutions for enhanced efficiency, 
          transparency, and public safety across India.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button className="w-full md:w-1/3 bg-[#000080] hover:bg-[#000060]">
            Access Portal
          </Button>

          <a
            rel="noreferrer noopener"
            href="#features"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            Learn More
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <div className="z-10">
        <HeroCards />
      </div>

      <div className="shadow"></div>
    </section>
  );
};