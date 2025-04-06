import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Editor from "@monaco-editor/react";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const CodeEditor = forwardRef(
  ({ socketRef = null, roomId = null, onCodeChange = () => {} }, ref) => {
    const editorRef = useRef(null);
    const [code, setCode] = useState("// Start coding...");
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const darkMode = useSelector((state) => state.theme.darkMode);
    const language = useSelector((state) => state.theme.language || "javascript");
    const fontSize = useSelector((state) => state.theme.fontSize || 14);

    const handleEditorDidMount = (editor) => {
      editorRef.current = editor;
    };

    const handleCodeChange = (newValue) => {
      setCode(newValue);
      onCodeChange(newValue);

      if (socketRef?.current && roomId) {
        socketRef.current.emit("CODE_CHANGE", { roomId, code: newValue });
      }

      setIsTyping(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => setIsTyping(false), 800);
      setTypingTimeout(timeout);
    };

    // 🔥 Add both getCode and setCode for external use
    useImperativeHandle(ref, () => ({
      getCode: () => code,
      setCode: (newCode) => setCode(newCode),
    }));

    useEffect(() => {
      if (!socketRef?.current) return;

      const handleCodeSync = ({ code }) => {
        setCode(code);
      };

      socketRef.current.on("CODE_SYNC", handleCodeSync);

      return () => {
        socketRef.current.off("CODE_SYNC", handleCodeSync);
      };
    }, [socketRef]);

    return (
      <div className="w-full h-screen flex flex-col relative">
        {isTyping && (
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            <Loader2 className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="text-sm text-blue-400 font-medium">Typing...</span>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onMount={handleEditorDidMount}
            onChange={handleCodeChange}
            theme={darkMode ? "vs-dark" : "light"}
            options={{
              fontSize,
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        </div>
      </div>
    );
  }
);

export default CodeEditor;
