'use client';

import { useState, useEffect,useRef, useCallback } from 'react';
import { debounce, first } from 'lodash'; // Install lodash for debouncing
import { LiveObject } from '@liveblocks/client'; // Liveblocks integration
import styles from "./Suggestions.module.css";
import { useRoom } from "@liveblocks/react";
// import { useSession } from 'next-auth/react'; // For protected routes
import { useSession } from 'next-auth/react'; // For protected routes
import { Box, Card, Typography, Button, Alert } from '@mui/joy';

interface Suggestion {
  type: 'grammar' | 'style' | 'word-choice';
  message: string;
  // start: number; // Character position where the suggestion applies
  // end: number; // Character position where the suggestion ends
}

interface CorrectionData {
  text: string;
  correctedText: string;
  suggestions: Suggestion[];
}

interface Props {
  editor: any; // Your Tiptap editor instance
  liveObject: LiveObject<any>; // Liveblocks object for real-time syncing
}

const getSuggestionColor = (type: string): { color: string; bg: string } => {
  switch (type) {
    case 'word-choice':
      return { color: 'primary', bg: 'bg-blue-50' };
    case 'style':
      return { color: 'warning', bg: 'bg-amber-50' };
    case 'grammar':
      return { color: 'danger', bg: 'bg-red-50' };
    default:
      return { color: 'neutral', bg: 'bg-gray-50' };
  }
};



export default function Suggestions({ editor, liveObject }: Props): JSX.Element {
  // const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [text, setText] = useState<string>('');
  const [data, setData] = useState<CorrectionData>()
  const room = useRoom();
  const [isFirstRender, setIsFirstRender] = useState(true);

  // const { data: session, status } = useSession();
  // const accessToken = session?.user.accessToken  // Or await getAccessToken()
  const unsubscribeRef = useRef<() => void>(); // Declare unsubscribeRef here
  const { data: session, status } = useSession();
  const accessToken = session?.user.accessToken  // Or await getAccessToken()
  console.log("Session .....")
  console.log(session)
  useEffect(() => {
    if (!room) return;

  const initializeStorage = async () => {
    const { root } = await room.getStorage();
    const suggestionsLiveObject = root.get("suggestionData");

    // Listen for updates on the "suggestions" LiveObject
    const unsubscribe = room.subscribe(
      suggestionsLiveObject, // Subscribe directly to the LiveObject
      () => {
        console.log("object updated");
        const updatedSuggestions =
          suggestionsLiveObject.toImmutable() || {};
        setData(updatedSuggestions);
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

  }, [room, editor]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, [text]);


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
        console.log("hitting suggestions api");
        console.log(sentence)
        console.log(accessToken); 

        const res = await fetch('http://127.0.0.1:3000/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',Authorization: `${accessToken.accessToken}` },
          body: JSON.stringify({ text: sentence }),
        });
        const data = await res.json() || {
          text: sentence,
          correctedText: "The quick brown fox jumped over the lazy dog.",
          suggestions:[
          {
            "type": "grammar",
            "message": "Consider using 'were' instead of 'was'."
          },
          {
            "type": "word-choice",
            "message": "Replace 'very good' with 'excellent'."
          }
        ]};
        
        console.log("data........", data)

        const parsedData = data.suggestionData;
        console.log("data........", data)
        if(parsedData.text === undefined){
          parsedData.text = sentence;
        }
        console.log("parsedData........", parsedData)

        const { root } = await room.getStorage();
        const suggestionsLiveObject = root.get("suggestionData");
        
        // Update LiveObject with new suggestions
        // suggestionsLiveObject?.set("suggestionData", data as CorrectionData);
        // suggestionsLiveObject?.set("suggestionData", data as CorrectionData);
        suggestionsLiveObject?.set("text", parsedData.text);
        suggestionsLiveObject?.set("correctedText", parsedData.correctedText);
        suggestionsLiveObject?.set("suggestions", parsedData.suggestions as Suggestion[]);
  
        // setSuggestions(parsedData as Suggestion[]); // Update local state
        setData(parsedData as CorrectionData); // Update local state
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 1000), // Delay of 500ms
    [liveObject]
  );

  // **Editor Listener for Text Updates**
  useEffect(() => {
    if (!editor) return;

    const updateListener = (arg:any) => {
      const userInfo = room.getSelf();

      const currentText = editor.getText();
      const cursorPos = editor.state.selection.head; // Current cursor position
      console.log("currentText")
      console.log(currentText)
      console.log("cursorPos")
      console.log(editor.state.selection)
      const currentSentence = getCurrentSentence(currentText, cursorPos);
      console.log("currentSentence")
      console.log(currentSentence)
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
  // const renderHighlightedText = () => {
  //   let highlightedText = text;
  //   let offset = 0; // Track the added length to adjust indices
  
  //   suggestions.forEach(({ type, start, end }) => {
  //     const suggestionClass = `highlight-${type}`;
  //     const before = highlightedText.slice(0, start + offset);
  //     const highlighted = `<span class="${styles[suggestionClass]}">${highlightedText.slice(start + offset, end + offset)}</span>`;
  //     const after = highlightedText.slice(end + offset);  
      
  //     highlightedText = before + highlighted + after;

  //     // Adjust the offset by the added length of the HTML tags
  //     offset += highlighted.length - (end - start);
  //   });
  
  //   return { __html: highlightedText };
  // };  

  const handleReplaceText = () => {
    const data = {
      text: "The quick brown fox jumped over the lazi dog",
      correctedText: "The quick brown fox jumped over the lazy dog.",
      // ... your suggestions data
    };
  
    // 1. Identify the sentence in the editor's content
    const editorContent = editor.getContent(); // Get the current content
    const sentenceStart = editorContent.indexOf(data.text); // Find the start index
    const sentenceEnd = sentenceStart + data.text.length; // Calculate the end index
  
    // 2. Replace the sentence
    if (sentenceStart !== -1) {
      // If the sentence is found
      const updatedContent =
        editorContent.substring(0, sentenceStart) +
        data.correctedText +
        editorContent.substring(sentenceEnd);
  
      editor.update({ content: updatedContent });
    }
  };

  // const handleCorrection = () => {
  //   const data = {
  //     text: "The quick brown fox jumped over the lazi dog",
  //     correctedText: "The quick brown fox jumped over the lazy dog.",
  //     // ... your suggestions data
  //   };
  //   if (!editor) return;

  //   // Find the incorrect text in the editor
  //   const content = editor.getHTML();
  //   const wrongText = data.text;
    
  //   // Replace the text while preserving other content
  //   const newContent = content.replace(wrongText, data.correctedText);
  //   editor.commands.setContent(newContent);
  // };

    const handleCorrection = () => {
      if (!editor) return;
  
      const content = editor.getHTML();
      const wrongText = data?.text || "";
      console.log("wrongText.....")
      console.log(wrongText)
      // Create a temporary div to parse HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Find and replace the text while preserving HTML structure
      const textNodes = [];
      const walk = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null
      );
  
      console.log("walk....")
      console.log(walk)
      let node;
      while (node = walk.nextNode()) {
        textNodes.push(node);
      }
  
      console.log("textNodes....")
      console.log(textNodes)  
      textNodes.forEach(node => {
        console.log("node....")
        console.log(node)
        console.log(node.textContent)
        console.log(node.textContent?.includes(wrongText))
        if (node.textContent?.includes(wrongText)) {
          console.log("inIF")
          node.textContent = node.textContent.replace(wrongText, data?.correctedText || 
            ''
          );
        }
      });
  
      editor.commands.setContent(tempDiv.innerHTML);
    };
  

  
  return (
    <div className="suggestions-container"
    style={{
      border: '1px solid #ccc',
      borderRadius: '12px',
      // flex: '8',
      width: '100%',
      // wordWrap: 'break-word', 
      overflowWrap: 'break-word', 
      overflow: 'hidden',
    }}

    >
      {isFirstRender && <p>Start Typing to get suggestions</p>}
<Card className="w-full p-4">
      <Box className="space-y-4">
        {/* Text Comparison Section */}
        <Box className="space-y-2">
          <Typography level="body-sm" className="text-gray-600">
            Original Text:
          </Typography>
          <Box className="p-3 rounded-md bg-red-50 border border-red-200">
            <Typography>{data?.text}</Typography>
          </Box>

          <Typography level="body-sm" className="text-gray-600">
            Corrected Version:
          </Typography>
          <Button
            variant="soft"
            color="success"
            onClick={handleCorrection}
            className="w-full justify-start p-3 text-left"
          >
            <Typography>{data?.correctedText}</Typography>
          </Button>
        </Box>

        {/* Suggestions Section */}
        <Box className="space-y-2">
          <Typography level="body-sm" className="text-gray-600">
            Suggestions:
          </Typography>
          {data?.suggestions?.map((suggestion, index) => {
            const { color, bg } = getSuggestionColor(suggestion.type);
            return (
              <Alert
                key={index}
                color={color as any}
                variant="soft"
                className={`${bg} border`}
              >
                <Box>
                  <Typography className="font-medium capitalize">
                    {suggestion.type}:
                  </Typography>
                  <Typography level="body-sm">
                    {suggestion.message}
                  </Typography>
                </Box>
              </Alert>
            );
          })}
        </Box>
      </Box>
    </Card>
      {/* <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item suggestion-${suggestion.type}`}
          >
            {suggestion.message}
          </div>
        ))}
      </div> */}
    </div>
  );
}
