import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const Cta = () => {
  return (
    <section id="cta" className="bg-muted/50 py-16 my-24 sm:my-32">
      <div className="container space-y-12">
        <div className="lg:grid lg:grid-cols-2 place-items-center">
          <div className="lg:col-start-1">
            <h2 className="text-3xl md:text-4xl font-bold">
              Making Communities
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                {" "}Safer Together{" "}
              </span>
            </h2>
            <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
              Join our platform to strengthen community safety. Whether you're a citizen or law enforcement officer, we have tools to help you contribute.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>For Citizens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Submit anonymous tips and reports securely. Help keep your community safe.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="default">
                <Link to='/report' className="w-full">
                  Submit Anonymous Report
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="p-6 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>For Law Enforcement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Access your secure dashboard to manage cases and resources.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                <Link to='/officer-login' className="w-full">
                  Officer Login
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};