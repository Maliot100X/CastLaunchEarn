"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMiniApp } from "@/Providers/MiniAppContext";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { User, Wallet, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import sdk from "@farcaster/miniapp-sdk";

export default function MiniApp() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { context, user } = useMiniApp();

  const viewProfile = async () => {
    try {
      await sdk.actions.viewProfile({
        fid: user.fid,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const addMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="flex flex-col items-center gap-2">
          <User className="text-primary" size={40} />
          <h2 className="font-bold text-2xl text-primary mb-1">
            Farcaster Mini App
          </h2>
          <Badge variant="outline" className="text-xs">
            Showcase
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">FID:</span>
              <span className="font-mono font-semibold">{user.fid}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-semibold">@{context.user.username}</span>
            </div>
          </div>

          <Button variant={"outline"} onClick={viewProfile}>
            View Profile
          </Button>
          <Button variant={"outline"} onClick={addMiniApp}>
            Add MiniApp
          </Button>
          <div className="w-full flex flex-col items-center gap-3 mt-4">
            {!isConnected ? (
              <Button
                className="w-full flex items-center gap-2"
                onClick={() => connect({ connector: connectors[0] })}
              >
                <LogIn className="w-4 h-4" />
                Connect Wallet
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                  onClick={() => disconnect()}
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </Button>
                <div className="flex items-center gap-2 mt-2">
                  <Wallet className="text-primary" size={18} />
                  <span className="font-mono text-sm">
                    {address.substring(0, 6)}...
                    {address.substring(address.length - 4)}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
