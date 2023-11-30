import React, { useState, useRef, useEffect } from "react";

function WebcamCapture({ onCapture }) {
  const [streaming, setStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam(); // Ensure webcam is stopped when component unmounts
    };
  }, []);

  const startWebcam = async () => {
    try {
      const constraints = { video: { facingMode: "user" } }; // Use front-facing camera
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (error) {
      console.error("Error accessing the webcam:", error);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/png");
    onCapture(imageDataUrl);
    stopWebcam(); // Stop the webcam after capturing the image
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: streaming ? "block" : "none" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {!streaming && <button onClick={startWebcam}>Use Webcam Instead</button>}
      {streaming && <button onClick={captureImage}>Capture Image</button>}
    </div>
  );
}

export default WebcamCapture;
