import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Officer Sarah Johnson",
    userName: "@sjohnson_pd",
    comment: "This platform has revolutionized how we communicate crime alerts to our community.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Detective Mike Chen",
    userName: "@det_chen",
    comment: "The real-time crime reporting feature has helped us respond faster to incidents in our neighborhood.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Community Leader Tom Patel",
    userName: "@tpatel_comm",
    comment: "As a neighborhood watch coordinator, this tool has become invaluable for keeping our residents informed and safe.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Maria Rodriguez",
    userName: "@mrodriguez",
    comment: "The crime alerts have helped me make informed decisions about my family's safety. Excellent service!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Sgt. James Wilson",
    userName: "@sgt_wilson",
    comment: "The data analytics have improved our patrol strategies significantly.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lisa Chang",
    userName: "@changL",
    comment: "Being informed about local incidents has made our business district safer for everyone.",
  },
];

export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        Discover Why
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          People Love{" "}
        </span>
        This Landing Page
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non unde error
        facere hic reiciendis illo
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage
                    alt=""
                    src={image}
                  />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};