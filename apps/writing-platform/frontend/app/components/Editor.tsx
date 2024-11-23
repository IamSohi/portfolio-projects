// import { useState, useEffect, useRef } from 'react';
// import { useEditor, EditorContent } from '@tiptap/react'
// import StarterKit from '@tiptap/starter-kit'
// import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
// import * as Y from 'yjs'
// import { WebsocketProvider } from 'y-websocket'
// import { useSession } from "next-auth/react";
// import styles from './Editor.module.css' // Import CSS Module

// // ... other imports (if needed)

// interface Props {
//     documentId: string | null;
//     value?: string;
//     onChange: (content: string) => void;

// }


// export default function EditorComponent({ documentId, value = '', onChange }: Props): JSX.Element {
//     const [provider, setProvider] = useState<WebsocketProvider | null>(null);
//     const { data: session } = useSession();
//     const editorRef = useRef<any | null>(null);  // Ref to hold the editor instance
//     const userId = session?.user?.accessToken?.id;


//     useEffect(() => {
//         const ydoc = new Y.Doc();
//         const newProvider = new WebsocketProvider(
//             // process.env.NEXT_PUBLIC_WS_SERVER_URL!,
//             "ws://localhost:1234",
//             `document-${documentId}`,
//             ydoc
//         )

//         // Initialize editor with the provider
//         editorRef.current = createEditor(newProvider); // Call createEditor

//         setProvider(newProvider);




//         return () => {
//             if (newProvider) {
//                 newProvider.destroy();
//             }
//             if (editorRef.current) {
//                 editorRef.current.destroy();
//             }
//         };

//     }, [documentId]);



//   // Separate function to create the editor instance
//   const createEditor = (provider: WebsocketProvider) => {

//       return useEditor({  // Now useEditor is called inside createEditor.
//           content: value,

//           onUpdate: ({ editor }) => {

//             onChange(editor.getHTML());


//           },
//           extensions: [
//               StarterKit,
//               Collaboration.configure({
//                 // document: provider?.doc.get('content'),

//                   document: provider?.doc as Y.Doc,
//                   field: 'content',
//               }),

//               CollaborationCursor.configure({
//                   provider: provider,
//                   user: {
//                       id: userId,
//                       name: session?.user?.accessToken.name || "Guest",
//                   }

//               })


//           ],
//       })
//   }

//     if (!editorRef.current) {
//       return <></>;
//     }

//     return (
//         <div className={styles.editorContainer}>
//             <EditorContent editor={editorRef.current} className={styles.editorContent} />

//         </div>


//     )
// }


// client.js (with Tiptap integration)
// "use client"
// import { Editor } from '@tiptap/core';
// import React, { useEffect } from 'react';
// import { StarterKit } from '@tiptap/starter-kit';
// import Document from '@tiptap/extension-document'
// import Paragraph from '@tiptap/extension-paragraph'
// import Text from '@tiptap/extension-text'
// import { EditorContent, useEditor } from '@tiptap/react'
// import { TiptapCollabProvider } from '@hocuspocus/provider'

// import { Collaboration } from '@tiptap/extension-collaboration';
// import { WebsocketProvider } from 'y-websocket';
// import * as Y from 'yjs';
// const ydoc = new Y.Doc()

// const EditorComponent: React.FC = () => {
//     // useEffect(() => {
//     //   const provider = new WebsocketProvider('ws://localhost:1234', 'your-room-name', ydoc);
  
//     //   const editor = new Editor({
//     //     extensions: [
//     //       StarterKit,
//     //       Collaboration.configure({
//     //         document: ydoc,
//     //       }),
//     //     ],
//     //     content: '<p>Hello World!</p>',
//     //   });
//       const editor = useEditor({
//         extensions: [
//           Document,
//           Paragraph,
//           Text,
//           Collaboration.configure({
//             document: ydoc // Configure Y.Doc for collaboration
//           })
//         ],
//         content: '<p>Hello World!</p>'
//       })
    
  
//     //   const editorElement = document.getElementById('editor');
//     //   console.log("editorElement", editorElement)
//     //   if (editorElement) {
//     //     editorElement.appendChild(editor.view.dom);
//     //   }
  
//       // Handle cleanup
//     //   window.addEventListener('beforeunload', () => {
//     //     provider.destroy();
//     //   });
  
//       // Cleanup function for useEffect
//     //   return () => {
//     //     provider.destroy();
//     //     editor.destroy();
//     //   };
//     // }, []);

//     // useEffect(() => {
//     //     const provider = new TiptapCollabProvider({
//     //         baseUrl: 'ws://localhost:1234',
//     //       name: 'document.name', // Unique document identifier for syncing. This is your document name.
//     //     //   appId: '7j9y6m10', // Your Cloud Dashboard AppID or `baseURL` for on-premises
//     //       token: 'notoken', // Your JWT token
//     //       document: ydoc,
//     //     })
//     //   }, [])
//     useEffect(() => {
//         const provider = new WebsocketProvider('ws://localhost:1234', 'document.name', ydoc);
    
//         // Handle cleanup
//         window.addEventListener('beforeunload', () => {
//           provider.destroy();
//         });
    
//         // Cleanup function for useEffect
//         return () => {
//           provider.destroy();
//           editor?.destroy();
//         };
//       }, [editor]);
    
//     //   <div id="editor"></div>
//     return <EditorContent editor={editor} />;
//   };
  
//   export default EditorComponent;

