import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileImg from "../../assets/images/login-logo.png";

import "./Auth-lock-screen.css";
const Auth_lock_Screen = () => {
	const [sliderValue, setSliderValue] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isUnlocked, setIsUnlocked] = useState(false);
	const sliderRef = useRef(null);
	const containerRef = useRef(null);

	const navigate = useNavigate();
useEffect(() => {
  if (isUnlocked) {
    localStorage.removeItem('previousURL');
  }
}, [isUnlocked]);

const Navigatepage = () => {
  const url = localStorage.getItem('previousURL');

  if (url) {
    navigate(url, { replace: true });
  } else {
    navigate(-1); // safest fallback
  }
};

	const handleStart = (e) => {
		setIsDragging(true);
		e.preventDefault();
	};

	const handleMove = (e) => {
		if (!isDragging || isUnlocked) return;

		const container = containerRef.current;
		const containerRect = container.getBoundingClientRect();
		const containerWidth = containerRect.width;
		const sliderWidth = 60; // Width of the slider button
		const maxSlide = containerWidth - sliderWidth;

		let clientX;
		if (e.type === 'touchmove') {
			clientX = e.touches[0].clientX;
		} else {
			clientX = e.clientX;
		}

		const relativeX = clientX - containerRect.left;
		const newValue = Math.max(0, Math.min(maxSlide, relativeX - sliderWidth / 2));
		const percentage = (newValue / maxSlide) * 100;

		setSliderValue(percentage);

		if (percentage >= 80) {
			setIsUnlocked(true);
			setSliderValue(100);
			setTimeout(() => {
				Navigatepage();
			}, 500);
		}
	};

	const handleEnd = () => {
		setIsDragging(false);
		if (!isUnlocked && sliderValue < 80) {
			setSliderValue(0);
		}
	};

	useEffect(() => {
		const handleMouseMove = (e) => handleMove(e);
		const handleMouseUp = () => handleEnd();
		const handleTouchMove = (e) => handleMove(e);
		const handleTouchEnd = () => handleEnd();

		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.addEventListener('touchmove', handleTouchMove, { passive: false });
			document.addEventListener('touchend', handleTouchEnd);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, [isDragging, sliderValue, isUnlocked]);
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (date) => {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	};

	const formatDate = (date) => {
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		});
	};

	return (
		<div className="lock-screen-container">
			<div className="lock-screen-bg">
				<div className="lock-screen-time">
					<div className="time-display">
						{formatTime(currentTime)}
					</div>
					<div className="date-display">
						{formatDate(currentTime)}
					</div>
				</div>


				<div className="lock-screen-profile">
					<div className="profile-avatar">
						<img
							src={profileImg}
							alt="User Avatar"
							className="avatar-image"
						/>
					</div>
					<div className="profile-name">
						Welcome Back
					</div>
				</div>

				<div className="lock-screen-unlock">
					<div className="swipe-unlock-container">
						<div
							ref={containerRef}
							className="swipe-track"
							style={{
								position: 'relative',
								width: '100%',
								maxWidth: '400px',
								height: '70px',
								background: 'rgba(255, 255, 255, 0.1)',
								borderRadius: '35px',
								border: '2px solid rgba(255, 255, 255, 0.3)',
								display: 'flex',
								alignItems: 'center',
								overflow: 'hidden',
								cursor: isDragging ? 'grabbing' : 'grab',
								backdropFilter: 'blur(10px)',
								margin: '0 auto',
							}}
						>
							<div style={{
								position: 'absolute',
								width: '100%',
								textAlign: 'center',
								color: 'rgba(255, 255, 255, 0.8)',
								fontWeight: '500',
								fontSize: '16px',
								zIndex: 1,
								opacity: isUnlocked ? 0 : (sliderValue > 50 ? 0 : 1),
								transition: 'opacity 0.3s ease',
								letterSpacing: '0.5px',
							}}>
								{isUnlocked ? 'Unlocked!' : 'swipe to unlock'}
							</div>

							<div
								ref={sliderRef}
								className="swipe-button"
								style={{
									position: 'absolute',
									left: `calc(${sliderValue}% - ${sliderValue * 0.6}px)`,
									width: '66px',
									height: '66px',
									background: isUnlocked
										? 'linear-gradient(135deg, #00d4aa, #00b894)'
										: 'linear-gradient(135deg, #fff, #f1f3f4)',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
									cursor: isDragging ? 'grabbing' : 'grab',
									transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
									zIndex: 2,
									border: '3px solid #fff',
								}}
								onMouseDown={handleStart}
								onTouchStart={handleStart}
							>
								<i
									className={isUnlocked ? "bx bx-check" : "bx bx-chevron-right"}
									style={{
										fontSize: '28px',
										color: isUnlocked ? '#fff' : '#666',
										transition: 'all 0.3s ease',
									}}
								/>
							</div>

							<div style={{
								position: 'absolute',
								left: 0,
								top: 0,
								height: '100%',
								width: `${sliderValue}%`,
								background: 'linear-gradient(90deg, rgba(0, 212, 170, 0.3), rgba(0, 184, 148, 0.3))',
								borderRadius: '35px',
								transition: isDragging ? 'none' : 'width 0.3s ease',
							}} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export default Auth_lock_Screen;