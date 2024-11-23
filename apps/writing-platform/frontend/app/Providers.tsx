"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { LiveblocksProvider } from "@liveblocks/react";
import type { PropsWithChildren } from "react";

export const Providers = ({ children }: PropsWithChildren) => {
    
    return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        {/* {children} */}
      <SessionProvider>{children}</SessionProvider>
    </LiveblocksProvider>
    )
};

