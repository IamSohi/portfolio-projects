
'use client'
import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Sidebar from '@/app/components/Sidebar';
import { Room } from "@/app/Room";
import { CollaborativeEditor } from "@/app/components/CollaborativeEditor";
import Header from "@/app/components/Header";
import Suggestions from './Suggestions';
import Button from '@mui/joy/Button';
import { set } from 'zod';
import { LiveObject } from '@liveblocks/client'; // Liveblocks integration
import { ClientSideSuspense } from "@liveblocks/react";
import { Loading } from "@/app/components/Loading";
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css';
import local from 'next/font/local';
import { useClient } from "@liveblocks/react/suspense";

type SuggestionsType = {
  suggestions: string[];
};
interface DocumentsObj {
  [docId: string]: Document;
}
interface Document{
  name: string;
  content: any;
  timestamp: number;
}

export default function Dashboard() {
    const editorRef = useRef();   // Add a ref to hold the editor instance
    const [editorInstance, setEditorInstance] = useState(null);
    const [suggestionsLiveObject] = useState(new LiveObject<SuggestionsType>({ suggestions: [] }));
    const [isSaved, setIsSaved] = useState(false); 
    const [documents, setDocuments] = React.useState<DocumentsObj>({});
    const [roomId, setRoomId] = React.useState<string>("liveblocks:examples:collab-room-id");
  // const roomId = useExampleRoomId("liveblocks:examples:test-yjs-tiptap");
  const client = useClient();

    const setEditorRef = (instance: any) => {
        if (instance) {
            setEditorInstance(instance);
        }
    };
    React.useEffect(() => {
      const { room, leave } = client.enterRoom(roomId, {
        initialPresence: { cursor: { x: 0, y: 0 }, role: "user" },
        initialStorage: {   suggestions: new LiveObject({
          suggestions: [],
        }),
      },
      });
      room.connect();
      console.log(room)
    
      return () => {
        console.log("leaving room", room.id)
        leave()};
    }, [roomId, client]);
  
    const handleSave = () => {
      try{

      
      if (editorInstance) {
        const content = (editorInstance as any).getJSON();
        console.log(content)
        const hasContent = content.content.some((block: any) => block.content.some((text: any) => text.text.trim() !== ""));
  
        if (hasContent) {
          const docId = window.location.hash.replace('#', ''); 

          if (docId) {
          // Get existing document data
          const localDocuments = JSON.parse(localStorage.getItem('documents') || '{}'); 
          const existingDoc = localDocuments[docId]; 

          console.log("content......")
          console.log(content)
          // Update only the content and timestamp
          setDocuments({ ...documents, [docId]: { ...documents[docId], content, timestamp: Date.now() }});
          localStorage.setItem('documents', JSON.stringify({ ...localDocuments, [docId]: { ...existingDoc, content, timestamp: Date.now() }})); 
            // localStorage.setItem(docId, JSON.stringify({ content, timestamp: Date.now() })); 
            setIsSaved(true);
          //   const documents = JSON.parse(localStorage.getItem('documents') || '[]');
          // localStorage.setItem('documents', JSON.stringify([...documents, { content }]));
          toast.success('Document saved!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        } else {
          toast.info('Cannot save an empty document.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
        }
      }}
      catch(e){
        toast.info('Cannot save an empty document.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      }
    };

    // React.useEffect(() => {
    //     console.log("Dashboard useEffect triggered");
    //     console.log(editorInstance);

    //     if (editorInstance) {
    //         console.log("Editor instance:", editorInstance);
    //     }
    // }, [editorInstance]);
    // useEffect(() => {
    //     console.log("Dash")

    //     console.log(editorRef)
    //     console.log(editorRef.current)

    //     if (editorRef.current){
    //         console.log(editorRef.current)
    //     }

    // }, [editorRef.current]);
    return(
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
       <CssVarsProvider disableTransitionOnChange>
         <CssBaseline />
         <Sidebar editorInstance={editorInstance} isSaved={isSaved} setIsSaved={setIsSaved} setRoomId={setRoomId}
         documents={documents} setDocuments={setDocuments}/> 
        <Header/>
        </CssVarsProvider>
        <Box
        sx={{
          pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100dvh',
          gap: 1,
          overflow: 'auto',
          padding: 2,
        }}
      >

      <Room roomId={roomId}>
                      <CollaborativeEditor editorInstance={setEditorRef}/>
      
                   <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    flex: 1, 
                }}
                >
                 <Suggestions editor={editorInstance}
                               liveObject={suggestionsLiveObject}
                />
                <Button key='lg' size='lg'
              sx={{
                flex: { xs: 'none', md: 1 },
                marginLeft: { xs: 0, md: 2 },
                marginTop: { xs: 2, md: 0 },
                width: { xs: '100%', md: 'auto' }
              }}
              onClick={handleSave} // Attach the save handler
            >
             Save
           </Button>     
           </Box>   
           </Room>    


      </Box>
      <ToastContainer />

      </Box>
    )
  }


  //     <Room>
  //       <CollaborativeEditor editorInstance={setEditorRef}/>

  //         <Box sx={{ display: 'flex', minHeight: '100vh' }}>
  //       <CssVarsProvider disableTransitionOnChange>
  //         <CssBaseline />

  //        <Sidebar />
  //        <Header/>
  //   </CssVarsProvider>

  //       <Box
  //       sx={{
  //         pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
  //         pb: { xs: 2, sm: 2, md: 3 },
  //         flex: 1, 
  //         display: 'flex',
  //         flexDirection: 'column',
  //         minWidth: 0,
  //         height: '100dvh',
  //         gap: 1,
  //         overflow: 'auto',
  //         padding: 2,
  //       }}
  //     >
  // <ClientSideSuspense fallback={<Loading />}>
  //                    <CollaborativeEditor editorInstance={setEditorRef}/>
  //                    </ClientSideSuspense>
  //                <Box
  //               sx={{
  //                   display: 'flex',
  //                   flexDirection: { xs: 'column', md: 'row' },
  //                   flex: 1, 
  //               }}
  //               >
  //                <Suggestions editor={editorInstance}
  //                              liveObject={suggestionsLiveObject}
  //               />
  //               <Button key='lg' size='lg'
  //                       sx={{ flex: { xs: 'none', md: 1 }, 
  //                       marginLeft: { xs: 0, md: 2 }, 
  //                       marginTop: {xs: 2, md: 0}, 
  //                       width: { xs: '100%', md: 'auto' } }}
  //               >
  //            Save
  //          </Button>     
  //          </Box>       
  //          </Box>


  //       </Box>
  //       {/* </CssVarsProvider> */}

  //     </Room>

  //   )
  // }
//   return (
//     <CssVarsProvider disableTransitionOnChange>
//         <Room>

//       <CssBaseline />
//       <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//         {/* <Box
//           component="nav"
//           sx={{
//             width: { xs: 'var(--Sidebar-width)', md: 'var(--Sidebar-width)' },
//             flexShrink: 0,
//             backgroundColor: 'background.paper',
//           }}
//         >
//           <Sidebar />
//         </Box> */}
//         <Sidebar />
//         <Header/>
        

//         <Box
//         sx={{
//         pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
//         pb: { xs: 2, sm: 2, md: 3 },
//         flex: 1, 
//         display: 'flex',
//             flexDirection: 'column',
//             minWidth: 0,
//             height: '100dvh',
//             gap: 1,
//             overflow: 'auto',
//             padding: 2,

//         // width: '100%',
//         //   position: 'sticky',
//         //   top: { sm: -100, md: -110 },
//         //   bgcolor: 'background.body',
//         //   zIndex: 9995,
//         }}
//       >
// <ClientSideSuspense fallback={<Loading />}>
//                     <CollaborativeEditor editorInstance={setEditorRef}/>
//                     </ClientSideSuspense>
//                 <Box
//                 sx={{
//                     // pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
//                     // pb: { xs: 2, sm: 2, md: 3 },
//                     display: 'flex',
//                     flexDirection: { xs: 'column', md: 'row' },
//                     flex: 1, 
//                     // padding: 2,


//                 }}
//                 >

                
//                 <Suggestions editor={editorInstance}
//                               liveObject={suggestionsLiveObject}
//                 />
//                 <Button key='lg' size='lg'
//                         sx={{ flex: { xs: 'none', md: 1 }, 
//                         marginLeft: { xs: 0, md: 2 }, 
//                         marginTop: {xs: 2, md: 0}, 
//                         width: { xs: '100%', md: 'auto' } }}
 
//                 // sx={{flex: 1, marginLeft: {xs: 0, md: 2}, marginTop: {xs: 2, md: 0}}}
//                 >
//             Save
//           </Button>     
//           </Box>       
//           </Box>
//         </Box>
//         </Room>
            
//     </CssVarsProvider>
//   );
// }