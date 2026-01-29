"use client";

import { createContext, useContext, useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import NoMiniApp from "@/components/NoMiniApp";

const FarcasterContext = createContext(null);

export const useMiniApp = () => useContext(FarcasterContext);

export function MiniAppProvider({ children }) {
  const [userInfo, setState] = useState({
    context: null,
    user: null,
    error: null,
  });

  useEffect(() => {
    const readySDK = async () => {
      try {
        const sdkCont = await sdk.context;
        const res = await sdk.quickAuth.fetch(
          `https://${process.env.NEXT_PUBLIC_HOSTNAME}/api/auth/me`
        );
        if (res.ok) {
          const user = await res.json();
          setState({
            context: sdkCont,
            user: user,
          });
          await sdk.actions.ready();
          await sdk.back.enableWebNavigation();
          console.log("sdk ready");
        }
      } catch (error) {
        console.log("Failed to initialize Farcaster SDK:", error);
        setState({
          error: true,
        });
      }
    };

    readySDK();
  }, []);

  if (userInfo.error) {
    return <NoMiniApp />;
  }

  if (!userInfo.user) {
    return null;
  }

  return (
    <FarcasterContext.Provider value={userInfo}>
      {children}
    </FarcasterContext.Provider>
  );
}
