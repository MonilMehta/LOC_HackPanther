import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is the Digital Transformation of Police Work Culture?",
    answer: "It is a project aimed at modernizing police work with advanced technology to improve efficiency, transparency, and public trust.",
    value: "item-1",
  },
  {
    question: "How does the Case Management System work?",
    answer:
      "The system enables police officers to digitally file, track, and manage cases with real-time access to evidence and updates.",
    value: "item-2",
  },
  {
    question: "What are the benefits of Real-Time Communication?",
    answer:
      "Real-time communication tools allow officers to share critical information, updates, and alerts securely and instantly.",
    value: "item-3",
  },
  {
    question: "How is digital evidence managed?",
    answer: "Officers can securely upload and manage digital evidence including photos, videos, and documents.",
    value: "item-4",
  },
  {
    question: "How does Geolocation Services help?",
    answer:
      "Geolocation services use GPS functionality to help officers navigate to crime scenes or track incidents and resources in real time.",
    value: "item-5",
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};