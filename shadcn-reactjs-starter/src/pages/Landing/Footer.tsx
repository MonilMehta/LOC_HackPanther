import { LogoIcon } from "./Icons";

export const Footer = () => {
  return (
    <footer id="footer">
      <hr className="w-11/12 mx-auto" />

      <section className="container py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full xl:col-span-2">
          <a
            rel="noreferrer noopener"
            href="/"
            className="font-bold text-xl flex"
          >
            <LogoIcon />
            CrimeWatch Alert
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Resources</h3>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Crime Statistics</a>
          </div>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Safety Tips</a>
          </div>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Emergency Contacts</a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Services</h3>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Alert System</a>
          </div>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Report Crime</a>
          </div>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Crime Maps</a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Support</h3>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Help Center</a>
          </div>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Contact Us</a>
          </div>
          <div>
            <a href="#" className="opacity-60 hover:opacity-100">Privacy Policy</a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Follow Us</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Github
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Twitter
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      <section className="container pb-14 text-center">
        <h3>
          &copy; 2024 Landing page made by{" "}
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://www.linkedin.com/in/your-profile/"
            className="text-primary transition-all border-primary hover:border-b-2"
          >
            Your Name
          </a>
        </h3>
      </section>
    </footer>
  );
};