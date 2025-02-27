import { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./web.css";

function CameraCapture() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [message, setMessage] = useState('');

  // Capture the image
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  // Handle sending the image and additional data to the Flask server
  const handleUpload = async () => {
    if (!image || !firstName || !lastName || !age) {
      setMessage('Please fill out all fields and capture an image.');
      return;
    }

    const formData = new FormData();
    // Convert the base64 image to a Blob
    const blob = await fetch(image).then(res => res.blob());
    formData.append('file', blob, 'captured-image.jpg');  // 'file' should match the Flask route field name

    // Append additional data to the FormData
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('age', age);

      // Send the image and additional data to the Flask server
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    const { name, last_name } = response.data.message;
    setMessage(`Name: ${name}, Last Name: ${last_name}`); // Success message from Flask server
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {!image ? (
        <>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-md shadow-md" />
          <button
            onClick={capture}
            className="submit"
          >
            Capture Photo
          </button>
        </>
      ) : (
        <>
          <img
            src={image}
            alt="Captured"
            className="w-64 rounded-md shadow-md"
          />
          <button
            onClick={handleUpload}
            className="submit"
          >
            Upload Photo
          </button>
        </>
      )}

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

export default CameraCapture;
