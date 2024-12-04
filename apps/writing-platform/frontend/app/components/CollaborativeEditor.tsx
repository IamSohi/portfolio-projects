// CollaborativeEditor.tsx is a component that displays a collaborative text editor with simple rich text, live cursors, and live avatars. It uses the Tiptap editor with the Collaboration and CollaborationCursor extensions to enable real-time collaboration. The component integrates with Liveblocks to provide real-time synchronization of the editor content and user cursors. The editor also includes a toolbar for formatting text and a character count to track the number of characters and words in the document. The component listens for updates to the editor content and sends the changes to the Liveblocks room for synchronization with other users.
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useRoom, useSelf, useMyPresence, useOthers } from '@liveblocks/react';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import * as Y from 'yjs';

// TipTap Extensions
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import CharacterCount from '@tiptap/extension-character-count';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Editor } from '@tiptap/core';

// Components
import { Toolbar } from './Toolbar';
import { Avatars } from './Avatars';

// Styles
import styles from './CollaborativeEditor.module.css';

// Types
interface EditorProps {
  editorInstance?: (instance: Editor) => void;
}

const CHARACTER_LIMIT = 500;

export function CollaborativeEditor({ editorInstance }: EditorProps) {
  // Liveblocks Setup
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);


  useEffect(() => {
    // if (doc) doc.destroy();
    // if (provider) provider.destroy();

    // Create new instances
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    
    setDoc(yDoc);
    setProvider(yProvider);


      return () => {
        // setDoc(null);
        // setProvider(null);

        yDoc.destroy();
        yProvider.destroy();
  
      };
  
  }, [room.id]);



  // if (!doc || !provider) return null;
  if (!doc || !provider) {
    return <div>Initializing editor...</div>;
  }

  return <TiptapEditor key={room.id} doc={doc} provider={provider} editorInstance={editorInstance} />;
}

interface TiptapEditorProps {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  editorInstance?: (instance: Editor) => void;
}

function TiptapEditor({ doc, provider, editorInstance }: TiptapEditorProps) {
  // Hooks
  const userInfo = useSelf(me => me.info);
  const self = useSelf(me => me);
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const room = useRoom();
  const isAdmin = useMemo(() => {
    if (others.length === 0) return true;
    return others.every(other => self && self.connectionId < other.connectionId);
  }, [self, others]);

  // Update user role based on admin status
  useEffect(() => {
    if (isAdmin && myPresence.role !== "admin") {
      updateMyPresence({ role: "admin" });
    } else if (!isAdmin && myPresence.role === "admin") {
      updateMyPresence({ role: "user" });
    }
  }, [isAdmin, myPresence.role, updateMyPresence]);

  // Editor Setup
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      CharacterCount.configure({
        limit: CHARACTER_LIMIT,
      }),
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: userInfo || undefined,
      }),
    ],
  },[room.id, doc, provider]);


  // useEffect(() => {
  //   return () => {
  //     editor?.destroy();
  //   };
  // }, [editor]);

  // Initial cursor position
  // useEffect(() => {
  //   if (!editor) return;

  //   const timer = setTimeout(() => {
  //     editor.commands.focus('end');
  //     editor.commands.selectTextblockEnd();
  //   }, 0);

  //   return () => clearTimeout(timer);
  // }, [editor]);

  // Update parent component's editor reference
  useEffect(() => {
    if (editor && editorInstance) {
      editorInstance(editor);
    }
  }, [editor, editorInstance, doc, room]);

  // Character count calculations
  const characterCount = editor?.storage.characterCount.characters() ?? 0;
  const percentage = Math.round((100 / CHARACTER_LIMIT) * characterCount);
  const isAtLimit = characterCount === CHARACTER_LIMIT;

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        <Avatars />
      </div>

      <EditorContent key={`editor-${room.id}`} editor={editor} className={styles.editorContainer} />

      <div className={`${styles['character-count']} ${isAtLimit ? styles['character-count--warning'] : ''}`}>
        <CharacterCounter
          current={characterCount}
          limit={CHARACTER_LIMIT}
          percentage={percentage}
          wordCount={editor?.storage.characterCount.words() ?? 0}
        />
      </div>
    </div>
  );
}

interface CharacterCounterProps {
  current: number;
  limit: number;
  percentage: number;
  wordCount: number;
}

function CharacterCounter({ current, limit, percentage, wordCount }: CharacterCounterProps) {
  return (
    <>
      <svg
        className={current === limit ? styles['character-count__svg'] : ''}
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
        {current} / {limit} characters
        <br />
        {wordCount} words
      </div>
    </>
  );
}