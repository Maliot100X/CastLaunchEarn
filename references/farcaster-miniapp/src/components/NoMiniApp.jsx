import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { AlertTriangle } from "lucide-react";

export default function NoMiniApp() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="flex flex-col items-center gap-2">
          <AlertTriangle className="text-destructive" size={48} />
          <h2 className="font-bold text-2xl text-destructive mb-2">
            Not in Farcaster Mini App
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-center text-muted-foreground mb-6">
            It looks like you’re not using this app inside the Farcaster Mini
            App environment.
            <br />
            Please open this page from within the Farcaster app to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
