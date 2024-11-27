"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { useEffect, useState, useMemo } from "react";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "@/app/components/Avatars";
import { useMyPresence, useOthers } from "@liveblocks/react";
import { useSyncStatus } from "@liveblocks/react";

import CharacterCount from '@tiptap/extension-character-count'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'



interface Props {
  editorInstance?: (instance: any) => void;

}
// Collaborative text editor with simple rich text, live cursors, and live avatars
export function CollaborativeEditor({editorInstance}:Props) {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<any>();

  // Set up Liveblocks Yjs provider
  useEffect(() => {
    console.log("room from collaborative editor")

    console.log(room)
    console.log("yDoc.........")
    const yDoc = new Y.Doc();
    console.log(yDoc)

    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);
    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
    
  }, [room]);

  if (!doc || !provider) {
    console.log("returning null")

    return null;
  }

  return <TiptapEditor doc={doc} provider={provider} editorInstance={editorInstance} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  editorInstance?: (instance: any) => void;
};

function TiptapEditor({ doc, provider, editorInstance }: EditorProps) {
  // Get user info from Liveblocks authentication endpoint
  const userInfo = useSelf((me) => me.info);
  const room = useRoom();
  const self = useSelf((me) => me);
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const limit = 500;
const syncStatus = useSyncStatus();
  console.log("provider.............");
  console.log(provider)
  console.log("doc")
  console.log(JSON.stringify(doc))
  console.log("self.............");
  console.log(self)
  console.log("myPresence.............");
  console.log(myPresence)
  console.log("others............");
  const allPresenceObjects = others.map((other) => other.presence);
  console.log(allPresenceObjects)

  

  const isAdmin = useMemo(() => {
    if (others.length === 0) {
      return true;
    }
    return others.every((other) => self.connectionId < other.connectionId);
  }, [self.connectionId, others]);
      useEffect(() => {
    // Update the user's role based on the isAdmin status
    if (isAdmin && myPresence.role !== "admin") {
      updateMyPresence({ role: "admin" });
    } else if (!isAdmin && myPresence.role === "admin") {
      updateMyPresence({ role: "user" }); // Remove admin role if no longer admin
    }
  }, [isAdmin, myPresence.role]); // Re-run if isAdmin or myPresence.role changes

  // Set up editor with plugins, and place user info into Yjs awareness and cursors
  const editor = useEditor({
    editorProps: {
      attributes: {
        // Add styles to editor element
        class: styles.editor,
      },
    },
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      CharacterCount.configure({
        limit,
      }),
      StarterKit.configure({
        // The Collaboration extension comes with its own history handling
        history: false,
        
      }),
      // Register the document with Tiptap
      Collaboration.configure({
        document: doc,
      }),
      // Attach provider and user info
      CollaborationCursor.configure({
        provider: provider,
        user: userInfo,
      }),

    ],


  });

  // useEffect(() => {
  //   if (editor) {
  //     setTimeout(() => { 
  //       editor.commands.setTextSelection({
  //         from: editor.state.doc.content.size,

  //         to: editor.state.doc.content.size,
  //       });
  //     }, 0); 

  //     console.log("cursor position")
  //     console.log(editor.state.doc.content.size)
  //   }
  // }, [editor]);

  // useEffect(() => {
  //   if (editor && !editor.isDestroyed) {
  //     // Wait a short moment to ensure content is fully loaded
  //     setTimeout(() => {
  //       // Get the total document length
  //       const documentLength = editor.state.doc.content.size;
  

  //       console.log("documentLength")
  //       console.log(documentLength)
  //       // Set the cursor at the end of the document
  //       editor.commands.setTextSelection({
  //         from: documentLength,
  //         to: documentLength
  //       });
  
  //       // Focus the editor (optional, but often desired)
  //       editor.commands.focus();
  //     }, 0);
  //   }
  // }, [editor]);
  useEffect(() => {
    if (editor) {
      // Wait for a brief moment to ensure the editor is fully initialized
      const timer = setTimeout(() => {
        // Move cursor to the end of the document
        editor.commands.focus('end');
        editor.commands.selectTextblockEnd()
        console.log("cursor position")
        console.log(editor.state.selection)
        console.log(editor.state.selection.head)
        let {from, to} = editor.state.selection;
		editor.commands.setTextSelection({from, to});
    console.log(from,to)

      }, 0);

      return () => clearTimeout(timer);
    }
  }, [editor]);

  

  const percentage = editor
  ? Math.round((100 / limit) * editor.storage.characterCount.characters())
  : 0;

  const isWarning = editor?.storage.characterCount.characters() === limit;



  useEffect(() => {

    if (editorInstance){
        editorInstance(editor);
    }


}, [editor, editorInstance, doc, room]);


  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        <Avatars />
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
      <div className={`${styles['character-count']} ${isWarning ? styles['character-count--warning'] : ''}`}>
      <svg
        className={isWarning ? styles['character-count__svg'] : ''}
        height="20"
        width="20"
        viewBox="0 0 20 20"
      >
        <circle r="10" cx="10" cy="10" fill="#e9ecef" />
        <circle
          r="5"
          cx="10"
          cy="10"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
          transform="rotate(-90) translate(-20)"
        />
        <circle r="6" cx="10" cy="10" fill="white" />
      </svg>

      <div>
        {editor?.storage.characterCount.characters()} / {limit} characters
        <br />
        {editor?.storage.characterCount.words()} words
      </div>
    </div>

    </div>
  );
}
