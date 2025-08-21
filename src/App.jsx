import React, { useState, useEffect } from "react";
import VirtualGallery from "./VirtualGallery";

export default function App() {
  const [currentRoom, setCurrentRoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoomChange = (room) => {
    setIsLoading(true);
    setCurrentRoom(room);
  };

  const handleRoomLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading && (
        <div style={loadingStyle}>
          <h2>Loading Room {currentRoom}...</h2>
        </div>
      )}
      <VirtualGallery
        currentRoom={currentRoom}
        onRoomChange={handleRoomChange}
        onRoomLoaded={handleRoomLoaded}
      />
    </div>
  );
}

const loadingStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.8)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};
