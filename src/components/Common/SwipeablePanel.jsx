import { DeleteFilled } from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';
import { Image, Modal } from 'antd';

import './Swipeable.css'
const SwipeablePanel = ({
  item,
  titleKey,
  onSwipeRight,
  onSwipeLeft,
  renderContent,
  isExpanded,
  onExpandToggle,
  icon,
  isSwipeOpen = false, // NEW: External control
  onSwipeStateChange // NEW: Callback when swipe state changes
}) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const isScrolling = useRef(false);
  const panelRef = useRef(null);

  const startY = useRef(0);
  const hasNotifiedOpen = useRef(false); // NEW: Track if we've notified parent

  const { confirm } = Modal;
  const SWIPE_THRESHOLD = 60;
  const BUTTON_WIDTH = 70;
  const TAP_THRESHOLD = 10;

  // NEW: Reset offset when another panel opens
  useEffect(() => {
    if (!isSwipeOpen) {
      setOffset(0);
      hasNotifiedOpen.current = false; // Reset flag when closed externally
    }
  }, [isSwipeOpen]);
  useEffect(() => {
    if (isExpanded && panelRef.current) {
    
      setTimeout(() => {
        panelRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [isExpanded]);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isScrolling.current = false;
    hasNotifiedOpen.current = false; // Reset notification flag
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX.current;
    const deltaY = e.touches[0].clientY - startY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isScrolling.current = true;
      return;
    }

    if (!isScrolling.current) {
      // NEW: When user starts swiping, immediately claim this swipe (only once)
      if (Math.abs(deltaX) > 10 && !hasNotifiedOpen.current) {
        hasNotifiedOpen.current = true;
        onSwipeStateChange && onSwipeStateChange(true);
      }
      setOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (isScrolling.current) {
      setOffset(0);
      setIsDragging(false);
      hasNotifiedOpen.current = false;
      return;
    }

    const diff = offset;
    const maxSwipe = BUTTON_WIDTH;

    if (diff > SWIPE_THRESHOLD) {
      setOffset(maxSwipe);
      // NEW: Notify parent that this panel is now open
      if (!hasNotifiedOpen.current) {
        onSwipeStateChange && onSwipeStateChange(true);
        hasNotifiedOpen.current = true;
      }
    } else if (diff < -SWIPE_THRESHOLD) {
      setOffset(-maxSwipe);
      // NEW: Notify parent that this panel is now open
      if (!hasNotifiedOpen.current) {
        onSwipeStateChange && onSwipeStateChange(true);
        hasNotifiedOpen.current = true;
      }
    } else {
      if (Math.abs(diff) < TAP_THRESHOLD) {
        onExpandToggle && onExpandToggle(item);
      }
      setOffset(0);
      hasNotifiedOpen.current = false;
      // NEW: Notify parent that this panel is closed
      onSwipeStateChange && onSwipeStateChange(false);
    }

    setIsDragging(false);
  };

  const backgroundColor = offset > 0 ? '#1890ff' : offset < 0 ? '#ff4d4f' : '#fff';
const addSoftHyphens = (text) => {
  if (!text) return text;

  return text
    
    .replace(/([a-z])([A-Z])/g, '$1\u00AD$2')
    
    .replace(/(.{10})/g, '$1\u00AD');
};

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: backgroundColor,
        transition: isDragging ? 'none' : 'background 0.25s ease-out',
       
        borderRadius: 8,
        padding: 0
      }}
    >
      {/* Left (Edit) button */}
      {onSwipeRight && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: BUTTON_WIDTH,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingLeft: 5,
            color: '#fff',
            fontWeight: 500,
            zIndex: 0
          }}
          onClick={() => {
            onSwipeRight(item);
            setOffset(0);
            hasNotifiedOpen.current = false;
            // NEW: Notify parent that swipe is closed
            onSwipeStateChange && onSwipeStateChange(false);
          }}
        >
          <span className='mdi mdi-pencil' style={{ fontSize: '20px', marginRight: 4 }}></span>
          Edit
        </div>
      )}

      {/* Right (Delete) button */}
      {onSwipeLeft && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: BUTTON_WIDTH,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingRight: 6,
            color: '#fff',
            fontWeight: 500,
            zIndex: 0
          }}
          onClick={() => {
            confirm({
              title: 'Are you sure you want to delete?',
              icon: <DeleteFilled style={{ color: '#ff4d4f' }} />,
              okText: 'Delete',
              cancelText: 'Cancel',
              onOk() {
                onSwipeLeft(item);
                setOffset(0);
                hasNotifiedOpen.current = false;
                // NEW: Notify parent that swipe is closed
                onSwipeStateChange && onSwipeStateChange(false);
              },
              onCancel() {
                setOffset(0);
                hasNotifiedOpen.current = false;
                // NEW: Notify parent that swipe is closed
                onSwipeStateChange && onSwipeStateChange(false);
              },
            });
          }}
        >
          <DeleteFilled /> Delete
        </div>
      )}

      {/* Foreground content */}
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 8,
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out',
          zIndex: 1,
          userSelect: 'none'
        }}
      >
        {/* Header */}
        
        <div
        ref={panelRef}
          className="px-1 py-3 custom-padding"
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
             fontSize: '18px',
           
          }}
          onTouchStart={isExpanded ? null : handleTouchStart}
          onTouchMove={isExpanded ? null : handleTouchMove}
          onTouchEnd={isExpanded ? () => onExpandToggle && onExpandToggle(item) : handleTouchEnd}
        >
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              flex: 1,
              minWidth: 0,
              overflow: 'visible',
              // Reserve space for delete button when swiping left
              marginRight: offset < 0 ? '80px' : 0,
              transition: isDragging ? 'none' : 'margin-right 0.25s ease-out'
            }}
          >
            {item.lineIndex >=1&& (
                <div
             style={{
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "32px",
  height: "32px",
  padding: 0,
  
  border: "1px solid #d9d9d9",
  borderRadius: "6px",
  backgroundColor: "#fff",
  color: "rgba(0, 0, 0, 0.88)",
  fontWeight: 600,
  fontSize: "20px",
  boxShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
  transition: "all 0.2s"
}}

            >
              {item.lineIndex}
            </div>
   ) }
           {icon && <Image src={icon} height={30} width={30} preview={false}/> }
           <h5
  style={{
    margin: 0,
    fontSize: "20px",
    flex: 1,
    minWidth: 0,
    lineHeight: '1.4',

    hyphens: 'auto',
    overflowWrap: 'break-word',
    wordBreak: 'normal'
  }}
>
  {item[titleKey] &&
    addSoftHyphens(
      item[titleKey].charAt(0).toUpperCase() +
      item[titleKey].slice(1)
    )
  }
</h5>

            
          </div>
          <span
            className={`mdi mdi-chevron-${isExpanded ? 'up' : 'down'}`}
            style={{ 
              fontSize: 20, 
              color: '#8c8c8c',
              flexShrink: 0,
              marginRight: 10
            }}
          />
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div style={{ margin: 0, padding:0 }}>
            {renderContent && renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeablePanel;