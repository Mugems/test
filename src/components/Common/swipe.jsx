import { DeleteFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { useState, useRef } from 'react';
import {Avatar} from 'antd';

const SwipeablePanel = ({
  item,
  titleKey,
  name,
  onSwipeRight,
  onSwipeLeft,
  renderContent,
  isExpanded,
  onExpandToggle,
  disableSwipe,
  avatarSrc
}) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const startX = useRef(0);
  const startTime = useRef(0);

  // 🔹 Start touch
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
    setIsDragging(true);
  };

  // 🔹 Move touch
  const handleTouchMove = (e) => {
    if (disableSwipe || !isDragging) return;
    const diff = e.touches[0].clientX - startX.current;
    setOffset(diff);
  };

  // 🔹 End touch
  const handleTouchEnd = (e) => {
    const diff = offset;
    const elapsed = Date.now() - startTime.current;
    setIsDragging(false);

    const isSwipe = Math.abs(diff) > 60 && elapsed < 600; // strong enough, quick enough
    const isTap = Math.abs(diff) < 10 && elapsed < 300;   // minimal movement

   if (isSwipe) {
  // 👉 Swipe Right (Edit)
  if (diff > 60 && onSwipeRight) {
    onSwipeRight(item);
  }
  // 👈 Swipe Left (Delete)
  else if (diff < -60 && onSwipeLeft) {
    setShowDeleteConfirm(true);
  }} else if (isTap) {
      // 👆 Real tap → toggle expand
      onExpandToggle();
    }

    // Reset offset with smooth animation
    setOffset(0);
  };

  // 🔴 Delete confirm
  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    if (onSwipeLeft) onSwipeLeft(item);
  };

  const getBackgroundColor = () => {
    if (offset > 20) return '#1890ff';
    if (offset < -20) return '#ff4d4f';
    return '#fff';
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {/* Swipe background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: getBackgroundColor(),
            transition: 'background 0.2s ease'
          }}
        >
          <div style={{ color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className='mdi mdi-pencil' style={{ fontSize: '20px' }}></span>
            <span>Edit</span>
          </div>
          <div style={{ color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Delete</span>
            <DeleteFilled style={{ fontSize: '20px' }} />
          </div>
        </div>

        {/* Foreground content */}
        <div
          style={{
            position: 'relative',
            background: '#fff',
            borderRadius: '8px',
            transform: `translateX(${offset}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            userSelect: 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="px-4 py-3"
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
      <Avatar src={avatarSrc} size={36} />
      <h5 style={{ margin: 0, fontWeight: 600, color: '#1677ff' }}>
        {item[titleKey]}
      </h5>
    </div>
            <span
              className={`mdi mdi-chevron-${isExpanded ? 'up' : 'down'}`}
              style={{ fontSize: '20px', color: '#8c8c8c' }}
            ></span>
          </div>

          {isExpanded && (
            <div style={{ marginTop: 8 }}>
              {renderContent && renderContent()}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              margin: '0 16px',
              maxWidth: '400px',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
              <ExclamationCircleOutlined style={{ color: 'red', fontSize: '22px', marginRight: '12px' }} />
              <div>
                <h4 style={{ margin: '0 0 8px 0' }}>
                  Delete {name.split('-').join(' ')} {item[titleKey]?.toUpperCase()}?
                </h4>
                <p style={{ margin: 0, color: '#8c8c8c' }}>Are you sure you want to delete?</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer'
                }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#ff4d4f',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SwipeablePanel;
