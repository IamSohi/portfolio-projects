//Dasboard.tsx is the main component that renders the entire application. It contains the Sidebar, Header, CollaborativeEditor, and Suggestions components. The Dashboard component is responsible for managing the state of the application, such as the editor instance, suggestions, and documents. It also handles saving the document and displaying toast notifications.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useClient } from "@liveblocks/react/suspense";
// import { LiveObject } from '@liveblocks/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import { Box, Button, CssVarsProvider, CssBaseline } from '@mui/joy';
import { Room } from "@/app/Room";
import Sidebar from '@/app/components/Sidebar';
import Header from "@/app/components/Header";
import { CollaborativeEditor } from "@/app/components/CollaborativeEditor";
import Suggestions from './Suggestions';
import {ErrorBoundary} from '@/app/components/ErrorBoundary';

import { Editor } from '@tiptap/core';

// Types
interface Document {
  name: string;
  content: any;
  timestamp: number;
}

interface DocumentsState {
  [key: string]: Document;
}


// interface Suggestion {
//   type: 'grammar' | 'style' | 'word-choice';
//   message: string;
// }


// interface SuggestionData {
//   text: string;
//   correctedText: string;
//   suggestions: string[];
// }

// type SuggestionDataType = {
//   text: string;
//   correctedText: string;
//   suggestions: string[];
// };

export default function Dashboard() {
  // export default function Dashboard({ documentId }: { documentId: string }) {
  // State Management
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [documents, setDocuments] = useState<DocumentsState>({});
  const [selectedDocId, setSelectedDocId] = useState<string>("collabDoc");
  const [roomId, setRoomId] = useState<string>("liveblocks:examples:collab-room-id");

  // Refs & Hooks
  // const client = useClient();
  const router = useRouter();
  // const suggestionsLiveObject = useMemo(() => 
  //   new LiveObject<SuggestionDataType>({ 
  //     text: '', 
  //     correctedText: '', 
  //     suggestions: [],
  //   }), 
  //   []
  // );

  // Effects
  useEffect(() => {
    loadDocumentsFromStorage();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      updateRoomId();
      updateUrlHash();
    }
  }, [selectedDocId]);

  useEffect(() => {
    console.log(documents)
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  // Document Management Functions
  const loadDocumentsFromStorage = () => {
    try {
      const storedDocuments = localStorage.getItem('documents');
      if (storedDocuments) {
        const parsedDocuments = JSON.parse(storedDocuments);
        if (Object.keys(parsedDocuments).length === 0) {
          initializeNewDocument();
        } else {
          setDocuments(parsedDocuments);
          const docId = window.location.hash.replace('#', '');
          if (docId) setSelectedDocId(docId);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const initializeNewDocument = () => {
    const newDocId = crypto.randomUUID();
    const randomInt = Math.floor(Math.random() * 10000);
    const newDocument = {
      [newDocId]: {
        name: `Doc${randomInt}`,
        content: { type: "doc", content: [] },
        roomId: `liveblocks:examples:personal-doc-${newDocId}`,
        timestamp: Date.now()
      }
    };
    setDocuments(newDocument);
    setIsSaved(false);
  };

  const updateRoomId = () => {
    const newRoomId = selectedDocId === "collabDoc"
      ? "liveblocks:examples:collab-room-id"
      : `liveblocks:examples:personal-doc-${selectedDocId}`;
    setRoomId(newRoomId);
  };

  const updateUrlHash = () => {
    router.push(`/#${selectedDocId}`);
  };

  // Editor Functions
  const handleEditorRef = (instance: Editor) => {
    if (instance) setEditorInstance(instance);
  };

  const handleSave = async () => {
    if (!editorInstance) return;

    try {
      const content = (editorInstance as Editor).getJSON();
      console.log(content);

      const hasContent = content.content?.some((block: any) => block.content.some((text: any) => text.text.trim() !== ""));


      if (!hasContent) {
        toast.info('Cannot save an empty document.',{
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
        return;
      }

      const docId = window.location.hash.replace('#', '');
      if (docId) {
        setDocuments(prev => ({
          ...prev,
          [docId]: {
            ...prev[docId],
            content,
            timestamp: Date.now()
          }
        }));
        setIsSaved(true);
        toast.success('Document saved!',{
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
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document. Cannot save an empty document',{
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

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssVarsProvider disableTransitionOnChange>
          <CssBaseline />
          <Sidebar
            isSaved={isSaved}
            setIsSaved={setIsSaved}
            documents={documents}
            selectedDocId={selectedDocId}
            setSelectedDocId={setSelectedDocId}
            setDocuments={setDocuments}
          />
          <Header />
        </CssVarsProvider>

        <Box
          key={selectedDocId}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100dvh',
            gap: 1,
            overflow: 'auto',
            padding: 2,
            pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
            pb: { xs: 2, sm: 2, md: 3 }
          }}
        >

          <Room key={selectedDocId} roomId={roomId}>
            <CollaborativeEditor editorInstance={handleEditorRef} />
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column' },
              flex: 1,
            }}>
              <Suggestions
                editor={editorInstance}
                // liveObject={suggestionsLiveObject}
              />
              {selectedDocId !== "collabDoc" && <Button
                size="lg"
                key="lg"
                onClick={handleSave}
                sx={{
                  width: '100%',
                  mt: 2
                }}
              >
                Save
              </Button>}
            </Box>
          </Room>
        </Box>
        <ToastContainer />
      </Box>
    </ErrorBoundary>
  );
}