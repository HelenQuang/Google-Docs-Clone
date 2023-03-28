import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import { Value } from 'react-quill';
import { useRouter } from 'next/router';

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

const SAVE_INTERVAL_MS = 2000; //Autosave after 2s

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block', 'link'],
  ['clean'],
];

const TextEditor = () => {
  const router = useRouter();
  const [editorHtml, setEditorHtml] = useState<Value>('');
  const [socket, setSocket] = useState<Socket>();
  const documentId = router.query.id;

  useEffect(() => {
    const newSocket = io('http://localhost:7000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket?.once('load-document', (document) => {
      setEditorHtml(document);
    });

    socket?.emit('get-document', documentId);
  }, [documentId, socket]);

  return (
    <QuillNoSSRWrapper
      onChange={(content, delta, source) => {
        if (source !== 'user') return;
        socket?.emit('send-changes', content);

        const handler = (content: string) => {
          setEditorHtml(content);
        };

        socket?.on('receive-changes', handler);
        socket?.emit('save-document', content);
      }}
      theme='snow'
      value={editorHtml}
      modules={{ toolbar: TOOLBAR_OPTIONS }}
    />
  );
};

export default TextEditor;
