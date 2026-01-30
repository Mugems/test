import { Input, Space } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useState } from "react";

const InputWithAddon = ({ 
  icon, 
  placeholder, 
  value, 
  size = "large", 
  type, 
  onChange, 
  onValueFilter, // NEW: Custom filter function
  ...rest 
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Handle onChange with optional filtering
  const handleChange = (e) => {
    if (onValueFilter) {
      const filteredValue = onValueFilter(e.target.value, e);
      // Create a new event with filtered value
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: filteredValue
        }
      };
      onChange?.(newEvent);
    } else {
      onChange?.(e);
    }
  };

  if (type === "password") {
    return (
      <Space.Compact style={{ width: "100%" }}>
        <Input
          size={size}
          type={passwordVisible ? "text" : "password"}
          value={value}
          onChange={handleChange}
          addonBefore={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {icon}
            </span>
          }
          addonAfter={
            <span
              onClick={() => setPasswordVisible(!passwordVisible)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {passwordVisible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
            </span>
          }
          placeholder={placeholder}
          {...rest}
        />
      </Space.Compact>
    );
  }

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        size={size}
        value={value}
        onChange={handleChange}
        type={type}
        addonBefore={
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {icon}
          </span>
        }
        placeholder={placeholder}
        {...rest}
      />
    </Space.Compact>
  );
};

export default InputWithAddon;