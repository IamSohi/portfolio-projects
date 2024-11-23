"use client"
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react'; // For protected routes
import Suggestions from '../../components/Suggestions';
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('../../components/Editor'), {
    ssr: false,

})
const Collaboration = dynamic(() => import('../../components/Collaboration'), {
  ssr: false,
});
export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const accessToken = session?.user.accessToken  // Or await getAccessToken()

  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [id, setId] = useState<string | null>(null);
  const editorRef = useRef();   // Add a ref to hold the editor instance

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setId(unwrappedParams.id);
    };

    unwrapParams();
  }, [params]);
  useEffect(() => {
    const fetchDocument = async () => {
      if (id && status === "authenticated") {   // Fetch document data after authentication
        try {
          const accessToken = session?.user.accessToken.accessToken; // Or await getAccessToken()
          console.log("accessToken");
          console.log(accessToken);
          const res = await fetch(`http://127.0.0.1:3000/documents/${id}`, { // API route for fetching document
            headers: { Authorization: `${accessToken}` }
          });
          const data = await res.json();
          console.log(data);
          
          setDocument(data.document);
          setContent(data.document.content);
          setCollaborators(data.document.collaborators);

        } catch (error) {
          console.error('Error fetching document:', error);
          // Handle the error (e.g., display an error message, redirect)
        }
      }

    };

    fetchDocument();
  }, [id, status]); // Run effect when id or login status changes

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleCollaboratorsChange = (collaborators: string[]) => {
    // Handle collaborators change
  };

  const handleSave = async () => { // Update API
      // try {
      //   const accessToken = session?.accessToken;
      //   const response = await fetch(`/api/document/${id}`, {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${accessToken}`
      //     },
      //     body: JSON.stringify({ content })
      //   });
      // } catch (error) {
      //   // Handle the error (e.g., display an error message, redirect)
      // }


  }

  // ... other functions to handle text changes, get suggestions, etc. ...

    return (
      <div>

        {/* <h1>{document?.title}</h1> */}
        {/* <Editor value={content} onChange={(newContent) => setContent(newContent)} editorInstance={editorRef}/> */}
        <Suggestions editor={editorRef.current}/>
        {/* <Collaboration /> - Implement later */}
        {/* <button onClick={handleSave}>Save</button> */}
        <Editor documentId={id} onChange={handleContentChange} value={content} />
             <Collaboration documentId={id} onCollaboratorsChange={handleCollaboratorsChange} />
             <h2>Collaborators:</h2>
             <ul>
                 {collaborators.map((userId) => (
                     <li key={userId}>{userId}</li>
                 ))}
           </ul>
      </div>
    );

}


