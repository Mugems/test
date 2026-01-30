import { Spin } from "antd";
import { ClockCircleOutlined } from '@ant-design/icons';

// Fullscreen overlay loader with timer
const LocationLoadingOverlay = ({ visible, timer }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <Spin size="large" />
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '500',
        color: '#fff',
        textAlign: 'center'
      }}>
        Please wait, we are gathering your location...
      </div>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'bold',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ClockCircleOutlined />
        <span>{timer}s</span>
      </div>
    </div>
  );
};

// Info banner with different states
const LocationInfoBanner = ({ selectedLocation, currentAccuracy, timeTaken, isGettingLocation }) => {
  if (isGettingLocation) {
    return (
      <div style={{ 
        marginBottom: '12px', 
        padding: '10px', 
        background: '#fff7e6', 
        borderRadius: '4px',
        border: '1px solid #ffd591'
      }}>
        <span style={{ fontWeight: '500' }}>⏳ Getting location...</span>
      </div>
    );
  }

  if (selectedLocation && currentAccuracy && timeTaken) {
    return (
      <div style={{ 
        marginBottom: '12px', 
        padding: '10px', 
        background: '#f6ffed', 
        borderRadius: '4px',
        border: '1px solid #b7eb8f'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '500', color: '#52c41a' }}>
            ✅ Location acquired successfully!
          </span>
          <span style={{ fontSize: '13px', color: '#595959' }}>
            📍Accuracy: {currentAccuracy.toFixed(1)} meters | ⏱️ Time taken: {timeTaken}s
          </span>
        </div>
      </div>
    );
  }

  if (selectedLocation && !currentAccuracy && !timeTaken) {
    return (
      <div style={{ 
        marginBottom: '12px', 
        padding: '10px', 
        background: '#e6f7ff', 
        borderRadius: '4px',
        border: '1px solid #91d5ff'
      }}>
        <span style={{ fontWeight: '500', color: '#1890ff' }}>
          📍 Location selected: {selectedLocation.address}
        </span>
      </div>
    );
  }

  return (
    <div style={{ 
      marginBottom: '12px', 
      padding: '10px', 
      background: '#e6f7ff', 
      borderRadius: '4px' 
    }}>
      <span> ! Click anywhere on the map (or) Click "Use Current Location" button</span>
    </div>
  );
};

export { LocationLoadingOverlay, LocationInfoBanner };