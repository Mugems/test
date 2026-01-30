import { FloatButton } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Wait for the DOM to be ready
    const timer = setTimeout(() => {
      const scrollContainer = document.querySelector('.app-scroll-content');
      
      if (!scrollContainer) {
        console.warn('Scroll container (.app-scroll-content) not found');
        return;
      }

      const handleScroll = () => {
        // Show button when scrolled more than 200px
        const scrolled = scrollContainer.scrollTop > 200;
        setVisible(scrolled);
      };

      // Check initial scroll position
      handleScroll();

      scrollContainer.addEventListener('scroll', handleScroll);

      // Cleanup
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything if not visible
  if (!visible) return null;

  const handleClick = () => {
    const scrollContainer = document.querySelector('.app-scroll-content');
    if (scrollContainer) {
      scrollContainer.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <FloatButton
      icon={<ArrowUpOutlined />}
      onClick={handleClick}
      style={{
        right: 20,
        bottom: 80, // Adjusted to be above footer
        zIndex: 1000,
      }}
      tooltip="Back to Top"
    />
  );
};

export default BackToTopButton;