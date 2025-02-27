import { useState } from 'react';
import './App.css';
import CameraCapture from './Components/Webcam';
import FaceTracking from './Components/FaceTracking';

function App() {
  const [isV1Active, setIsV1Active] = useState(true);

  return (
    <div className="app-container">
      <div className="version-switcher">
        <div className="switch-container">
          <span className="version-label">V1</span>
          <button 
            className={`switch ${isV1Active ? 'v1-active' : 'v2-active'}`}
            onClick={() => setIsV1Active(!isV1Active)}
          >
            
            <span className="slider"></span>
          </button>
          <span className="version-label">V2</span>
        </div>
      </div>

      {isV1Active ? <CameraCapture /> : <FaceTracking />}
    </div>
  );
}

export default App;