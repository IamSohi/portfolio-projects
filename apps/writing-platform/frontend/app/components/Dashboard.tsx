
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
import { LiveObject } from '@liveblocks/client'; // Liveblocks integration
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css';
import { useClient } from "@liveblocks/react/suspense";
import { useRouter } from 'next/navigation';
import { ClientSideSuspense } from "@liveblocks/react";
import { Loading } from "@/app/components/Loading";

type SuggestionDataType = {
  text: string;
  correctedText: string;
  suggestions: string[];
};

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

export default function Dashboard({documentId}:{documentId:string}) {
    const [editorInstance, setEditorInstance] = useState(null);
    const [suggestionsLiveObject] = useState(new LiveObject<SuggestionDataType>({ text: '', correctedText: '', suggestions: [] }));
    const [isSaved, setIsSaved] = useState(false); 
    const [documents, setDocuments] = React.useState<DocumentsObj>({});
    const [roomId, setRoomId] = React.useState<string>("liveblocks:examples:collab-room-id");
    const client = useClient();
    const [selectedDocId, setSelectedDocId] = React.useState<string | null>("collabDoc");
    const router = useRouter();


    React.useEffect(() => {
      if (selectedDocId) {
        if(selectedDocId === "collabDoc") {
          setRoomId("liveblocks:examples:collab-room-id")
        }else{
          const newRoomId = `liveblocks:examples:personal-doc-${selectedDocId}`;
          setRoomId(newRoomId)
        }
        router.push(`/#${selectedDocId}`);
      }
    }, [selectedDocId, router]);


    const setEditorRef = (instance: any) => {
        if (instance) {
            setEditorInstance(instance);
        }
    };
      
    const handleSave = () => {
      try{
      if (editorInstance) {
        const content = (editorInstance as any).getJSON();
        const hasContent = content.content.some((block: any) => block.content.some((text: any) => text.text.trim() !== ""));
        if (hasContent) {
          const docId = window.location.hash.replace('#', ''); 
          if (docId) {
          // Update only the content and timestamp
          setDocuments({ ...documents, [docId]: { ...documents[docId], content, timestamp: Date.now() }});
            setIsSaved(true);
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
    return(
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
       <CssVarsProvider disableTransitionOnChange>
         <CssBaseline />
         <Sidebar editorInstance={editorInstance} isSaved={isSaved} setIsSaved={setIsSaved} documentId ={documentId} setRoomId={setRoomId}
         documents={documents}
         selectedDocId={selectedDocId}
         setSelectedDocId={setSelectedDocId}
         setDocuments={setDocuments}/> 
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

      <Room key={roomId} roomId={roomId}>
      {/* <ClientSideSuspense fallback={<Loading />}> */}

                      <CollaborativeEditor editorInstance={setEditorRef}/>
       {/* </ClientSideSuspense> */}
                   <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column'},
                    flex: 1, 
                }}
                >
                 <Suggestions editor={editorInstance}
                               liveObject={suggestionsLiveObject}
                />
                <Button key='lg' size='lg'
              sx={{
                flex: { xs: 'none' },
                marginLeft: { xs: 0 },
                marginTop: { xs: 2},
                width: { xs: '100%' }
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
