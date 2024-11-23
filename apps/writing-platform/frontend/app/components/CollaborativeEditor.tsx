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
    console.log(room.fetchYDoc("c86d5f42-b90d-456c-b8c7-f9acf2c351e8"));
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

const syncStatus = useSyncStatus();
console.log("syncStatus............")
console.log(syncStatus)
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
  // useEffect(()=>{
  //     console.log(isAdmin && myPresence.role !== "admin")
  //     console.log(!isAdmin && myPresence.role === "admin")
  //     console.log(isAdmin && myPresence.role === "admin")
  //     console.log(isAdmin)
    
  //   },[editorInstance])

  // console.log("isAdmin..... ", isAdmin)
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
    </div>
  );
}
