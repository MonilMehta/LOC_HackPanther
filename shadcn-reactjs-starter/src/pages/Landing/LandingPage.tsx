import { About } from "./About";
import { Cta } from "./CTA";
import { FAQ } from "./FAQ";
import { Features } from "./Features";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Navbar } from "./Navbar";
import { Newsletter } from "./NewsLetter";
import { ScrollToTop } from "./ScrollToTop";
import { Services } from "./Services";
import { Sponsors } from "./Sponsors";
import { Team } from "./Team";
import { Testimonials } from "./Testimonials";
import { Bulletin } from "./Bulletin";
const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Bulletin />
      <Sponsors />
      <About />
      <HowItWorks />
      <Features />
      <Services />
      <Cta />
      <Testimonials />
      <Team />
      <Newsletter />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default LandingPage
