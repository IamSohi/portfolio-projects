"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import React from 'react';

import { Loading } from "@/app/components/Loading";
import { LiveObject } from "@liveblocks/client";

const initialStorage = {
  suggestionData: new LiveObject({
    text: '',
    correctedText: '',
    suggestions: [],
  }),
};
export function Room({ children, roomId }: { children: ReactNode, roomId: string }) {

  return (
    <React.Fragment key={roomId}>

    <RoomProvider
    key={roomId}
      id={roomId}
      initialPresence={{
        cursor: { x: 0, y: 0 },
        role: "user",
      }}
      initialStorage={initialStorage}
    >        
    <ClientSideSuspense fallback={<Loading/>}>
    {() => children}
  </ClientSideSuspense>

    </RoomProvider>
    </React.Fragment>
  );
}