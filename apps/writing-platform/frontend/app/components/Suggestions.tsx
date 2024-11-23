'use client';

import { useState, useEffect,useRef, useCallback } from 'react';
import { debounce } from 'lodash'; // Install lodash for debouncing
import { LiveObject } from '@liveblocks/client'; // Liveblocks integration
import styles from "./Suggestions.module.css";
import { useRoom } from "@liveblocks/react";
import { useSession } from 'next-auth/react'; // For protected routes

interface Suggestion {
  type: 'grammar' | 'style' | 'word-choice';
  message: string;
  start: number; // Character position where the suggestion applies
  end: number; // Character position where the suggestion ends
}

interface Props {
  editor: any; // Your Tiptap editor instance
  liveObject: LiveObject<any>; // Liveblocks object for real-time syncing
}

export default function Suggestions({ editor, liveObject }: Props): JSX.Element {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [text, setText] = useState<string>('');
  const room = useRoom();
  const { data: session, status } = useSession();
  const accessToken = session?.user.accessToken  // Or await getAccessToken()
  const unsubscribeRef = useRef<() => void>(); // Declare unsubscribeRef here

  console.log("room from suggestions")
  console.log(room.getSelf())

  useEffect(() => {
    console.log("suggestions updates")},[suggestions])
  useEffect(() => {
    if (!room) return;

    console.log("object initialized liveObject");

  const initializeStorage = async () => {
    console.log("object initialization");
    const { root } = await room.getStorage();

    // "suggestions" LiveObject is already created in the RoomProvider
    // so no need to create it again here.
    const suggestionsLiveObject = root.get("suggestions");

    // Listen for updates on the "suggestions" LiveObject
    const unsubscribe = room.subscribe(
      suggestionsLiveObject, // Subscribe directly to the LiveObject
      () => {
        console.log("object updated");
        const updatedSuggestions =
          suggestionsLiveObject.toImmutable()?.suggestions || [];
        setSuggestions(updatedSuggestions);
      },
    );

    return unsubscribe;
  };

  initializeStorage().then((unsubscribe) => {
    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribeRef.current?.();
    };
  });



    // console.log("object initialized liveObject")
    // const initializeStorage = async () => {
    //   console.log("object initializatio")
    //   const { root } = await room.getStorage();

    //   // Check if "suggestions" LiveObject exists, or create it
    //   let suggestionsLiveObject = root.get("suggestions");
    //   if (!suggestionsLiveObject) {

    //     console.log("object not initialized")
    //     suggestionsLiveObject = new LiveObject({ suggestions: [] });
    //     root.set("suggestions", suggestionsLiveObject);
    //   }

    //   // Listen for updates on the "suggestions" LiveObject
    //   const unsubscribe = room.subscribe(root, () => {
    //     console.log("object updated")
    //     const updatedSuggestions = suggestionsLiveObject.toImmutable()?.suggestions || [];
    //     setSuggestions(updatedSuggestions);
    //   });

    //   return unsubscribe;
    // };

    // const runInitializeStorage = async () => {
    //   const unsubscribe = await initializeStorage();
    //   return unsubscribe;
    // };

    // const unsubscribeStoragePromise = runInitializeStorage();

    // return () => {
    //   unsubscribeStoragePromise.then((unsubscribe) => unsubscribe?.());
    // };

    // const unsubscribeStorage = initializeStorage();

    // return  () => {
    //   // const { root } = await room.getStorage();
    //   // console.log("object destroyed")
    //   // let suggestionsLiveObject = new LiveObject({ suggestions: [] });
    //   // root.set("suggestions", suggestionsLiveObject);

    //   unsubscribeStorage?.then((unsubscribe) => unsubscribe?.());
    // };
  }, [room, editor]);

  // **Function to find the current sentence based on the cursor position**
  const getCurrentSentence = (fullText: string, cursorPos: number): string => {
    const beforeCursor = fullText.slice(0, cursorPos);
    const afterCursor = fullText.slice(cursorPos);

    const start = beforeCursor.lastIndexOf('.') + 1 || 0; // Start of the sentence
    const end = afterCursor.indexOf('.') + cursorPos + 1 || fullText.length; // End of the sentence

    return fullText.slice(start, end).trim();
  };

  // **API Call with Debounced Execution**
  const fetchSuggestions = useCallback(
    debounce(async (sentence: string) => {
      if (!sentence) return; // Avoid API call for empty input

      try {
        const res = await fetch('/api/document/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sentence }),
        });
        // const data = await res.json();
        const data = [
          {
            "type": "grammar",
            "start": 9,
            "end": 12,
            "message": "Consider using 'were' instead of 'was'."
          },
          {
            "type": "word-choice",
            "start": 24,
            "end": 33,
            "message": "Replace 'very good' with 'excellent'."
          }
        ]
        
        ;

        const { root } = await room.getStorage();
        const suggestionsLiveObject = root.get("suggestions");
        
        // Update LiveObject with new suggestions
        suggestionsLiveObject?.set("suggestions", data as Suggestion[]);
        
        console.log("setting suggestions")
        setSuggestions(data as Suggestion[]); // Update local state
        // liveObject.set('suggestions', data as Suggestion[]); // Broadcast suggestions to collaborators
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 500), // Delay of 500ms
    [liveObject]
  );

  // **Editor Listener for Text Updates**
  useEffect(() => {
    if (!editor) return;

    const updateListener = (arg:any) => {
      // console.log("arg", arg)
      console.log("in update listener")
      const userInfo = room.getSelf();
      console.log(userInfo)
      console.log(userInfo?.presence.role)

      const currentText = editor.getText();
      const cursorPos = editor.state.selection.head; // Current cursor position
      const currentSentence = getCurrentSentence(currentText, cursorPos);

      setText(currentSentence); // Update full text in state
      if(userInfo?.presence.role !== "admin"){
        console.log("I am not admin")
        return;
      }
      console.log("I am admin")  

      fetchSuggestions(currentSentence); // Fetch suggestions for the current sentence
    };

  
    editor.on('update', updateListener);

    return () => {
      editor.off('update', updateListener);
    };
  }, [editor, fetchSuggestions]);

  // **Subscribe to Liveblocks for Real-Time Suggestions**
  // useEffect(() => {
  //   const unsubscribe = (liveObject as any).subscribe('suggestions', (updatedSuggestions: Suggestion[]) => {
  //     setSuggestions(updatedSuggestions || []); // Sync suggestions with other collaborators
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [liveObject]);

  // **Color-Coded Rendering of Suggestions**
  const renderHighlightedText = () => {
    let highlightedText = text;
    let offset = 0; // Track the added length to adjust indices
  
    suggestions.forEach(({ type, start, end }) => {
      const suggestionClass = `highlight-${type}`;
      const before = highlightedText.slice(0, start + offset);
      const highlighted = `<span class="${styles[suggestionClass]}">${highlightedText.slice(start + offset, end + offset)}</span>`;
      const after = highlightedText.slice(end + offset);  
      
      highlightedText = before + highlighted + after;

      // Adjust the offset by the added length of the HTML tags
      offset += highlighted.length - (end - start);
    });
  
    return { __html: highlightedText };
  };  

  return (
    <div className="suggestions-container"
    style={{
      border: '1px solid #ccc',
      borderRadius: '12px',
      flex: '8',
      // wordWrap: 'break-word', 
      overflowWrap: 'break-word', 
      overflow: 'hidden',
    }}

    >
      {/* Full Text with Highlights */}
      <div
        className="editor-text"
        dangerouslySetInnerHTML={renderHighlightedText()} // Render highlighted text
      />
      {/* Suggestions List */}
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item suggestion-${suggestion.type}`}
          >
            {suggestion.message}
          </div>
        ))}
      </div>
    </div>
  );
}
