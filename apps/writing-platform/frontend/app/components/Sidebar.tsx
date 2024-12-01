// Sidebar.tsx is a component that displays the sidebar of the application. It contains a list of documents that the user can select from. The user can also add new documents, delete existing documents, and switch between personal and collab documents. The sidebar also displays the user's profile information and provides an option to sign out.
'use client';
import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// UI Components
import { 
  Sheet, Box, Typography, List, ListItem, 
  ListItemButton, Avatar, Divider, IconButton, GlobalStyles 
} from '@mui/joy';

import Image from 'next/image';

// Icons
import { 
  GroupRounded, 
  KeyboardArrowDown, 
  Delete, 
  AddCircleOutline 
} from '@mui/icons-material';

// Custom Components
import ColorSchemeToggle from './ColorSchemeToggle';
import SignOut from './Signout';

import { closeSidebar } from '../utils';

// Constants
const MAX_DOCUMENTS = 5;

// Types
interface Document {
  name: string;
  content: any;
  timestamp: number;
}

interface SidebarProps {
  editorInstance: any;
  isSaved: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
  documentId: string;
  documents: Record<string, Document>;
  selectedDocId: string | null;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDocId: React.Dispatch<React.SetStateAction<string>>;
  setDocuments: React.Dispatch<React.SetStateAction<Record<string, Document>>>;
}

export default function Sidebar({
  editorInstance,
  isSaved,
  setIsSaved,
  documentId,
  documents,
  selectedDocId,
  setRoomId,
  setSelectedDocId,
  setDocuments
}: SidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Memoized document list
  const documentList = useMemo(() => 
    Object.entries(documents || {}).map(([docId, doc]) => ({
      id: docId,
      ...doc
    })), 
    [documents]
  );

  // Document Management Functions
  const initializeDocument = useCallback(() => {
    const newDocId = crypto.randomUUID();
    const randomInt = Math.floor(Math.random() * 10000);
    return {
      [newDocId]: {
        name: `Doc${randomInt}`,
        content: { type: "doc", content: [] },
        roomId: `liveblocks:examples:personal-doc-${newDocId}`,
        timestamp: Date.now()
      }
    };
  },[]);
  

  const handleAddDocument = useCallback(() => {
    if (!isSaved) {
      toast.info('Save your current document before adding a new one.', {
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

    if (documentList.length < MAX_DOCUMENTS) {
      const newDocument = initializeDocument();
      setSelectedDocId(Object.keys(newDocument)[0]);
      setDocuments(prev => ({ ...prev, ...newDocument }));
      setIsSaved(false);
    } else {
      toast.warning(`Maximum ${MAX_DOCUMENTS} documents allowed`);
    }
  }, [isSaved, documentList.length, initializeDocument, setSelectedDocId, setDocuments, setIsSaved]);

  const handleDeleteDocument = useCallback((docId: string) => {
    setDocuments(prevDocuments => {
      const updatedDocuments = { ...prevDocuments };
      delete updatedDocuments[docId];

      if (Object.keys(updatedDocuments).length === 0) {
        return initializeDocument();
      }
      
      return updatedDocuments;
    });
    setSelectedDocId(Object.keys(documents)[0]);
  }, [documents, initializeDocument, setDocuments, setSelectedDocId]);

  // const handleDocClick = (docId: string) => {
  //   setSelectedDocId(docId);
  //   const newRoomId = docId === "collabDoc"
  //     ? "liveblocks:examples:collab-room-id"
  //     : `liveblocks:examples:personal-doc-${docId}`;
  //   setRoomId(newRoomId);
  //   router.push(`/#${docId}`);
  // }

  const handleDocClick = useCallback((docId: string) => {
    setSelectedDocId(docId);
  }, [setSelectedDocId]);

  
  return (
    <Sheet 
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        onClick={() => closeSidebar()}
      />
      {/* Header Section */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Image 
            src="/logo.png" 
            alt="Logo" 
            width={50} 
            height={54} 
            className="mb-2"
          />
        <Typography level="title-lg">Collab AI</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>

      {/* Documents Section */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List
          size="sm"
          sx={{
            gap: 1,
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >
          {/* Collab Documents Section */}
          <ListItemButton
            selected={selectedDocId === "collabDoc"}
            onClick={() => handleDocClick("collabDoc")}
          >
            <GroupRounded />
            <Typography level="body-sm">Collab Document</Typography>
          </ListItemButton>

          {/* Personal Documents Section */}
          <ListItem nested>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Personal Documents
            </Typography>
            <List>
              {documentList.map(doc => (
                <ListItem key={doc.id}>
                  <ListItemButton
                    selected={selectedDocId === doc.id}
                    onClick={() => handleDocClick(doc.id)}
                  >
                    <Typography level="body-sm">{doc.name}</Typography>
                    <IconButton
                      size="sm"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      sx={{ ml: 'auto' }}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}

              {documentList.length < MAX_DOCUMENTS && (
                <ListItemButton onClick={handleAddDocument}>
                  <AddCircleOutline />
                  <Typography level="body-sm">Add Document</Typography>
                </ListItemButton>
              )}
            </List>
          </ListItem>
        </List>
      </Box>

      {/* User Profile Section */}
      <Divider />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Avatar 
          variant="outlined"
          size="sm"
          src={`/${session?.user.accessToken.name.split(" ")[0]}.jpeg`}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">
            {session?.user.accessToken.name}
          </Typography>
          <Typography level="body-xs">
            {session?.user.accessToken.email}
          </Typography>
        </Box>
        <SignOut />
      </Box>
    </Sheet>
  );
}