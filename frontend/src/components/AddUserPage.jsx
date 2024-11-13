import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify components
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles

import Header from "./Header";
import "ui-neumorphism/dist/index.css";
import { Card, TextField } from "ui-neumorphism";

function AddUser() {
  const [name, setName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const capture = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const formData = new FormData();
      formData.append("image", imageSrc);
      formData.append("name", name);
      formData.append("enrollment_number", enrollmentNumber);
      formData.append("semester", semester);

      const response = await axios.post(
        "http://localhost:5000/add-user",
        formData
      );

      if (response.data.success) {
        toast.success("User added successfully!"); // Show success toast
        setName(""); // Clear name field
        setEnrollmentNumber(""); // Clear enrollment field
        setSemester(""); // Clear semester field
      } else {
        toast.error(response.data.error || "Error adding user!"); // Show error toast
      }
    } catch (error) {
      toast.error("An error occurred. Please try again."); // Show error toast
    }
  };

  return (
    <div className="flex flex-col  h-fit w-auto ">
      <Header />
      <div className="flex p-5 justify-center">
        <Card className="flex flex-row-reverse gap-10 p-5 rounded-md bg-blue-200 shadow-lg">
          <Card className="flex flex-col gap-4 font-semibold p-6 w-80">
            <TextField
              id="name"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="p-2 rounded-lg border border-gray-400"
            />
            <TextField
              id="enrollmentNumber"
              type="text"
              placeholder="Enrollment Number"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              required
              className="p-2 rounded-lg border border-gray-400"
            />
            <TextField
              id="semester"
              type="text"
              placeholder="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
              className="p-2 rounded-lg border border-gray-400"
            />
            <button
              onClick={capture}
              className="mt-4 bg-green-700 hover:bg-green-800 text-white rounded-lg p-3"
              disabled={loading}
            >
              {loading ? "Adding..." : "Capture & Add User"}
            </button>
          </Card>
          <div className="flex justify-center items-center w-80 h-auto">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg shadow-lg"
              width="300px"
            />
          </div>
        </Card>
      </div>
      <ToastContainer />{" "}
      {/* Add the ToastContainer to render toast notifications */}
    </div>
  );
}

export default AddUser;