import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Space, message, Slider, Tabs } from 'antd';
import { CameraOutlined, RedoOutlined, CheckOutlined, EditOutlined, RotateRightOutlined, ScissorOutlined } from '@ant-design/icons';

const CameraCapture = ({ onCapture, visible, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const editCanvasRef = useRef(null);
  const cropImageRef = useRef(null);
  const cropContainerRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState('crop');
  
  // Crop states
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Edit states
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraStarted(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      message.error('Failed to access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
    setCapturedImage(null);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      resetEditSettings();
    }
  };

  // Reset edit settings
  const resetEditSettings = () => {
    setRotation(0);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
    setPreviewImage(null);
  };

  // Get relative position - FIXED to handle both mouse and touch
  const getRelativePosition = (clientX, clientY) => {
    if (!cropContainerRef.current) return { x: 0, y: 0 };
    
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    return { 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    };
  };

  // FIXED: Handle both mouse and touch events
  const handleCropStart = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setDragType(type);
    const pos = getRelativePosition(clientX, clientY);
    setDragStart(pos);
  };

  // FIXED: Handle move for both mouse and touch
  const handleMove = (e) => {
    if (!isDragging || !dragType) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const pos = getRelativePosition(clientX, clientY);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;

    setCropArea(prev => {
      let newArea = { ...prev };

      if (dragType === 'move') {
        newArea.x = Math.max(0, Math.min(100 - prev.width, prev.x + deltaX));
        newArea.y = Math.max(0, Math.min(100 - prev.height, prev.y + deltaY));
      } else {
        // Handle corner and edge resizing
        if (dragType.includes('n')) {
          const newY = Math.max(0, Math.min(prev.y + prev.height - 5, prev.y + deltaY));
          newArea.height = prev.height + (prev.y - newY);
          newArea.y = newY;
        }
        if (dragType.includes('s')) {
          newArea.height = Math.max(5, Math.min(100 - prev.y, prev.height + deltaY));
        }
        if (dragType.includes('w')) {
          const newX = Math.max(0, Math.min(prev.x + prev.width - 5, prev.x + deltaX));
          newArea.width = prev.width + (prev.x - newX);
          newArea.x = newX;
        }
        if (dragType.includes('e')) {
          newArea.width = Math.max(5, Math.min(100 - prev.x, prev.width + deltaX));
        }
      }

      return newArea;
    });

    setDragStart(pos);
  };

  // FIXED: Handle end for both mouse and touch
  const handleEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragType(null);
  };

  // Apply crop
  const applyCrop = () => {
    if (!capturedImage) return capturedImage;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = editCanvasRef.current;
        const ctx = canvas.getContext('2d');

        const cropX = (cropArea.x / 100) * img.width;
        const cropY = (cropArea.y / 100) * img.height;
        const cropWidth = (cropArea.width / 100) * img.width;
        const cropHeight = (cropArea.height / 100) * img.height;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = capturedImage;
    });
  };

  // Apply filters
  const applyFilters = (sourceImage) => {
    if (!sourceImage) return sourceImage;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = editCanvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;
        
        canvas.width = newWidth * zoom;
        canvas.height = newHeight * zoom;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.scale(zoom, zoom);
        
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = sourceImage;
    });
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setIsEditing(false);
    resetEditSettings();
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  };

  // Toggle edit mode
  const toggleEdit = async () => {
    if (isEditing) {
      let preview = capturedImage;
      
      const isCropped = cropArea.x !== 10 || cropArea.y !== 10 || 
                       cropArea.width !== 80 || cropArea.height !== 80;
      
      if (isCropped) {
        preview = await applyCrop();
      }
      
      if (rotation !== 0 || zoom !== 1 || brightness !== 100 || contrast !== 100) {
        preview = await applyFilters(preview);
      }
      
      setPreviewImage(preview);
    }
    
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditTab('crop');
    }
  };

  // Reset crop
  const resetCrop = () => {
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
  };

  // Confirm and use photo
  const confirmPhoto = async () => {
    if (capturedImage) {
      try {
        let finalImage = previewImage || capturedImage;
        
        if (!previewImage) {
          const isCropped = cropArea.x !== 10 || cropArea.y !== 10 || 
                           cropArea.width !== 80 || cropArea.height !== 80;

          if (isCropped) {
            finalImage = await applyCrop();
          }

          if (rotation !== 0 || zoom !== 1 || brightness !== 100 || contrast !== 100) {
            finalImage = await applyFilters(finalImage);
          }
        }

        const res = await fetch(finalImage);
        const blob = await res.blob();
        
        const timestamp = new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        }).replace(/[/:,\s]/g, '-');
        
        const file = new File([blob], `camera-${timestamp}.jpg`, { 
          type: 'image/jpeg' 
        });
        
        onCapture(file);
        handleClose();
        message.success('Photo captured and ready to upload!');
      } catch (error) {
        console.error('Error processing photo:', error);
        message.error('Failed to process photo');
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    stopCamera();
    setIsEditing(false);
    resetEditSettings();
    onClose();
  };

  // Rotate image
  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Start camera when modal opens
  useEffect(() => {
    if (visible) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [visible]);

  // FIXED: Add/remove both mouse and touch listeners
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      // Touch events
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, dragStart, dragType]);

  const handleStyle = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: '#1890ff',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 12,
    touchAction: 'none'
  };

  const edgeHandleStyle = {
    position: 'absolute',
    backgroundColor: '#1890ff',
    zIndex: 11,
    touchAction: 'none'
  };

  return (
    <Modal
      title={isEditing ? "Edit Photo" : "Capture Photo"}
      open={visible}
      onCancel={handleClose}
      width={isEditing ? 800 : 700}
      footer={null}
      centered
      destroyOnClose
      style={{ maxWidth: '95vw' }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          position: 'relative', 
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              width: '100%', 
              maxHeight: '400px',
              display: capturedImage ? 'none' : 'block'
            }}
          />
          {capturedImage && !isEditing && (
            <img 
              src={previewImage || capturedImage} 
              alt="Captured" 
              style={{ 
                width: '100%', 
                maxHeight: '400px',
                display: 'block'
              }}
            />
          )}
          {capturedImage && isEditing && (
            <div 
              ref={cropContainerRef}
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxHeight: '400px',
                userSelect: 'none',
                touchAction: 'none'
              }}
            >
              <img 
                ref={cropImageRef}
                src={capturedImage} 
                alt="Edit" 
                style={{ 
                  width: '100%', 
                  maxHeight: '400px',
                  display: 'block',
                  transform: editTab === 'adjust' ? `rotate(${rotation}deg) scale(${zoom})` : 'none',
                  filter: editTab === 'adjust' ? `brightness(${brightness}%) contrast(${contrast}%)` : 'none',
                  transition: editTab === 'adjust' ? 'transform 0.3s ease, filter 0.3s ease' : 'none'
                }}
                draggable={false}
              />
              
              {editTab === 'crop' && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    pointerEvents: 'none',
                    zIndex: 9
                  }} />
                  
                  {/* FIXED: Crop area with touch events */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${cropArea.x}%`,
                      top: `${cropArea.y}%`,
                      width: `${cropArea.width}%`,
                      height: `${cropArea.height}%`,
                      border: '2px solid #1890ff',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                      cursor: 'move',
                      zIndex: 10,
                      touchAction: 'none'
                    }}
                    onMouseDown={(e) => handleCropStart(e, 'move')}
                    onTouchStart={(e) => handleCropStart(e, 'move')}
                  >
                    {/* FIXED: Corner handles with touch events */}
                    <div 
                      style={{...handleStyle, top: '-6px', left: '-6px', cursor: 'nw-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 'nw')}
                      onTouchStart={(e) => handleCropStart(e, 'nw')}
                    />
                    <div 
                      style={{...handleStyle, top: '-6px', right: '-6px', cursor: 'ne-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 'ne')}
                      onTouchStart={(e) => handleCropStart(e, 'ne')}
                    />
                    <div 
                      style={{...handleStyle, bottom: '-6px', left: '-6px', cursor: 'sw-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 'sw')}
                      onTouchStart={(e) => handleCropStart(e, 'sw')}
                    />
                    <div 
                      style={{...handleStyle, bottom: '-6px', right: '-6px', cursor: 'se-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 'se')}
                      onTouchStart={(e) => handleCropStart(e, 'se')}
                    />
                    
                    {/* FIXED: Edge handles with touch events */}
                    <div 
                      style={{...edgeHandleStyle, top: '-2px', left: '20%', right: '20%', height: '4px', cursor: 'n-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 'n')}
                      onTouchStart={(e) => handleCropStart(e, 'n')}
                    />
                    <div 
                      style={{...edgeHandleStyle, bottom: '-2px', left: '20%', right: '20%', height: '4px', cursor: 's-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 's')}
                      onTouchStart={(e) => handleCropStart(e, 's')}
                    />
                    <div 
                      style={{...edgeHandleStyle, left: '-2px', top: '20%', bottom: '20%', width: '4px', cursor: 'w-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 'w')}
                      onTouchStart={(e) => handleCropStart(e, 'w')}
                    />
                    <div 
                      style={{...edgeHandleStyle, right: '-2px', top: '20%', bottom: '20%', width: '4px', cursor: 'e-resize'}} 
                      onMouseDown={(e) => handleCropStart(e, 'e')}
                      onTouchStart={(e) => handleCropStart(e, 'e')}
                    />
                    
                    {/* Grid lines */}
                    <div style={{position: 'absolute', top: '33.33%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.5)'}} />
                    <div style={{position: 'absolute', top: '66.66%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.5)'}} />
                    <div style={{position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.5)'}} />
                    <div style={{position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.5)'}} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing && capturedImage && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '16px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <Tabs 
              activeKey={editTab} 
              onChange={setEditTab}
              items={[
                {
                  key: 'crop',
                  label: <span><ScissorOutlined /> Crop</span>,
                  children: (
                    <div>
                      <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
                        Drag the corners and edges to adjust the crop area. Drag the center to move it.
                      </p>
                      <Button block onClick={resetCrop}>
                        Reset Crop
                      </Button>
                    </div>
                  )
                },
                {
                  key: 'adjust',
                  label: 'Adjust',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Rotation</span>
                          <Button size="small" icon={<RotateRightOutlined />} onClick={rotateImage}>
                            Rotate 90°
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Zoom</span>
                          <span>{zoom.toFixed(1)}x</span>
                        </div>
                        <Slider min={0.5} max={2} step={0.1} value={zoom} onChange={setZoom} />
                      </div>

                      <div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Brightness</span>
                          <span>{brightness}%</span>
                        </div>
                        <Slider min={50} max={150} value={brightness} onChange={setBrightness} />
                      </div>

                      <div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Contrast</span>
                          <span>{contrast}%</span>
                        </div>
                        <Slider min={50} max={150} value={contrast} onChange={setContrast} />
                      </div>

                      <Button block onClick={resetEditSettings}>
                        Reset All
                      </Button>
                    </Space>
                  )
                }
              ]}
            />
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={editCanvasRef} style={{ display: 'none' }} />

        {/* FIXED: Mobile-responsive button layout */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          justifyContent: 'center',
          padding: '0 8px'
        }}>
          {!capturedImage ? (
            <>
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={capturePhoto}
                disabled={!cameraStarted}
                style={{ flex: '1 1 auto', minWidth: '120px' }}
              >
                Capture
              </Button>
              <Button 
                size="large" 
                onClick={handleClose}
                style={{ flex: '1 1 auto', minWidth: '120px' }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="default"
                size="large"
                icon={<RedoOutlined />}
                onClick={retakePhoto}
                style={{ flex: '1 1 auto', minWidth: '100px' }}
              >
                Retake
              </Button>
              <Button
                type={isEditing ? "default" : "primary"}
                size="large"
                icon={<EditOutlined />}
                onClick={toggleEdit}
                style={{ flex: '1 1 auto', minWidth: '100px' }}
              >
                {isEditing ? 'Done' : 'Edit'}
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={confirmPhoto}
                style={{ flex: '1 1 auto', minWidth: '100px' }}
              >
                Use Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CameraCapture;