"use client";

import { SessionProvider } from "next-auth/react";
import { LiveblocksProvider } from "@liveblocks/react";
import type { PropsWithChildren } from "react";

export const Providers = ({ children }: PropsWithChildren) => {
    
    return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <SessionProvider>{children}</SessionProvider>
    </LiveblocksProvider>
    )
};

