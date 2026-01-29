import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 ">
     <h2 className="font-bold text-2xl text-primary mb-2">Loading...</h2>
    </div>
  );
}
