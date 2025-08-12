import React from "react";

export default function VideoBackground() {
    
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
        style={{
          filter: 'brightness(0.8)',
        }}
      >
        <source src="/media/video-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }