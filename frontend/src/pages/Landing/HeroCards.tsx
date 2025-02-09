import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check, Linkedin } from "lucide-react";
import { LightBulbIcon } from "./Icons";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Feature Card */}
      <Card className="absolute w-[340px] -top-[15px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-[#FF9933]/20 p-1 rounded-2xl">
            <LightBulbIcon />
          </div>
          <div>
            <CardTitle>Digital Case Management</CardTitle>
            <CardDescription className="text-md mt-2">
              Streamlined digital filing system for efficient case tracking and management
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Card */}
      <Card className="absolute right-[20px] top-4 w-80 drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="text-center text-[#000080]">Performance Metrics</CardTitle>
          <CardContent className="space-y-2">
            <div className="text-center">
              <span className="text-2xl font-bold text-[#138808]">45%</span>
              <p>Faster Response Time</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-[#FF9933]">60%</span>
              <p>Paperwork Reduction</p>
            </div>
          </CardContent>
        </CardHeader>
      </Card>

      {/* Features List */}
      <Card className="absolute top-[150px] left-[50px] w-72 drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "Real-time Communication",
              "Digital Evidence Collection",
              "GPS Tracking",
              "Analytics Dashboard"
            ].map((feature) => (
              <div key={feature} className="flex items-center">
                <Check className="text-[#138808] mr-2" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Card */}
      <Card className="absolute w-[350px] -right-[10px] bottom-[35px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="text-[#000080]">Government Integration</CardTitle>
          <CardDescription>
            Seamlessly connected with national and state-level law enforcement databases
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};