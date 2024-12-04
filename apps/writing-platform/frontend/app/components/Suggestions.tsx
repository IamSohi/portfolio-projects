// Suggestions.tsx is a component that displays suggestions for improving the text in the editor. It listens for updates to the editor content and fetches suggestions from an API based on the current sentence. The component displays the original text, corrected version, and suggestions for grammar, style, and word choice. It also provides a button to apply the correction to the editor content.
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRoom } from "@liveblocks/react";
import { useSession } from 'next-auth/react';
// import { LiveObject } from '@liveblocks/client';
import { Box, Card, Typography, Button, Alert } from '@mui/joy';

import { Editor } from '@tiptap/core';
// Types
interface Suggestion {
  type: 'grammar' | 'style' | 'word-choice';
  message: string;
}

interface CorrectionData {
  text: string;
  correctedText: string;
  suggestions: Suggestion[];
}

interface Props {
  editor: Editor | null;
  // liveObject: LiveObject<any>;
}

interface ColorScheme {
  color: 'primary' | 'warning' | 'danger' | 'neutral';
  bg: string;
}

// Constants
const DEBOUNCE_DELAY = 1000;
const API_ENDPOINT = 'http://127.0.0.1:3000/suggestions';

// Utility functions
const getSuggestionColor = (type: string): ColorScheme => {
  const colorMap: Record<string, ColorScheme> = {
    'word-choice': { color: 'primary', bg: 'bg-blue-50' },
    'style': { color: 'warning', bg: 'bg-amber-50' },
    'grammar': { color: 'danger', bg: 'bg-red-50' },
    'default': { color: 'neutral', bg: 'bg-gray-50' }
  };

  return colorMap[type] || colorMap.default;
};

const getCurrentSentence = (text: string, cursorPos: number): string => {
  const beforeCursor = text.slice(0, cursorPos);
  const afterCursor = text.slice(cursorPos);
  const start = beforeCursor.lastIndexOf('.') + 1 || 0;
  const end = afterCursor.indexOf('.') + cursorPos + 1 || text.length;
  
  return text.slice(start, end).trim();
};

export default function Suggestions({ editor }: Props) {
  // State
  const [data, setData] = useState<CorrectionData>();
  const [text, setText] = useState<string>('');

  console.log(text)
  // Hooks
  const room = useRoom();
  const { data: session } = useSession();
  const accessToken = session?.user.accessToken;

  // Memoized room storage subscription
  const initializeStorage = useCallback(async () => {
    if (!room) return;

    const { root } = await room.getStorage();
    const suggestionsLiveObject = root.get("suggestionData");

    return room.subscribe(suggestionsLiveObject, () => {
      const updatedSuggestions = suggestionsLiveObject.toImmutable();
      setData(updatedSuggestions);
    });
  }, [room]);

  // API call with error handling
  const fetchSuggestions = useCallback(async (sentence: string) => {
    if (!sentence || !accessToken) return;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${accessToken.accessToken}`
        },
        body: JSON.stringify({ text: sentence })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const result = await response.json();
      const parsedData = result.suggestionData || {
        text: sentence,
        correctedText: sentence,
        suggestions: []
      };

      const { root } = await room.getStorage();
      const suggestionsLiveObject = root.get("suggestionData");
      
      if (suggestionsLiveObject) {
        suggestionsLiveObject.set("text", parsedData.text);
        suggestionsLiveObject.set("correctedText", parsedData.correctedText);
        suggestionsLiveObject.set("suggestions", parsedData.suggestions);
      }

      setData(parsedData);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // You might want to show a toast or error message to the user here
    }
  }, [accessToken, room]);

  // Editor update handler
  const handleEditorUpdate = useCallback(() => {
    if (!editor) return;

    const userInfo = room.getSelf();
    if (userInfo?.presence.role !== "admin") return;

    const currentText = editor.getText();
    const cursorPos = editor.state.selection.head;
    const currentSentence = getCurrentSentence(currentText, cursorPos);

    setText(currentSentence);
    fetchSuggestions(currentSentence);
  }, [editor, room, fetchSuggestions]);

  // Apply correction to editor
  const handleCorrection = useCallback(() => {
    if (!editor || !data) return;

    console.log("IN")
    try {
      const content = editor.getHTML();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      const textNodes = Array.from(tempDiv.querySelectorAll('*'))
        .filter(node => node.childNodes.length === 1 && node.firstChild?.nodeType === Node.TEXT_NODE)
        .map(node => node.firstChild as Text);

      textNodes.forEach(node => {
        if (node.textContent?.includes(data.text)) {
          node.textContent = node.textContent.replace(data.text, data.correctedText);
        }
      });

      console.log(data)

      editor.commands.setContent(tempDiv.innerHTML);
    } catch (error) {
      console.error('Error applying correction:', error);
      // You might want to show a toast or error message to the user here
    }
  }, [editor, data]);

  // Effect for room storage initialization
  useEffect(() => {
    const unsubscribe = initializeStorage();
    return () => {
      unsubscribe.then(unsub => unsub?.());
    };
  }, [initializeStorage]);

  // Effect for editor updates
  useEffect(() => {
    if (!editor) return;

    const debouncedUpdate = debounce(handleEditorUpdate, DEBOUNCE_DELAY);
    editor.on('update', debouncedUpdate);

    return () => {
      editor.off('update', debouncedUpdate);
    };
  }, [editor, handleEditorUpdate]);

  // Custom debounce implementation
  function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  return (
    <div className="suggestions-container"
      style={{
        border: '1px solid #ccc',
        borderRadius: '12px',
        width: '100%',
        overflowWrap: 'break-word',
        overflow: 'hidden',
      }}
    >
      <Card className="w-full p-4">
        <Box className="space-y-4">
          {/* Original Text Section */}
          <TextSection
            label="Original Text:"
            text={data?.text}
            variant="error"
          />

          {/* Corrected Text Section */}
          <TextSection
            label="Corrected Version:"
            text={data?.correctedText}
            variant="success"
            onClick={handleCorrection}
            isButton
          />

          {/* Suggestions Section */}
          <SuggestionsList suggestions={data?.suggestions} />
        </Box>
      </Card>
    </div>
  );
}

// Sub-components
interface TextSectionProps {
  label: string;
  text?: string;
  variant: 'error' | 'success';
  onClick?: () => void;
  isButton?: boolean;
}

function TextSection({ label, text, variant, onClick, isButton }: TextSectionProps) {
  return (
    <Box className="space-y-2">
      <Typography level="body-sm" className="text-gray-600">
        {label}
      </Typography>
      
      {isButton ? (
        <Button
          variant="soft"
          color="success"
          onClick={onClick}
          className="w-full justify-start p-3 text-left"
        >
          <Typography>{text}</Typography>
        </Button>
      ) : (
        <Box className={`p-3 rounded-md ${variant === 'error' ? 'bg-red-50 border border-red-200' : ''}`}>
          <Typography>{text}</Typography>
        </Box>
      )}
    </Box>
  );
}

interface SuggestionsListProps {
  suggestions?: Suggestion[];
}

function SuggestionsList({ suggestions }: SuggestionsListProps) {
  if (!suggestions?.length) return null;

  return (
    <Box className="space-y-2">
      <Typography level="body-sm" className="text-gray-600">
        Suggestions:
      </Typography>
      {suggestions.map((suggestion, index) => {
        const { color, bg } = getSuggestionColor(suggestion.type);
        return (
          <Alert
            key={index}
            color={color}
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
  );
}