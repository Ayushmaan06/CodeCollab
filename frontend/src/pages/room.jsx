import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import {
  TopBar,
  ControlBar,
  ShareLinkPopup,
  EscNotification,
  LeaveRoomModal,
  AccessDenied,
  ParticipantsSidebar,
} from "../components";
import CodeEditor from "../components/codeEditor";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.theme.darkMode);

  const [accessDenied, setAccessDenied] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showEscNotification, setShowEscNotification] = useState(false);
  const [lastEscTime, setLastEscTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [leaveTimer, setLeaveTimer] = useState(10);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState(null);

  const editorRef = useRef();
  const socketRef = useRef();

  const toggleCamera = () => setIsCameraOn((prev) => !prev);
  const toggleMic = () => setIsMicOn((prev) => !prev);

  const toggleFullScreenApp = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const toggleSidebar = (content) => {
    if (showSidebar && sidebarContent === content) {
      setShowSidebar(false);
      setSidebarContent(null);
    } else {
      setShowSidebar(true);
      setSidebarContent(content);
    }
  };

  const shareRoomLink = () => setShowSharePopup(true);
  const leaveRoom = () => navigate("/home");

  const handleCodeDownload = () => {
    const code = editorRef.current?.getCode() || "// No code available";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-${roomId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const isAllowed = true; // Replace with your real auth logic
        if (!isAllowed) setAccessDenied(true);
      } catch (err) {
        setAccessDenied(true);
      }
    };

    checkAccess();
  }, [roomId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        const now = Date.now();
        if (now - lastEscTime < 2000) {
          leaveRoom();
        } else {
          setShowEscNotification(true);
          setLastEscTime(now);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastEscTime, isFullscreen]);

  useEffect(() => {
    if (showEscNotification) {
      const timer = setTimeout(() => setShowEscNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showEscNotification]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (hostLeft && leaveTimer > 0) {
      const interval = setInterval(() => {
        setLeaveTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (hostLeft && leaveTimer === 0) {
      leaveRoom();
    }
  }, [hostLeft, leaveTimer]);

  // === SOCKET.IO SETUP ===
  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io(import.meta.env.VITE_BACKEND_API_URL); // Replace with deployed backend if needed

    // Join the room
    socketRef.current.emit("join-room", {
      roomId,
      user: { fullname: "Guest" }, // Add real user data if needed
    });

    // Listen for code updates
    socketRef.current.on("code-update", ({ code }) => {
      // console.log("📤 Received code update:", code);  // Add this
      if (editorRef.current?.getCode() !== code) {
        editorRef.current.setCode(code);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const roomLink = `${window.location.origin}/room/${roomId}`;

  if (accessDenied) return <AccessDenied />;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-[#3C4F67FF]" : "bg-gray-100"}`}>
      <TopBar
        roomId={roomId}
        onCopyCode={() => {
          const code = editorRef.current?.getCode();
          if (code) {
            navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          }
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <ControlBar
          isCameraOn={isCameraOn}
          toggleCamera={toggleCamera}
          isMicOn={isMicOn}
          toggleMic={toggleMic}
          isFullScreenApp={isFullscreen}
          toggleFullScreenApp={toggleFullScreenApp}
          shareRoomLink={shareRoomLink}
          leaveRoom={leaveRoom}
          sidebarContent={sidebarContent}
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
        />

        <div className="flex-1 flex">
          <div className="flex-1 p-2">
            <CodeEditor
              ref={editorRef}
              onCodeChange={(newCode) => {
                // console.log("Typing & emitting code:", newCode); // <--- DEBUG LOG
                if (socketRef.current) {
                  socketRef.current.emit("code-change", { roomId, code: newCode });
                }
              }}
            />
          </div>

          {showSidebar && sidebarContent === "participants" && (
            <ParticipantsSidebar
              projectId={roomId}
              darkMode={isDarkMode}
              onClose={() => setShowSidebar(false)}
            />
          )}
        </div>
      </div>

      <ShareLinkPopup
        show={showSharePopup}
        roomLink={roomLink}
        isCopied={isCopied}
        setIsCopied={setIsCopied}
        onClose={() => setShowSharePopup(false)}
        darkMode={isDarkMode}
      />

      <EscNotification
        show={showEscNotification && isFullscreen}
        darkMode={isDarkMode}
        onClose={() => setShowEscNotification(false)}
      />

      {hostLeft && (
        <LeaveRoomModal
          onDownload={handleCodeDownload}
          onLeave={leaveRoom}
          timer={leaveTimer}
          darkMode={isDarkMode}
        />
      )}

      <button
        onClick={() => {
          setHostLeft(true);
          setLeaveTimer(10);
        }}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50"
      >
        Simulate Host Leaving
      </button>
    </div>
  );
};

export default Room;
