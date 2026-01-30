// SelectWithAddon.jsx
import { Select } from "antd";

const SelectWithAddon = ({ icon, children, size = "middle",disabled, ...rest }) => {
  // Define heights based on size
  const heights = {
    small: '24px',
    middle: '32px',
    large: '40px'
  };

  const iconWidths = {
    small: '32px',
    middle: '38px',
    large: '44px'
  };

  const height = heights[size] || heights.middle;
  const iconWidth = iconWidths[size] || iconWidths.middle;

  return (
    <div style={{ 
      display: 'flex', 
      border: '1px solid #d9d9d9', 
      borderRadius: '6px',
      overflow: 'hidden',
      height: height,
      backgroundColor: disabled ? '#f5f5f5f':'white' ,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconWidth,
        backgroundColor: '#fafafa',
        borderRight: '1px solid #d9d9d9',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <Select
        bordered={false}
        size={size}
        listHeight={32 * 5}    
        disabled={disabled}
        style={{ 
          flex: 1,
          width: '100%'
        }}
        {...rest}
      >
        {children}
      </Select>
    </div>
  );
};

export default SelectWithAddon;