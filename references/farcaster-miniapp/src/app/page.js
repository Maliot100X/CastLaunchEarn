import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {

  Zap,
  Smartphone as Mobile,
  Settings,
  CuboidIcon,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-7xl w-full mx-auto">
        <Card className="rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col ">
            <div className="p-10 flex-1 flex flex-col justify-center">
              <CardHeader className="flex items-center gap-2 mb-6 p-0">
                <CuboidIcon className="text-primary" />
                <span className="font-bold text-xl">Farcaster</span>
              </CardHeader>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                This is a template for{" "}
                <span className="text-primary">Farcaster Mini App</span> using
                Next.js
              </h1>
              <p className="text-lg mb-8 text-muted-foreground">
                A beautiful, responsive template to kickstart your Farcaster
                Mini App development. Built with modern web technologies and
                designed for seamless integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href={"/miniapp"}>Launch</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    target="_blank"
                    href="https://miniapps.farcaster.xyz/docs/getting-started"
                  >
                    View Docs
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 ">
              <Card className="hover:shadow-lg bg-secondary transition-shadow">
                <CardContent className="p-6 flex flex-col items-start">
                  <Zap className="text-primary mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">Fast Integration</h3>
                  <p className="text-muted-foreground">
                    Quickly connect with Farcaster's ecosystem using our
                    pre-built components.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg bg-secondary  transition-shadow">
                <CardContent className="p-6 flex flex-col items-start">
                  <Mobile className="text-primary mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">Responsive Design</h3>
                  <p className="text-muted-foreground">
                    Looks great on all devices, from mobile to desktop.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg bg-secondary transition-shadow">
                <CardContent className="p-6 flex flex-col items-start">
                  <Settings className="text-primary mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">Easy Customization</h3>
                  <p className="text-muted-foreground">
                    Modify colors, fonts and layouts with simple TailwindCSS
                    classes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
