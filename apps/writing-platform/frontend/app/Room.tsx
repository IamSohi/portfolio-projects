"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { useSearchParams } from "next/navigation";
import { ClientSideSuspense } from "@liveblocks/react";
import React from 'react';

import { Loading } from "@/app/components/Loading";
import { LiveObject } from "@liveblocks/client";
import { CollaborativeEditor } from "./components/CollaborativeEditor2";

const initialStorage = {
  suggestionData: new LiveObject({
    text: '',
    correctedText: '',
    suggestions: [],
  }),
};
export function Room({ children, roomId, selectedDocId }: { children: ReactNode, roomId: string, selectedDocId: string }) {
  // const roommId = useExampleRoomId("liveblocks:examples:test-yjs-tiptap");
  // const [myPresence, updateMyPresence] = useMyPresence();
  // const others = useOthers();
  // const [roommmId, setRoommId] = useState<string>("liveblocks:examples:collab-room-id");
  console.log("roomID................")
  console.log(roomId)
  // const [forceRender, setForceRender] = useState(0); // Dummy state to force re-render

  // console.log(roommId)
  // console.log(others.length);
  // Check if this is the first user in the room
  // const isFirstUser = useMemo(() => {
  //   return myPresence.connectionId === 1;
  // }, [myPresence.connectionId]);

  // // Update presence with the "admin" role if it's the first user
  // if (isFirstUser && myPresence.role !== "admin") {
  //   updateMyPresence({ role: "admin" });
  // }
  // useEffect(() => {
  //   updateRoomId();
  // }, [selectedDocId]);

  const [currentRoomId, setCurrentRoomId] = useState<string>("liveblocks:examples:collab-room-id");
  
  const switchRoom = () => {

    setCurrentRoomId(prevId => 
      prevId === "liveblocks:examples:collab-room-id"
        ? "liveblocks:examples:nextjs-yjs-tiptap"
        : "liveblocks:examples:collab-room-id"
    );
  };

  // const updateRoomId = () => {
  //   console.log("in update")
  //   const newRoomId = roommmId === "liveblocks:examples:collab-room-id"
  //     ? "liveblocks:examples:nextjs-yjs-tiptap"
  //     : "liveblocks:examples:collab-room-id";
  //   setRoommId(newRoomId);

  // };
  // const switchRoom = () => {
    // console.log("roomId......")
    // console.log(roommmId)
    // if (roommmId === "liveblocks:examples:collab-room-id") {
    //   setRoommId("liveblocks:examples:nextjs-yjs-tiptap");
    // } else {
    //   setRoommId("liveblocks:examples:collab-room-id");
    // }
    // updateRoomId();
    // setForceRender((prev) => prev + 1); // Trigger force re-render

  // }

  // const switchRoom = () => {
  //   setRoommId(prevId => 
  //     prevId === "liveblocks:examples:collab-room-id"
  //       ? "liveblocks:examples:nextjs-yjs-tiptap"
  //       : "liveblocks:examples:collab-room-id"
  //   );
  // };




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

  return (
    <div className="flex flex-col gap-4">
      <button 
        onClick={switchRoom}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Switch Room ({currentRoomId})
      </button>
      
      {/* Key on roomId forces complete remount of RoomProvider and children */}
      <RoomProvider
        key={currentRoomId}
        id={currentRoomId}
        initialPresence={{
          cursor: { x: 0, y: 0 },
          role: "user",
        }}
        initialStorage={initialStorage}
      >
        <ClientSideSuspense fallback={<div>Loading...</div>}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );

}