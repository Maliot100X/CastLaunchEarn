"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="flex flex-col items-center gap-2">
          <Ghost className="text-primary" size={48} />
          <h2 className="font-bold text-2xl text-primary mb-2">
            Page Not Found
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-center text-muted-foreground mb-6">
            Sorry, we couldn’t find the page you’re looking for.
            <br />
            It might have been moved or deleted.
          </p>
          <Button asChild>
            <Link href={"/"}>Go Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
