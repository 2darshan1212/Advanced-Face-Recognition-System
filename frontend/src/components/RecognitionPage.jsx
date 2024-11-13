import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import Header from "./Header";
import { Button, Card } from "ui-neumorphism";
import { useNavigate } from "react-router-dom";

function Recognize() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedFaces, setRecognizedFaces] = useState([]);
  const [faceLocations, setFaceLocations] = useState([]);
  const navigate = useNavigate();
  let intervalId = useRef(null); // Ref for interval ID to avoid reassignments

  // Start or stop recognition based on the current state
  const toggleRecognition = async () => {
    if (recognizing) {
      clearInterval(intervalId.current); // Clear the interval when stopping
      setRecognizing(false);
      setRecognizedFaces([]);
      setFaceLocations([]);
    } else {
      setRecognizing(true);
      intervalId.current = setInterval(captureAndRecognize, 1000);
    }
  };

  // Capture image from webcam and send it to the backend for recognition
  const captureAndRecognize = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const formData = new FormData();
    formData.append("image", imageSrc);

    try {
      const response = await axios.post(
        "http://localhost:5000/recognize",
        formData
      );
      setRecognizedFaces(response.data.recognized_faces);
      setFaceLocations(response.data.face_locations);
    } catch (error) {
      console.error("Error recognizing faces:", error);
      toggleRecognition(); // Stop recognition on error
    }
  };

  // Draw bounding boxes on the canvas when face locations are updated
  useEffect(() => {
    if (faceLocations.length > 0) {
      drawFaceBoxes();
    }
  }, [recognizedFaces, faceLocations]);

  // Draw face rectangles and labels
  const drawFaceBoxes = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = webcamRef.current.video;

    // Set canvas size to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);

    faceLocations.forEach((location, index) => {
      const [top, right, bottom, left] = location.map((coord) => coord * 4);
      const color = recognizedFaces[index] !== "Unknown" ? "green" : "red";

      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(left, top, right - left, bottom - top);
      context.fillStyle = color;
      context.font = "16px Arial";
      context.fillText(recognizedFaces[index], left + 6, top - 10);
    });
  };

  // Cleanup the interval when component is unmounted
  useEffect(() => {
    return () => clearInterval(intervalId.current);
  }, []);

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <Card>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="900px"
              videoConstraints={{ width: 900 }}
              style={{ position: "relative" }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "900px",
                height: "100%",
                zIndex: 1,
              }}
            />
          </Card>
        </div>
        <div className="flex flex-col justify-around align-middle mr-32">
          <div className="flex flex-col gap-10">
            <Button onClick={() => navigate("/")}>ADD</Button>
            <Button onClick={() => navigate("/attendance")}>ATTENDANCE</Button>
          </div>
          <div>
            <Button onClick={toggleRecognition}>
              {recognizing ? "Stop Recognition" : "Start Recognition"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recognize;
