"use client";

import { ReactNode, useMemo } from "react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { useSearchParams } from "next/navigation";
import { ClientSideSuspense } from "@liveblocks/react";
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
  const roommId = useExampleRoomId("liveblocks:examples:test-yjs-tiptap");
  // const [myPresence, updateMyPresence] = useMyPresence();
  // const others = useOthers();

  console.log("roomID................")
  console.log(roomId)
  console.log(roommId)
  // console.log(others.length);
  // Check if this is the first user in the room
  // const isFirstUser = useMemo(() => {
  //   return myPresence.connectionId === 1;
  // }, [myPresence.connectionId]);

  // // Update presence with the "admin" role if it's the first user
  // if (isFirstUser && myPresence.role !== "admin") {
  //   updateMyPresence({ role: "admin" });
  // }

  

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: { x: 0, y: 0 },
        role: "user",
      }}
      initialStorage={initialStorage}
    >
      {/* <ClientSideSuspense fallback={<Loading />}>{children}</ClientSideSuspense> */}
      {children}
    </RoomProvider>
  );
}

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function useExampleRoomId(roomId: string) {
  const params = useSearchParams();
  const exampleId = params?.get("exampleId");

  const exampleRoomId = useMemo(() => {
    return exampleId ? `${roomId}-${exampleId}` : roomId;
  }, [roomId, exampleId]);

  return exampleRoomId;
}