import { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./web.css";

function CameraCapture() {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // Default to 'upload' tab

  // Capture the image with webcam (Upload tab)
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  // Reset the webcam image to retake
  const retake = () => {
    setImage(null);
  };

  // Handle file selection (Save tab)
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle sending only the captured image to the server (Upload tab)
  const handleImageUpload = async () => {
    if (!image) {
      setMessage('Please capture an image first.');
      return;
    }

    const formData = new FormData();
    // Convert the base64 image to a Blob
    const blob = await fetch(image).then(res => res.blob());
    formData.append('file', blob, 'captured-image.jpg');

    try {
      // Send only the image to the Flask server
      const response = await axios.post('https://facialback.onrender.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.error(response);
      setMessage(`Image uploaded successfully!`);
    } catch (error) {
      setMessage('Error uploading image.');
      console.error(error);
    }
  };

  // Handle sending the selected file and additional data to the Flask server (Save tab)
  const handleSaveWithData = async () => {
    if (!selectedFile) {
      setMessage('Please select an image file first.');
      return;
    }
    
    if (!firstName || !lastName || !age) {
      setMessage('Please fill out all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Append additional data to the FormData
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('age', age);

    try {
      // Send the image and additional data to the Flask server
      const response = await axios.post('https://facialback.onrender.com/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { name, last_name } = response.data.message;
      setMessage(`Name: ${name}, Last Name: ${last_name}`);
    } catch (error) {
      setMessage('Error saving data.');
      console.error(error);
    }
  };

  // Reset form when switching tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    setImage(null);
    setSelectedFile(null);
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container">
      <div className="tabs">
        <button 
          className={activeTab === 'upload' ? 'tab-button active' : 'tab-button'}
          onClick={() => switchTab('upload')}
        >
          Upload
        </button>
        <button 
          className={activeTab === 'save' ? 'tab-button active' : 'tab-button'}
          onClick={() => switchTab('save')}
        >
          Save
        </button>
      </div>

      {/* Upload Tab Content - Webcam capture */}
      {activeTab === 'upload' && (
        <div className="tab-content">
          {!image ? (
            <div className="camera-container">
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="webcam" />
              <button
                onClick={capture}
                className="submit"
              >
                Capture Photo
              </button>
            </div>
          ) : (
            <div className="preview-container">
              <img
                src={image}
                alt="Captured"
                className="captured-image"
              />
              <div className="button-group">
                <button onClick={retake} className="secondary-button">
                  Retake
                </button>
                <button onClick={handleImageUpload} className="submit">
                  Upload Photo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Tab Content - File upload with form */}
      {activeTab === 'save' && (
        <div className="tab-content">
          <div className="input-container">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input-field"
            />
            
            <div className="file-input-container">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="file-input"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="file-input-label">
                Browse Image
              </label>
              <span className="file-name">
                {selectedFile ? selectedFile.name : "No file selected"}
              </span>
            </div>
          </div>

          {image && (
            <div className="preview-container">
              <img
                src={image}
                alt="Selected"
                className="captured-image"
              />
              <div className="button-group">
                <button onClick={clearSelectedFile} className="secondary-button">
                  Clear
                </button>
                <button onClick={handleSaveWithData} className="submit">
                  Save Data
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default CameraCapture;