'use client';
import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import BrightnessAutoRoundedIcon from '@mui/icons-material/BrightnessAutoRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { LiveObject } from "@liveblocks/client";

import ColorSchemeToggle from './ColorSchemeToggle';
import { closeSidebar } from '../utils';

const MAX_DOCUMENTS = 5;

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: 'grid',
            transition: '0.2s ease',
            '& > *': {
              overflow: 'hidden',
            },
          },
          open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
        ]}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

interface DocumentsObj {
  [docId: string]: Document;
}
interface Document{
  name: string;
  content: any;
  timestamp: number;
}
interface Props{
  editorInstance: any;
  isSaved: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
  documents: DocumentsObj;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentsObj>>;
}

export default function Sidebar({ editorInstance, isSaved, setIsSaved, documents, setDocuments, setRoomId }: Props): JSX.Element {
  const router = useRouter();
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>("collabDoc");
    
  // Load documents from local storage
  React.useEffect(() => {
    const storedDocuments = localStorage.getItem('documents');
    if (storedDocuments) {
      const parsedDocuments = JSON.parse(storedDocuments);
      if(Object.keys(parsedDocuments).length === 0) {
          setIsSaved(false);
          const newDocument = initializeDocuments(); 
          // setSelectedDocId(Object.keys(newDocument)[0]);
          setDocuments(newDocument)
      }else{
          setDocuments(parsedDocuments);
          const docId = window.location.hash.replace('#', ''); 
          if(docId) {
            setSelectedDocId(docId);
          }
      }
    }  
  }, []);

  // Initialize blank document
  const initializeDocuments = () => {
    const newDocId = crypto.randomUUID(); 
    const randomInt = Math.floor(Math.random() * 10000);
    const newDocName = `Doc${randomInt}`;  
    return {[newDocId]: { name: newDocName, content: {"type": "doc", "content": []}, timestamp: Date.now() }};
  }

  //Set content of editor when document is selected
  React.useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
    const docId = selectedDocId? selectedDocId : Object.keys(documents)[0]; 
    if (editorInstance && documents[docId] && selectedDocId !== "collabDoc") {
      editorInstance.commands.setContent(documents[docId].content);
    }
  }, [documents]);
  
  
  React.useEffect(() => {
    if (selectedDocId) {
      // Update the URL with the selected document's ID
      router.push(`/#${selectedDocId}`);
    }
    // let leaveRoomRef: any;
    if(selectedDocId === "collabDoc") {
    //   if(leaveRoomRef) leaveRoomRef();
    //   const { room, leave } = client.enterRoom("liveblocks:examples:collab-room-id", {
    //     initialPresence: { cursor: { x: 0, y: 0 }, role: "user" },
    //     initialStorage: {   suggestions: new LiveObject({
    //       suggestions: [],
    //     }),
    //   },
    //   });
    //   console.log(room)
    //   console.log("switched the room id to")
    //   leaveRoomRef = leave;
      setRoomId("liveblocks:examples:collab-room-id")
    }else{
      const newRoomId = "liveblocks:examples:"+selectedDocId;
      setRoomId(newRoomId)
    

    //   if(leaveRoomRef) leaveRoomRef();
    //   const { room, leave } = client.enterRoom(`liveblocks:examples:${selectedDocId}`, {
    //     initialPresence: { cursor: { x: 0, y: 0 }, role: "user" },
    //     initialStorage: {   suggestions: new LiveObject({
    //       suggestions: [],
    //     }),
    //   },
    //   });
    //   console.log(room)
    //   console.log("switched the room id to")

    //   leaveRoomRef = leave;
    //   // setRoomId(selectedDocId || "liveblocks:examples:personalDoc".concat('-',crypto.randomUUID()))
    }

    // return() => { 
    //   leaveRoomRef();
    // }
  }, [selectedDocId, router]);

  const handleAddDocument = () => {
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


    if (editorInstance) {
      setIsSaved(false);

        // Clear the editor
        editorInstance.commands.clearContent(); 

        if (documents && Object.keys(documents).length < MAX_DOCUMENTS) {
          const newDocument = initializeDocuments();
          setSelectedDocId(Object.keys(newDocument)[0]);
          setDocuments({...documents, ...newDocument});
        }
        // Add new document (you might need to adjust this based on your actual logic)
        // const newDocName = `Doc ${Object.keys(documents).length + 1}`;
        // setDocuments([...documents, { name: newDocName }]);
      
    }
  };



  const handleDeleteDocument = (docId: string) => {
    setDocuments((prevDocuments) => {
      if (prevDocuments) {
        const updatedDocuments = { ...prevDocuments };
        delete updatedDocuments[docId];
        if(Object.keys(updatedDocuments).length === 0) {
          const newDocument = initializeDocuments();
          // router.push(`/#${Object.keys(newDocument)[0]}`); 

          return newDocument;
        }else{
          // router.push(`/#${Object.keys(updatedDocuments)[0]}`); 
          console.log(updatedDocuments)
          return updatedDocuments;
        }
        
      }
      return prevDocuments;
    });
    setSelectedDocId(Object.keys(documents)[0]);
  };
  
  const handleDocClick = (docId: string) => {
    // Update the URL with the selected document's ID
    setSelectedDocId(docId);
    // Update the editor content
    if(docId === "collabDoc") return;
    console.log(documents[docId].content)
    if (editorInstance) {
      editorInstance.commands.setContent(documents[docId].content);
    }
  };


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
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton variant="soft" color="primary" size="sm">
          <BrightnessAutoRoundedIcon />
        </IconButton>
        <Typography level="title-lg">Collab AI</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          mt: 'auto',
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 2,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 2,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem nested>
            <Toggler
              defaultExpanded
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <GroupRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Collab Documents</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                
              <ListItem key={1} sx={{ mt: 0.5 }}>
                      <ListItemButton
                        selected={selectedDocId === "collabDoc"} // Highlight selected document
                        onClick={() => handleDocClick("collabDoc")} // Add onClick handler
                        sx={{
                          // Add background color to selected document
                          ...(selectedDocId === "collabDoc" && {
                            backgroundColor: 'neutral.softBg',
                          }),
                        }}
                          >
                        Collab Doc 1
                      </ListItemButton>
                    </ListItem>

              </List>
            </Toggler>
          </ListItem>
          <ListItem nested>
            <Toggler
              defaultExpanded
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <GroupRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Personal Documents</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                
                {
                documents && Object.keys(documents).length > 0 &&
                  Object.keys(documents).map((docId: string, index) => {
                    console.log("Dcuments....")
                    console.log(documents)
                    console.log(docId)
                    console.log( selectedDocId === docId)
                    return(
                    <ListItem key={docId} sx={{ mt: 0.5 }}>
                      <ListItemButton
                        selected={selectedDocId === docId} // Highlight selected document
                        onClick={() => handleDocClick(docId)} // Add onClick handler
                        sx={{
                          // Add background color to selected document
                          ...(selectedDocId === docId && {
                            backgroundColor: 'neutral.softBg',
                          }),
                        }}
                          >
                        {documents[docId].name}
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent click event from propagating to parent
                            handleDeleteDocument(docId);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemButton>
                    </ListItem>
                  )})
                }
                
                {documents && Object.keys(documents).length > 0 && Object.keys(documents).length < MAX_DOCUMENTS && (
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton onClick={handleAddDocument}>
                      <AddCircleOutlineIcon />
                      <Typography level="body-sm">Add Document</Typography>
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </Toggler>
          </ListItem>
        </List>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Avatar
          variant="outlined"
          size="sm"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">Siriwat K.</Typography>
          <Typography level="body-xs">siriwatk@test.com</Typography>
        </Box>
        <IconButton size="sm" variant="plain" color="neutral">
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}