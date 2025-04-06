import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function JoinMeetingPage() {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const isDarkMode = useSelector((state) => state.theme.darkMode);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId) return;
    setLoading(true);

    try {
      const response = await axios.post(
        "/projects/join",
        { joinCode: roomId },
        {
          withCredentials: true, // ✅ Use cookie-based authentication
        }
      );

      if (response.data.success) {
        navigate("/home");
      } else {
        alert("Failed to join project.");
      }
    } catch (err) {
      alert("Invalid Room ID or server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${
        isDarkMode
          ? "bg-[#3C4F67FF]"
          : "bg-gradient-to-br from-[#D1F1D5] to-[#A7C7E7]"
      }`}
    >
      <div
        className={`shadow-xl rounded-2xl border w-[350px] p-6 relative ${
          isDarkMode
            ? "bg-gradient-to-br from-[#1A3C66] to-[#2B7DBD] text-white border-[#CBD5E1]"
            : "bg-gradient-to-br from-[#D1F1D5] to-[#A7C7E7] text-[#1A3C66] border-[#2B7DBD]"
        }`}
      >
        <h2 className="text-xl font-semibold text-center mb-1">Join Meeting</h2>

        <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-300">
          Enter a valid Room ID to join the meeting.
        </p>

        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className={`w-full px-3 py-2 mb-4 rounded-md border font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#2B7DBD] ${
            isDarkMode
              ? "border-gray-500 bg-[#2B7DBD] text-white"
              : "border-gray-300 bg-white text-[#1A3C66]"
          }`}
        />

        <button
          onClick={handleJoin}
          disabled={!roomId || loading}
          className={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
            roomId && !loading
              ? "bg-[#1A3C66] hover:bg-[#2B7DBD] text-white"
              : "bg-gray-500 opacity-50 cursor-not-allowed"
          }`}
        >
          {loading ? "Joining..." : "Join Meeting"}
        </button>
      </div>
    </div>
  );
}
