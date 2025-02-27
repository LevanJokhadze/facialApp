import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

function FaceTracking() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isUploading, setIsUploading] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const [userData, setUserData] = useState(null);
  const intervalRef = useRef(null);
  const hasSentRequestRef = useRef(false);

  useEffect(() => {
    startVideo();
    loadModels();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error(err));
  };

  const loadModels = () => {
    Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('/models')]).then(() => {
      faceMyDetect();
    });
  };

  const takePicture = async () => {
    if (hasSentRequestRef.current) return;
    hasSentRequestRef.current = true;
    
    setHasDetected(true);
    setIsUploading(true);
    
    const video = videoRef.current;
    if (!video) {
      setIsUploading(false);
      hasSentRequestRef.current = false;
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    tempCanvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to capture image.');
        setIsUploading(false);
        hasSentRequestRef.current = false;
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'capture.png');

      try {
        const response = await axios.post('https://facialback.onrender.com/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUserData(response.data.message); // Store the user data
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 'image/png');
  };
  const faceMyDetect = () => {
    if (!hasDetected) {
      intervalRef.current = setInterval(async () => {
        // Exit early if already processed
        if (hasDetected || isUploading || hasSentRequestRef.current) {
          clearInterval(intervalRef.current);
          return;
        }

        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        // Process detections
        let detectionFound = false;
        for (const detection of detections) {
          if (detection.score > 0.6) {
            detectionFound = true;
            break;
          }
        }

        if (detectionFound) {
          takePicture();
          clearInterval(intervalRef.current);
        }

        // Draw detections
        const canvas = canvasRef.current;
        if (canvas) {
          const displaySize = { width: 940, height: 650 };
          faceapi.matchDimensions(canvas, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
        }
      }, 3000);
    }
  };

  return (
    <div className="myapp" style={styles.container}>
      <h1 style={styles.title}>Face Detection</h1>
      
      {hasDetected && (
        <div style={styles.statusWrapper}>
          <div style={styles.status}>
            {isUploading ? "⏳ Processing face..." : "✅ Face captured!"}
          </div>
          
          {userData && (
            <div style={styles.userCard}>
              <h2 style={styles.userTitle}>User Information</h2>
              <div style={styles.userInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>First Name:</span>
                  <span style={styles.value}>{userData.name}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Last Name:</span>
                  <span style={styles.value}>{userData.last_name}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Age:</span>
                  <span style={styles.value}>{userData.age}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={styles.videoContainer}>
        <video 
          crossOrigin="anonymous" 
          ref={videoRef} 
          autoPlay 
          style={styles.videoElement}
        />
        <canvas 
          ref={canvasRef} 
          width="940" 
          height="650" 
          style={styles.canvasElement}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '2rem',
  },
  videoContainer: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  videoElement: {
    width: '100%',
    height: 'auto',
    transform: 'scaleX(-1)', // Mirror the video
  },
  canvasElement: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  statusWrapper: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  status: {
    fontSize: '1.2rem',
    color: '#3498db',
    marginBottom: '1rem',
  },
  userCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginTop: '1rem',
  },
  userTitle: {
    color: '#2c3e50',
    margin: '0 0 1rem 0',
    textAlign: 'center',
  },
  userInfo: {
    display: 'grid',
    gap: '0.8rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
  label: {
    fontWeight: '600',
    color: '#7f8c8d',
    marginRight: '1rem',
  },
  value: {
    color: '#2c3e50',
    fontSize: '1.1rem',
  },
};

export default FaceTracking;