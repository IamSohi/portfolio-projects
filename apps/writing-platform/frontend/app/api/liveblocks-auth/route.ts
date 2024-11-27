// import { Liveblocks } from "@liveblocks/node";
// import { NextRequest, NextResponse } from "next/server";
// import { getSession } from "next-auth/react";
// import { auth } from "../../../auth";
 

// const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

// const liveblocks = new Liveblocks({
//   secret: API_KEY!,
// });

// export async function POST(request: NextRequest) {
    
//   // Get the current user's info from your database
// //   const user = {
// //     id: "charlielayne@example.com",
// //     info: {
// //       name: "Charlie Layne",
// //       color: "#D583F0",
// //       picture: "https://liveblocks.io/avatars/avatar-1.png",
// //     },
// //   };
// //   const session = await getSession({ req: request });
//   const session = await auth()
 
//   if (!session?.user) return null

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // Get the current user's info from the session
//   const user = {
//     id: session.user.accessToken.email,
//     info: {
//       name: session.user.accessToken.name,
//       color: "#D583F0",
//       picture: session.user.accessToken.image,
//     },
//   };


//   // Create a session for the current user
//   // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
//   const liveblocksSession = liveblocks.prepareSession(user.id, {
//     userInfo: user.info,
//   });

//   // Give the user access to the room
//   const { room } = await request.json();
//   liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);

//   // Authorize the user and return the result
//   const { body, status } = await liveblocksSession.authorize();
//   return new Response(body, { status });
// //   return NextResponse.json({ success: true });

// }
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
// import { getSession } from "next-auth/react";
import { auth } from "../../../auth";

/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // Get the current user's unique id from your database
  console.log("in post")

  const session = await auth()
console.log("session", session)

  const accessToken = session?.user.accessToken  // Or await getAccessToken()
    // const session = await auth()
    // console.log("session", session)
 
  if (!session?.user) return null

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the current user's info from the session
  const user = {
    id: session.user.accessToken.email,
    info: {
      name: session.user.accessToken.name,
      color: "#D583F0",
      picture: session.user.accessToken.image,
    },
  };
  console.log("user", user)


  

  // Create a session for the current user
  // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
  const liveblocksSession = liveblocks.prepareSession(`user-${session.user.accessToken.id}`, {
    userInfo: user.info,
    // myPresence: {
    //   role: 'admin',
    // },
  });
  // const userId = Math.floor(Math.random() * 10) % USER_INFO.length;
  // const liveblocksSession = liveblocks.prepareSession(`user-${userId}`, {
  //   userInfo: USER_INFO[userId],
  // });

  console.log("liveblocksSession..", liveblocksSession)

  // Use a naming pattern to allow access to rooms with a wildcard
  liveblocksSession.allow(`liveblocks:examples:*`, liveblocksSession.FULL_ACCESS);

  // Authorize the user and return the result
  const { body, status } = await liveblocksSession.authorize();
  return new Response(body, { status });
}

const USER_INFO = [
  {
    name: "Charlie Layne",
    color: "#D583F0",
    picture: "https://liveblocks.io/avatars/avatar-1.png",
  },
  {
    name: "Mislav Abha",
    color: "#F08385",
    picture: "https://liveblocks.io/avatars/avatar-2.png",
  },
  {
    name: "Tatum Paolo",
    color: "#F0D885",
    picture: "https://liveblocks.io/avatars/avatar-3.png",
  },
  {
    name: "Anjali Wanda",
    color: "#85EED6",
    picture: "https://liveblocks.io/avatars/avatar-4.png",
  },
  {
    name: "Jody Hekla",
    color: "#85BBF0",
    picture: "https://liveblocks.io/avatars/avatar-5.png",
  },
  {
    name: "Emil Joyce",
    color: "#8594F0",
    picture: "https://liveblocks.io/avatars/avatar-6.png",
  },
  {
    name: "Jory Quispe",
    color: "#85DBF0",
    picture: "https://liveblocks.io/avatars/avatar-7.png",
  },
  {
    name: "Quinn Elton",
    color: "#87EE85",
    picture: "https://liveblocks.io/avatars/avatar-8.png",
  },
];
